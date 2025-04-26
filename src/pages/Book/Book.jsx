import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Book.module.css';
import { getBookByTitle } from '../../services/bookService';
import BookDisplay from '../../components/Books/BookDisplay/BookDisplay';
import Banner from '../../images/library.png';

function Book() {
  const { title } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      const data = await getBookByTitle(title);
      console.log(data);
      if (data) setBook(data);
      setLoading(false);
    }
    fetchBook();
  }, [title]);

  if (loading) return <h1 className={styles.center}>Chargement ...</h1>;
  if (!book) return <h1 className={styles.center}>Livre non trouvé</h1>;

  return (
    <div className={styles.BookPage}>
      <div className={styles.banner} style={{ backgroundImage: `url(${Banner})` }} />
      <main className={styles.main}>
        <div className={styles.BookContainer}>
        <div className={styles.BookImage} style={{ backgroundImage: `url(${encodeURI(book.cover_url)})` }} />
        <div className={styles.BookContent}>
            <BookDisplay book={book} size={2} showDetails hideImage />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Book;
