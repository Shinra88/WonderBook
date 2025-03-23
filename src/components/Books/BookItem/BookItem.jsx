import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDate, displayStars } from '../../../lib/functions';
import styles from './BookItem.module.css';

function BookItem({ book, size }) {
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
        <img
          className={styles.BookImage}
          src={book.cover_url}
          alt={`${book.title}, ${book.author} - ${book.date || 'Date inconnue'}`}
        />
        <div className={styles.BookInfo}>
          <div className={styles.Rating}>
            {displayStars(book.averageRating)}
          </div>
          {title}
          <p>{book.author}</p>
          <p>{formatDate(book.date)}</p>
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
    date: PropTypes.string, // ← bien "date", plus "year"
    cover_url: PropTypes.string,
    editor: PropTypes.string,
    averageRating: PropTypes.number,
    ratings: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.number,
      score: PropTypes.number,
    })),
  }).isRequired,
};

export default BookItem;
