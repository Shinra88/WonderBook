import { useState, useEffect } from 'react';
import { getUserCollection, updateBookReadStatus } from '../../services/collectionService';
import { useFilters } from '../../hooks/filterContext';
import BookDisplay from '../../components/Books/BookDisplay/BookDisplay';
import CommentModal from '../../modals/CommentModal/CommentModal';
import { addOrUpdateComment } from '../../services/commentService';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import Banner from '../../images/library.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { uploadEbookToS3 } from '../../services/uploadServices';
import { useTranslation } from 'react-i18next';
import styles from './Collection.module.css';

function Collection() {
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterReadStatus, setFilterReadStatus] = useState('all');
  const [filterCommented, setFilterCommented] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [activeUploadId, setActiveUploadId] = useState(null);
  const { user } = useAuth();
  const { selectedCategories, selectedYear, selectedType, searchQuery } = useFilters();
  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const isAdmin = user?.role === 'admin' || user?.role === 'prenium';

  useEffect(() => {
    async function fetchCollection() {
      try {
        const query = { commented: filterCommented };
        if (filterReadStatus === 'read') query.read = true;
        if (filterReadStatus === 'unread') query.read = false;
        const data = await getUserCollection(query);
        setAllBooks(data);
      } catch (error) {
        console.error(t('Collection.Error'), error);
      } finally {
        setLoading(false);
      }
    }
    fetchCollection();
  }, [filterReadStatus, filterCommented]);

  const filterBooks = () => {
    return allBooks.filter((item) => {
      const book = item.books;
      if (!book) return false;
      if (filterReadStatus === 'read' && item.is_read !== true) return false;
      if (filterReadStatus === 'unread' && item.is_read === true) return false;
      if (filterCommented) {
        if (!book.comments || !book.comments.some(comment => comment.userId === item.userId)) return false;
      }

      let categoryPass = true;
      if (selectedCategories.length > 0) {
        const bookCategories = book.book_categories?.map(bc => bc.categories.name) || [];
        categoryPass = selectedType === 'et'
          ? selectedCategories.every(cat => bookCategories.includes(cat))
          : selectedCategories.some(cat => bookCategories.includes(cat));
      }

      let yearPass = true;
      if (selectedYear) {
        const bookYear = book.date ? new Date(book.date).getFullYear() : null;
        if (typeof selectedYear === 'string' && selectedYear.length === 4) {
          yearPass = parseInt(selectedYear) === bookYear;
        } else if (typeof selectedYear === 'object' && selectedYear.start && selectedYear.end) {
          const start = parseInt(selectedYear.start);
          const end = parseInt(selectedYear.end);
          if (!isNaN(start) && !isNaN(end)) {
            yearPass = bookYear >= start && bookYear <= end;
          }
        }
      }

      let searchPass = true;
      if (searchQuery.trim() !== '') {
        const lower = searchQuery.toLowerCase();
        searchPass = (book.title?.toLowerCase().includes(lower) || book.author?.toLowerCase().includes(lower));
      }

      return categoryPass && yearPass && searchPass;
    });
  };

  const filteredBooks = filterBooks();

  return (
    <div className={styles.Collection} style={backgroundImageStyle}>
      <main className={styles.main}>
        <header className={styles.head}>
          <h2>{t('Collection.Title')}</h2>
          <p>{t('Collection.NumberOfBooks', { count: filteredBooks.length })}</p>
          <div className={styles.filterContainer}>
            <label className={styles.filterToggle}>{t('Collection.Filters')} :</label>
            <div className={styles.radioGroup}>
              <label><input type="radio" name="readStatus" value="all" checked={filterReadStatus === 'all'} onChange={() => setFilterReadStatus('all')} /> {t('Collection.FilterAll')}</label>
              <label><input type="radio" name="readStatus" value="read" checked={filterReadStatus === 'read'} onChange={() => setFilterReadStatus('read')} /> {t('Collection.FilterRead')}</label>
              <label><input type="radio" name="readStatus" value="unread" checked={filterReadStatus === 'unread'} onChange={() => setFilterReadStatus('unread')} /> {t('Collection.FilterUnread')}</label>
            </div>
            <label htmlFor="commented" className={styles.filterToggle}>
              <input type="checkbox" id="commented" checked={filterCommented} onChange={() => setFilterCommented(prev => !prev)} /> {t('Collection.FilterCommented')}                                           
            </label>
          </div>
        </header>

        <section className={styles.bookList}>
          {loading ? (
            <h1>{t('Loading')}...</h1>
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map((item) => {
              const userComment = item.books.comments?.find(comment => comment.userId === item.userId);
              const userRating = userComment ? userComment.rating : 0;
              return (
                <div key={item.collectionId} className={styles.bookItemWrapper}>
                  <BookDisplay
                    book={{
                      bookId: item.books.bookId,
                      title: item.books.title,
                      author: item.books.author,
                      date: item.books.date,
                      cover_url: item.books.cover_url,
                      summary: item.books.summary,
                      ratings: item.books.ratings || [],
                      averageRating: userRating,
                      editors: item.books.book_publishers?.map(bp => bp.publishers.name) || [],
                      categories: item.books.book_categories?.map(bc => bc.categories.name) || [],
                    }}
                    size={2}
                  />
                  <div className={styles.bookStatus}>
                    <div className={styles.statusItem}>
                      <input type="checkbox" checked={item.is_read} disabled={item.is_read} onChange={async () => {
                        if (!item.is_read) {
                          try {
                            await updateBookReadStatus(item.books.bookId, true);
                            setAllBooks(prev => prev.map(b => b.collectionId === item.collectionId ? { ...b, is_read: true } : b));
                          } catch (error) {
                            console.error(t('Collection.ErrorUpdate'), error);
                          }
                        }
                      }} />
                      <span>{t('Collection.FilterRead')}</span>
                    </div>

                    {isAdmin && !item.books.ebook_url && (
                      <div className={styles.statusItem}>
                        <button
                          className={styles.uploadEbookButton}
                          onClick={() => setActiveUploadId(prev => prev === item.collectionId ? null : item.collectionId)}
                        >
                          {activeUploadId === item.collectionId ? t('Collection.Cancel') : t('Collection.UploadEbook')}
                        </button>

                        {activeUploadId === item.collectionId && (
                          <div className={styles.uploadFieldWrapper}>
                            <input
                              type="file"
                              accept=".epub"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                try {
                                  const ebookUrl = await uploadEbookToS3(file, item.books.bookId);
                                  if (!ebookUrl) return;

                                  setAllBooks(prev =>
                                    prev.map(b =>
                                      b.collectionId === item.collectionId
                                        ? { ...b, books: { ...b.books, ebook_url: ebookUrl } }
                                        : b
                                    )
                                  );
                                  setActiveUploadId(null);
                                  ToastSuccess(t('Collection.UploadSuccess'));
                                } catch (err) {
                                  console.error(t('Collection.ErrorUpload'), err);
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {item.is_read && (
                      <div className={styles.statusItem}>
                        <button className={styles.commentButton} onClick={() => {
                          const existingComment = item.books.comments?.find(comment => comment.userId === item.userId);
                          setSelectedBook({
                            ...item.books,
                            existingComment: existingComment || null,
                            rating: existingComment?.rating || 0,
                          });
                          setIsCommentModalOpen(true);
                        }}>
                          {item.books.comments?.some(comment => comment.userId === item.userId)
                            ? t('Collection.EditComment')
                            : t('Collection.Commenter')}
                        </button>
                      </div>
                    )}
                    {item.books.ebook_url && (
                      <div className={styles.statusItem}>
                          <button
                            className={styles.commentButton}
                            onClick={() => navigate(`/read/${item.books.bookId}`)}
                          >
                            {t('Collection.ReadEbook')}
                          </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <h1>{t('Collection.NoBooksFound')}</h1>
          )}
        </section>

        {isCommentModalOpen && selectedBook && (
          <CommentModal
            book={selectedBook}
            onClose={() => {
              setIsCommentModalOpen(false);
              setSelectedBook(null);
            }}
            onSubmit={async (content, rating) => {
              try {
                await addOrUpdateComment(selectedBook.bookId, { content, rating });
                setToastMessage(t('Collection.CommentSuccess'));
                setIsCommentModalOpen(false);
                setSelectedBook(null);
                setTimeout(() => setToastMessage(''), 3000);
              } catch (error) {
                console.error(t('Collection.CommentError'), error);
              }
            }}
          />
        )}

        {toastMessage && <ToastSuccess message={toastMessage} />}
      </main>
    </div>
  );
}

export default Collection;
