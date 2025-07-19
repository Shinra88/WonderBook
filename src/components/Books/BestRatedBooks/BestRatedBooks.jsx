import { useMemo, useRef } from 'react';
import { useBestRatedBooks } from '../../../hooks/customHooks';
import { useFilters } from '../../../hooks/filterContext';
import BookDisplay from '../BookDisplay/BookDisplay';
import styles from './BestRatedBooks.module.css';

function BestRatedBooks() {
  const { selectedCategories, selectedYear, selectedType } = useFilters();
  const scrollRef = useRef(null);

  const filters = useMemo(() => ({
    categories: selectedCategories,
    year: typeof selectedYear === 'string' ? selectedYear : '',
    start: selectedYear?.start,
    end: selectedYear?.end,
    type: selectedType,
  }), [selectedCategories, selectedYear, selectedType]);

  const { bestRatedBooks, loading } = useBestRatedBooks(filters);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const content = loading ? (
    <h3>Chargement des livres les mieux notés...</h3>
  ) : bestRatedBooks.length > 0 ? (
    bestRatedBooks.map((book, index) => (
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
