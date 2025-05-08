import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import BookDisplay from '../BookDisplay/BookDisplay';
import styles from './LastBook.module.css';

function LastBooks({ lastAddedBooks = [], loading = false }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (loading) return <h3>Chargement des derniers livres...</h3>;

  const content = lastAddedBooks.length > 0 ? (
    lastAddedBooks.map((book, index) => (
      <BookDisplay
        key={`book-${book.bookId ?? `fallback-${index}`}`}
        book={book}
        size={3}
      />
    ))
  ) : (
    <h3>Aucune recommandation</h3>
  );

  return (
    <section className={styles.LastBook}>
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

LastBooks.propTypes = {
  lastAddedBooks: PropTypes.array,
  loading: PropTypes.bool,
};

export default LastBooks;
