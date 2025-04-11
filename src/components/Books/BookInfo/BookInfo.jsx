import PropTypes from 'prop-types';
import React from 'react';
import styles from '../../../pages/Book/Book.module.css';
import { formatDate, displayStars } from '../../../utils/helpers';

function BookInfo({ book }) {
  return (
    <div className={styles.BookInfo}>
      <h1>{book.title}</h1>
      <p className={styles.Author}>{`par ${book.author}`}</p>
      <p className={styles.PublishDate}>{formatDate(book.date) || 'Année inconnue'}</p>
      <p className={styles.Genre}>{book.genre || 'Genre inconnu'}</p>
      <div className={styles.Rating}>
        <div>{displayStars(book.averageRating)}</div>
        <p>{`${book.averageRating}/5`}</p>
      </div>
    </div>
  );
}

BookInfo.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.number,
    userId: PropTypes.number,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    date: PropTypes.string, // <- date complète
    genre: PropTypes.string,
    cover_url: PropTypes.string,
    ratings: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.number,
      score: PropTypes.number,
    })),
    averageRating: PropTypes.number,
  }).isRequired,
};

export default BookInfo;