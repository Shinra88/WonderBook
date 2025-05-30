import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookByTitle, updateBookInfo } from '../../services/bookService';
import { addBookToCollection, removeBookFromCollection, getUserCollection } from '../../services/collectionService';
import BookDisplay from '../../components/Books/BookDisplay/BookDisplay';
import Banner from '../../images/library.png';
import { useAuth } from '../../hooks/useAuth';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import BackArrow from '../../components/BackArrow/BackArrow';
import avatarDefault from '../../images/avatar.png';
import { displayStars } from '../../utils/helpers';
import logoFnac from '../../images/logos/fnac.svg';
import logoAmazon from '../../images/logos/amazon.svg';
import logoCultura from '../../images/logos/cultura.png';
import logoCdiscount from '../../images/logos/cdiscount.svg';
import logoeBay from '../../images/logos/ebay.svg';
import FeatherIcon from '../../images/feather.png';
import CommentModerationModal from '../../modals/CommentModerationModal/CommentModerationModal';
import BookFormModal from '../../modals/BookFormModal/BookFormModal';

import styles from './Book.module.css';

function Book() {
  const { title } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inCollection, setInCollection] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentModerationModal, setShowCommentModerationModal] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  useEffect(() => {
    async function fetchBookAndCollection() {
      try {
        const data = await getBookByTitle(title);
        if (data) {
          setBook(data);
          if (user) {
            const collection = await getUserCollection();
            const bookInCollection = collection?.find(item => item.bookId === data.bookId);
            if (bookInCollection) setInCollection(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du livre :', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookAndCollection();
  }, [title, user]);

  const handleAddToCollection = async () => {
    setButtonLoading(true);
    try {
      await addBookToCollection(book.bookId);
      setInCollection(true);
      ToastSuccess('Livre ajouté à votre collection 📚');
    } catch (error) {
      console.error('Erreur ajout collection :', error);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleRemoveFromCollection = async () => {
    setButtonLoading(true);
    try {
      await removeBookFromCollection(book.bookId);
      setInCollection(false);
      ToastSuccess('Livre retiré de votre collection 📚');
    } catch (error) {
      console.error('Erreur retrait collection :', error);
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading) return <h1 className={styles.center}>Chargement ...</h1>;
  if (!book) return <h1 className={styles.center}>Livre non trouvé</h1>;

  return (
    <div className={styles.BookPage}>
      <div className={styles.banner} style={{ backgroundImage: `url(${Banner})` }} />
      <main className={styles.main}>
        <div className={styles.BookContainer}>
          <div className={styles.backArrowWrapper}><BackArrow /></div>
          <div className={styles.BookImage} style={{ backgroundImage: `url(${encodeURI(book.cover_url)})` }} />

          <article className={styles.BookContent}>
            <div className={styles.bookDisplayWrapper}>
              <BookDisplay book={book} size={2} showDetails hideImage />
            </div>
          </article>

          <aside className={styles.BookAside}>
            {!isAdmin && (
              <section className={styles.commercialLinks}>
                <h3>Où acheter ce livre :</h3>
                <ul className={styles.linkList}>
                  <li><a href={`https://www.fnac.com/SearchResult/ResultList.aspx?SCat=Livres__+BD__+Ebooks!1&SDM=list&Search=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer"><img src={logoFnac} alt="Fnac" className={styles.logo} /> Fnac</a></li>
                  <li><a href={`https://www.amazon.fr/s?k=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer"><img src={logoAmazon} alt="Amazon" className={styles.logo} /> Amazon</a></li>
                  <li><a href={`https://www.cultura.com/search/results?search_query=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer"><img src={logoCultura} alt="Cultura" className={styles.logo} /> Cultura</a></li>
                  <li><a href={`https://www.cdiscount.com/search/10/${encodeURIComponent(title)}.html`} target="_blank" rel="noopener noreferrer"><img src={logoCdiscount} alt="Cdiscount" className={styles.logo} /> Cdiscount</a></li>
                  <li><a href={`https://www.ebay.fr/sch/267/i.html?_nkw=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer"><img src={logoeBay} alt="eBay" className={styles.logo} /> eBay</a></li>
                </ul>
              </section>
            )}

            {user && !inCollection && (
              <button className={styles.addButton} onClick={handleAddToCollection} disabled={buttonLoading}>
                {buttonLoading ? 'Ajout...' : 'Ajouter à ma collection'}
              </button>
            )}
            {user && inCollection && (
              <button className={styles.removeButton} onClick={handleRemoveFromCollection} disabled={buttonLoading}>
                {buttonLoading ? 'Retrait...' : 'Retirer de ma collection'}
              </button>
            )}

            {isAdmin && (
              <>
                <button className={styles.editButton} onClick={() => setShowEditModal(true)}>
                  Modifier le livre <img src={FeatherIcon} alt="" className={styles.icon} />
                </button>
                <button className={styles.editButton} onClick={() => setShowCommentModerationModal(true)}>
                  Gérer commentaires <img src={FeatherIcon} alt="" className={styles.icon} />
                </button>
              </>
            )}

            {showEditModal && (
              <BookFormModal
                mode="update"
                book={book}
                onSave={async (updatedData) => {
                  const result = await updateBookInfo(book.bookId, updatedData);
                  if (!result.error) {
                    const refreshed = await getBookByTitle(updatedData.title || book.title);
                    setBook(refreshed);
                    ToastSuccess('Livre mis à jour ✅');
                  }
                  setShowEditModal(false);
                }}
                onClose={() => setShowEditModal(false)}
              />
            )}

            {showCommentModerationModal && (
              <CommentModerationModal
                bookId={book.bookId}
                comments={book.comments}
                onClose={() => setShowCommentModerationModal(false)}
                onUpdate={(updatedComments) => setBook((prev) => ({ ...prev, comments: updatedComments }))}
              />
            )}

            {book.comments?.length > 0 && (
              <section className={styles.commentsSection}>
                <button
                  type="button"
                  className={styles.toggleComments}
                  onClick={() => setShowComments(prev => !prev)}
                >
                  {showComments ? 'Masquer les commentaires' : `Voir les commentaires (${book.comments.length})`}
                </button>

                {showComments && (
                  <div className={styles.commentsList}>
                    {book.comments.map((comment) => (
                      <div key={comment.commentId} className={styles.commentItem}>
                        <img src={comment.user?.avatar || avatarDefault} alt="Avatar" className={styles.commentAvatar} />
                        <div className={styles.commentContentWrapper}>
                          <p className={styles.commentContent}>« {comment.content} »</p>
                          <p className={styles.commentAuthor}>— {comment.user?.name || 'Anonyme'} le {new Date(comment.created_at).toLocaleDateString('fr-FR')}</p>
                          <div className={styles.commentRating}>{displayStars(comment.rating ?? 0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Book;
