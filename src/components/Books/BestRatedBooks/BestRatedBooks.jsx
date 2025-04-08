import React, { useRef } from 'react';
import { useBestRatedBooks } from '../../../lib/customHooks';
import BookItem from '../BookItem/BookItem';
import styles from './BestRatedBooks.module.css';

function BestRatedBooks() {
  const { bestRatedBooks } = useBestRatedBooks();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const content = bestRatedBooks.length > 0 ? (
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
      <button className={styles.NavButton} onClick={() => scroll('left')}>
        ‹
      </button>
      <div className={styles.List} ref={scrollRef}>
        {content}
      </div>
      <button className={styles.NavButton} onClick={() => scroll('right')}>
        ›
      </button>
    </section>
  );
}

export default BestRatedBooks;
