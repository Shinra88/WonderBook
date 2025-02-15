import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BookItem from '../../components/Books/BookItem/BookItem';
import BestRateBooks from '../../components/Books/BestRatedBooks/BestRatedBooks';
import LastBook from '../../components/Books/LastBook/LastBook';
import Banner from '../../images/library.png';
import styles from './Home.module.css';
import { getBooks } from '../../lib/common';

function Home({ selectedCategories, selectedYear }) {
  const [books, setBooks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('LastBook');

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

  const displayBooks = () => {
    if (!books) {
      return <h1>Vide</h1>;
    }
    return books.map((book) => <BookItem size={2} book={book} key={book.id} />);
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
          <aside className={styles.offer}>
            {selectedTab === 'bestRated' ? <BestRateBooks /> : <LastBook />}
          </aside>
        </header>
        {/* Section des Filtres sélectionnés */}
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

        {/* Section Tous les livres */}
        <section className={styles.bookList}>
          {loading ? <h1>Chargement...</h1> : displayBooks()}
        </section>
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

Home.defaultProps = {
  selectedCategories: [],
  selectedYear: '',
};

export default Home;
