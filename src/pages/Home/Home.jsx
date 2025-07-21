// 📁 src/pages/Home/Home.jsx
import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import BookDisplay from '../../components/Books/BookDisplay/BookDisplay';
import BestRateBooks from '../../components/Books/BestRatedBooks/BestRatedBooks';
import LastBook from '../../components/Books/LastBook/LastBook';
import Banner from '../../images/library.png';
import styles from './Home.module.css';
import Pagination from '../../components/Pagination/Pagination';
import { useBestRatedBooks, useLastAddedBooks, useFilteredBooks } from '../../hooks/customHooks';
import { useFilters } from '../../hooks/filterContext';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

function Home() {
  const { selectedCategories, selectedYear, selectedType, searchQuery } = useFilters();
  const [selectedTab, setSelectedTab] = useState('LastBook');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const { t } = useTranslation();
  const validYear =
    typeof selectedYear === 'string' && selectedYear.length === 4 ? selectedYear : '';

  const baseFilters = useMemo(
    () => ({
      categories: selectedCategories,
      year: validYear,
      start: selectedYear?.start,
      end: selectedYear?.end,
      type: selectedType,
    }),
    [selectedCategories, selectedYear, selectedType, validYear]
  );

  const combinedFilters = useMemo(
    () => ({
      ...baseFilters,
      search: searchQuery,
      pendingFirst: isAdmin ? true : undefined,
    }),
    [baseFilters, searchQuery, isAdmin]
  );

  const {
    books,
    total,
    loading: booksLoading,
  } = useFilteredBooks(combinedFilters, currentPage, booksPerPage);
  const { bestRatedBooks, loading: bestLoading } = useBestRatedBooks(baseFilters);
  const { lastAddedBooks, loading: lastLoading } = useLastAddedBooks(baseFilters);

  useEffect(() => {
    setCurrentPage(1);
  }, [combinedFilters]);

  const handleTabClick = tab => {
    setSelectedTab(tab);
  };

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const displayBooks = () => {
    if (!books.length) return <h2>{t('HomePage.NoneBooks')}</h2>;

    const visibleBooks = isAdmin ? books : books.filter(book => book.status === 'validated');

    const sorted = [...visibleBooks].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return 0;
    });

    return sorted.map(book => (
      <BookDisplay
        key={book.bookId}
        book={book}
        size={2}
        adminView={isAdmin}
        isPending={book.status === 'pending'}
      />
    ));
  };

  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  return (
    <div id="topPage" className={styles.Home}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        {!isAdmin && (
          <header className={styles.head}>
            <div className={styles.menu}>
              <button
                type="button"
                className={selectedTab === 'LastBook' ? styles.active : styles.inactive}
                onClick={() => handleTabClick('LastBook')}
              >
                {t('HomePage.LastAdded')}
              </button>
              <button
                type="button"
                className={selectedTab === 'bestRated' ? styles.active : styles.inactive}
                onClick={() => handleTabClick('bestRated')}
              >
                {t('HomePage.BestRated')}
              </button>
            </div>
            <aside className={styles.bestRated}>
              {selectedTab === 'bestRated' ? (
                <BestRateBooks books={bestRatedBooks} loading={bestLoading} />
              ) : (
                <LastBook lastAddedBooks={lastAddedBooks} loading={lastLoading} />
              )}
            </aside>
          </header>
        )}

        <section id="filters" className={styles.filters_container}>
          <h3>{t('HomePage.Filter')} :</h3>
          <div className={styles.filters}>
            <p>
              <strong>{t('HomePage.Categories')} :</strong>{' '}
              {selectedCategories.length > 0
                ? selectedCategories.join(` ${selectedType || 'ou'} `)
                : t('HomePage.None')}
            </p>
            <p>
              <strong>{t('HomePage.Year')} :</strong>{' '}
              {typeof selectedYear === 'string'
                ? selectedYear
                : selectedYear?.start && selectedYear?.end
                  ? `${selectedYear.start} → ${selectedYear.end}`
                  : t('HomePage.None')}
            </p>
          </div>
        </section>

        <section className={styles.bookList}>
          {booksLoading ? <h2>{t('HomePage.Loading')}...</h2> : displayBooks()}
        </section>
        <div className={styles.up_container}>
          <a href="#" className={styles.up}>
            {t('HomePage.UpPage')}
          </a>
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
