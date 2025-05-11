// 📁 src/pages/Home/Home.jsx
import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import BookDisplay from '../../components/Books/BookDisplay/BookDisplay';
import BestRateBooks from '../../components/Books/BestRatedBooks/BestRatedBooks';
import LastBook from '../../components/Books/LastBook/LastBook';
import Banner from '../../images/library.png';
import styles from './Home.module.css';
import Pagination from '../../components/Pagination/Pagination';
import { useBestRatedBooks, useLastAddedBooks, useFilteredBooks } from '../../hooks/customHooks';
import { useFilters } from '../../hooks/filterContext';

function Home() {
  const { selectedCategories, selectedYear, selectedType, searchQuery } = useFilters();
  const [selectedTab, setSelectedTab] = useState('LastBook');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;

  const validYear = typeof selectedYear === 'string' && selectedYear.length === 4 ? selectedYear : '';

  const baseFilters = useMemo(() => ({
    categories: selectedCategories,
    year: validYear,
    start: selectedYear?.start,
    end: selectedYear?.end,
    type: selectedType,
  }), [selectedCategories, selectedYear, selectedType, validYear]);

  // ✅ Combine base filters + searchQuery pour ne pas recréer l'objet à chaque render
  const combinedFilters = useMemo(() => ({
    ...baseFilters,
    search: searchQuery,
  }), [baseFilters, searchQuery]);

  const { books, total, loading: booksLoading } = useFilteredBooks(combinedFilters, currentPage, booksPerPage);
  const { bestRatedBooks, loading: bestLoading } = useBestRatedBooks(baseFilters); // volontairement sans search
  const { lastAddedBooks, loading: lastLoading } = useLastAddedBooks(baseFilters); // volontairement sans search

  // ✅ Reset page à 1 lorsqu'on change les filtres ou la recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [combinedFilters]);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayBooks = () => {
    if (!books.length) return <h2>Aucun livre trouvé pour votre recherche.</h2>;
    return books.map((book) => (
      <BookDisplay key={book.bookId} book={book} size={2} />
    ));
  };

  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  return (
    <div id="topPage" className={styles.Home}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <header className={styles.head}>
          <div className={styles.menu}>
            <button
              type="button"
              className={selectedTab === 'LastBook' ? styles.active : styles.inactive}
              onClick={() => handleTabClick('LastBook')}
            >
              Dernier ajout
            </button>
            <button
              type="button"
              className={selectedTab === 'bestRated' ? styles.active : styles.inactive}
              onClick={() => handleTabClick('bestRated')}
            >
              Mieux noté
            </button>
          </div>
          <aside className={styles.bestRated}>
            {selectedTab === 'bestRated'
              ? <BestRateBooks books={bestRatedBooks} loading={bestLoading} />
              : <LastBook lastAddedBooks={lastAddedBooks} loading={lastLoading} />}
          </aside>
        </header>

        <section id="filters" className={styles.filters_container}>
          <h3>Filtres appliqués :</h3>
          <div className={styles.filters}>
            <p>
              <strong>Catégories :</strong>{' '}
              {selectedCategories.length > 0
                ? selectedCategories.join(` ${selectedType || 'ou'} `)
                : 'Aucune'}
            </p>
            <p>
              <strong>Année :</strong>{' '}
              {typeof selectedYear === 'string'
                ? selectedYear
                : selectedYear?.start && selectedYear?.end
                  ? `${selectedYear.start} → ${selectedYear.end}`
                  : 'Aucune'}
            </p>
          </div>
        </section>

        <section className={styles.bookList}>
          {booksLoading ? <h2>Chargement...</h2> : displayBooks()}
        </section>
        <div className={styles.up_container}>
          <a href="#" className={styles.up}>Haut de page</a>
        </div>
        <div className={styles.paginationContainer}>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(total / booksPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
}

Home.propTypes = {
  selectedCategories: PropTypes.arrayOf(PropTypes.string),
  selectedYear: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string,
    }),
  ]),
};

export default Home;
