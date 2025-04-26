import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDate, displayStars } from '../../../utils/helpers';
import styles from './BookDisplay.module.css';

function BookDisplay({ book, size, showDetails = false, hideImage = false }) {
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
    <Link to={`/livre/${encodeURIComponent(book.title)}`} className={styles.BookDisplay}>
      <article>
      {!hideImage && (
        <img
          className={styles.BookImage}
          src={book.cover_url}
          alt={`${book.title}, ${book.author} - ${book.date || 'Date inconnue'}`}
        />
      )}
        <div className={styles.BookInfo}>
          <div className={styles.Rating}>
            {displayStars(book.averageRating)}
          </div>
          {title}
          <p>{book.author}</p>
          <p>{formatDate(book.date)}</p>

          {showDetails && book.editors?.length > 0 && (
            <p><strong>Éditeur(s) :</strong> {book.editors.join(', ')}</p>
          )}

          {showDetails && book.categories?.length > 0 && (
            <p><strong>Catégories :</strong> {book.categories.join(', ')}</p>
          )}

          {showDetails && book.summary && (
            <p className={styles.Summary}><strong>Résumé :</strong> {book.summary}</p>
          )}
        </div>
      </article>
    </Link>
  );
}

BookDisplay.propTypes = {
  size: PropTypes.number.isRequired,
  showDetails: PropTypes.bool,
  hideImage: PropTypes.bool,
  book: PropTypes.shape({
    bookId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    date: PropTypes.string,
    cover_url: PropTypes.string,
    editors: PropTypes.arrayOf(PropTypes.string),
    averageRating: PropTypes.number,
    ratings: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.number,
      score: PropTypes.number,
    })),
    summary: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default BookDisplay;
