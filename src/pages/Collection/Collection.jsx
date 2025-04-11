import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import DropdownMenu from '../../components/DropdownMenu/DropdownMenu';
import Banner from '../../images/library.png';
import { getBooks } from '../../services/bookService';
import BookItem from '../../components/Books/BookItem/BookItem';
import styles from './Collection.module.css';

function Collection() {
  const navigate = useNavigate();
  const [books, setBooks] = useState(null);
  const [loading, setLoading] = useState(true);
  const displayBooks = () => (
    books
      ? books.map((book) => (
        <BookItem
          size={2}
          book={book}
          key={book.id}
        />
      ))
      : <h1>Vide</h1>
  );
  useEffect(() => {
    async function getBooksList() {
      const data = await getBooks();
      if (data) {
        setBooks(data);
        setLoading(false);
      }
    }
    getBooksList();
  }, []);
  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };
  const categories = ['Amour', 'Aventure', 'Fantastique', 'Fantasy', 'Historique', 'Policier', 'Science-Fiction'];

  const handleCategorySelect = (category) => {
    navigate(`/category/${category.toLowerCase()}`);
  };
  return (
    <div className={styles.Collection}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <header className={styles.head}>
          <div className={styles.title}>
            <h2>Collection</h2>
            <div className={styles.searchBar}>
              <div className={styles.inputSearch}>
                <input type="text" />
                <button type="button">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>
            </div>
          </div>
          <nav className={styles.filters}>
            <DropdownMenu categories={categories} onSelectCategory={handleCategorySelect} backgroundClass="backgroundWood" />
            <label htmlFor="read" className={styles.filterToggle}>
              Lu
              <input
                type="checkbox"
                name="read"
                id="read"
                value="read"
              />
            </label>
            <h3>Livres:</h3>
          </nav>
        </header>
        <section className={styles.bookList}>
          {loading ? <h1>Chargement</h1> : displayBooks()}
        </section>
      </main>
    </div>
  );
}

export default Collection;
