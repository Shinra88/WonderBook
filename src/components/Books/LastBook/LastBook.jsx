import React from 'react';
import { useBestRatedBooks } from '../../../lib/customHooks';
import BookItem from '../BookItem/BookItem';
import styles from './LastBook.module.css';

function BestRatedBooks() {
  const { bestRatedBooks } = useBestRatedBooks();

  const bestRatedBooksContent = bestRatedBooks.length > 0 ? (
    bestRatedBooks.map((elt) => 
    <BookItem 
      key={`book-${elt.bookId ?? `fallback-${index}`}`}
      book={elt} size={3} />)
  ) : <h3>Aucune recommendation</h3>;

  return (
    <section className={styles.LastBook}>
      <div className={styles.List}>
        {bestRatedBooksContent}
      </div>
    </section>
  );
}

export default BestRatedBooks;
