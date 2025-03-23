import React from 'react';
import { useBestRatedBooks } from '../../../lib/customHooks';
import BookItem from '../BookItem/BookItem';
import styles from './BestRatedBooks.module.css';

function BestRatedBooks() {
  const { bestRatedBooks } = useBestRatedBooks();

  const bestRatedBooksContent = bestRatedBooks.length > 0 ? (
    bestRatedBooks.map((elt, index) => (
      <BookItem
        key={`book-${elt.bookId ?? `fallback-${index}`}`}
        book={elt}
        size={3}
      />
    ))
  ) : (
    <h3>Aucune recommandation</h3>
  );

  return (
    <section className={styles.BestRatedBooks}>
      <div className={styles.List}>
        {bestRatedBooksContent}
      </div>
    </section>
  );
}

export default BestRatedBooks;
