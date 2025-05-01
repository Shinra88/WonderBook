import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookByTitle } from '../../services/bookService';
import { addBookToCollection, removeBookFromCollection, getUserCollection } from '../../services/collectionService';
import BookDisplay from '../../components/Books/BookDisplay/BookDisplay';
import Banner from '../../images/library.png';
import { useAuth } from '../../hooks/useAuth';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import BackArrow  from '../../components/BackArrow/BackArrow';
import avatarDefault from '../../images/avatar.png';
import { displayStars } from '../../utils/helpers';
import logoFnac from '../../images/logos/fnac.svg';
import logoAmazon from '../../images/logos/amazon.svg';
import logoCultura from '../../images/logos/cultura.png';
import styles from './Book.module.css';



function Book() {
  const { title } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inCollection, setInCollection] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  const encodedTitle = encodeURIComponent(title || '');
  const searchFnac = `https://www.fnac.com/SearchResult/ResultList.aspx?SCat=Livres__+BD__+Ebooks!1&SDM=list&Search=${encodedTitle}`;
  const searchAmazon = `https://www.amazon.fr/s?k=${encodedTitle}&rh=n%3A301061&dc`;
  const searchCultura = `https://www.cultura.com/search/results?search_query=${encodedTitle}&category_id=13668`;

  useEffect(() => {
    async function fetchBookAndCollection() {
      try {
        const data = await getBookByTitle(title);
        if (data) {
          setBook(data);
          if (user) {
            const collection = await getUserCollection();
            if (collection && Array.isArray(collection)) {
              const bookInCollection = collection.find(item => item.bookId === data.bookId);
              if (bookInCollection) {
                setInCollection(true);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du livre ou de la collection :', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookAndCollection();
  }, [title, user]);

  if (loading) return <h1 className={styles.center}>Chargement ...</h1>;
  if (!book) return <h1 className={styles.center}>Livre non trouvé</h1>;

  const handleAddToCollection = async () => {
    setButtonLoading(true);
    try {
      await addBookToCollection(book.bookId);
      setInCollection(true);
      ToastSuccess('Livre ajouté à votre collection 📚');
    } catch (error) {
      console.error('Erreur lors de l’ajout à la collection :', error);
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
      console.error('Erreur lors du retrait de la collection :', error);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <div className={styles.BookPage}>
      <div className={styles.banner} style={{ backgroundImage: `url(${Banner})` }} />
      <main className={styles.main}>
        <div className={styles.BookContainer}>
        <BackArrow />
          <div className={styles.BookImage} style={{ backgroundImage: `url(${encodeURI(book.cover_url)})` }} />
          <article className={styles.BookContent}>
            <BookDisplay book={book} size={2} showDetails hideImage />

            <section className={styles.edit}>
              {user && !inCollection && (
                <button
                  className={styles.addButton}
                  onClick={handleAddToCollection}
                  disabled={buttonLoading}
                >
                  {buttonLoading ? 'Ajout...' : 'Ajouter à ma collection'}
                </button>
              )}
              {user && inCollection && (
                <button
                  className={styles.removeButton}
                  onClick={handleRemoveFromCollection}
                  disabled={buttonLoading}
                >
                  {buttonLoading ? 'Retrait...' : 'Retirer de ma collection'}
                </button>
              )}
            </section>

            {/* 💬 SECTION COLLAPS COMMENTAIRES */}
            {book.comments && book.comments.length > 0 && (
              <section className={styles.commentsSection}>
                <button
                  type="button"
                  className={styles.toggleComments}
                  onClick={() => setShowComments(prev => !prev)}
                >
                  {showComments
                    ? 'Masquer les commentaires'
                    : `Voir les commentaires (${book.comments.length})`}
                </button>

                {showComments && (
                  <div className={styles.commentsList}>
                    {book.comments.map((comment) => {
                      return (
                        <div key={comment.commentId} className={styles.commentItem}>
                          <img
                            src={comment.user?.avatar || avatarDefault}
                            alt="Avatar"
                            className={styles.commentAvatar}
                          />
                          <div className={styles.commentContentWrapper}>
                            <p className={styles.commentContent}>« {comment.content} »</p>
                            <p className={styles.commentAuthor}>
                              — {comment.user?.name || 'Anonyme'} le {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                            </p>
                            {/* Affichage de la note du commentaire */}
                            <div className={styles.commentRating}>
                              {displayStars(comment.rating ?? 0)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
              
            )}
<section className={styles.commercialLinks}>
  <h3>Où acheter ce livre :</h3>
  <ul className={styles.linkList}>
    <li>
      <a href={searchFnac} target="_blank" rel="noopener noreferrer">
        <img src={logoFnac} alt="Fnac" className={styles.logo} /> Fnac
      </a>
    </li>
    <li>
      <a href={searchAmazon} target="_blank" rel="noopener noreferrer">
        <img src={logoAmazon} alt="Amazon" className={styles.logo} /> Amazon
      </a>
    </li>
    <li>
      <a href={searchCultura} target="_blank" rel="noopener noreferrer">
        <img src={logoCultura} alt="Cultura" className={styles.logo} /> Cultura
      </a>
    </li>
  </ul>
</section>

          </article>
        </div>
      </main>
    </div>
  );
}

export default Book;
