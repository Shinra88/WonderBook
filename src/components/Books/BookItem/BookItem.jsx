import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { displayStars } from '../../../lib/functions';
import styles from './BookItem.module.css';

function BookItem({ book, size }) {
  console.log("📌 BookItem reçoit :", book);

  let title;
  switch (size) {
    case 2:
      title = <h2>{book.title}</h2>;
      break;
    case 3:
      title = <h3>{book.title}</h3>;
      break;
    default:
      title = <h2>{book.title}</h2>;
      break;
  }

  return (
    <Link to={`/livre/${book.bookId}`} className={styles.BookItem}>
      <article>
        <img className={styles.BookImage} src={book.cover_url} alt={`${book.title}, ${book.author} - ${book.date ? new Date(book.date).getFullYear() : 'Année inconnue'}`} />
        <div className={styles.BookInfo}>
          <div className={styles.Rating}>
            {displayStars(book.averageRating)}
          </div>
          {title}
          <p>{book.author}</p>
          <p>{book.date ? (typeof book.date === 'string' ? book.date.split('-')[0] : new Date(book.date).getFullYear()) : 'Année inconnue'}</p>
          <p>{book.editor}</p>
        </div>
      </article>
    </Link>
  );
}

BookItem.propTypes = {
  size: PropTypes.number.isRequired,
  book: PropTypes.shape({
    bookId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    date: PropTypes.string, 
    cover_url: PropTypes.string,
    editor: PropTypes.string,
    ratings: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.number, 
      score: PropTypes.number, 
    })),
    averageRating: PropTypes.number,
  }).isRequired,
};

export default BookItem;
