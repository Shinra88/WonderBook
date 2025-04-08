import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BookItem from '../../components/Books/BookItem/BookItem';
import BestRateBooks from '../../components/Books/BestRatedBooks/BestRatedBooks';
import LastBook from '../../components/Books/LastBook/LastBook';
import Banner from '../../images/library.png';
import styles from './Home.module.css';
import { getBooks } from '../../lib/common';
import Pagination from '../../components/Pagination/Pagination';

function Home({ selectedCategories = [], selectedYear = '' }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('LastBook');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;

  useEffect(() => {
    async function getBooksList() {
      const data = await getBooks();
      if (data) {
        setBooks(data);
        setLoading(false);
      }
    }
    getBooksList();
  }, [selectedCategories, selectedYear]);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const displayBooks = () => {
    if (!currentBooks.length) {
      return <h2>Aucun livre à afficher.</h2>;
    }
    return currentBooks.map((book, index) => (
      <BookItem
        size={2}
        book={book}
        key={`book-${book.bookId || `fallback-${index}`}`}
      />
    ));
  };

  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  return (
    <div className={styles.Home}>
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
            {selectedTab === 'bestRated' ? <BestRateBooks /> : <LastBook />}
          </aside>
        </header>

        <section className={styles.filters_container}>
          <h3>Filtres appliqués :</h3>
          <div className={styles.filters}>
            <p>
              <strong>Catégories :</strong>
              {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Aucune'}
            </p>
            <p>
              <strong>Année :</strong>
              {selectedYear || 'Aucune'}
            </p>
          </div>
        </section>

        <section className={styles.bookList}>
          {loading ? <h2>Chargement...</h2> : displayBooks()}
        </section>
        <div className={styles.paginationContainer}>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(books.length / booksPerPage)}
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
