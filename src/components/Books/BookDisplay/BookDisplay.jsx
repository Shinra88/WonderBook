import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDate, displayStars } from '../../../utils/helpers';
import { useTranslation } from 'react-i18next';
import styles from './BookDisplay.module.css';

function BookDisplay({ book, size, showDetails = false, hideImage = false, adminView = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const statusLabel =
    book.status === 'pending' ? t('BookDisplay.Pending') : t('BookDisplay.Validated');

  if (adminView) {
    return (
      <Link
        to={`/livre/${encodeURIComponent(book.title)}`}
        className={`${styles.BookDisplay} ${styles.admin} ${book.status === 'pending' ? styles.pendingRow : ''}`}>
        <img
          src={book.cover_url}
          alt={`${book.title}, ${book.author} - ${book.date || t('BookDisplay.UnknownDate')}`}
        />
        <strong>{book.title}</strong>
        <em>{statusLabel}</em>
        <em>{t('BookDisplay.By', { user: book.validated_by || 'Bdd' })}</em>
      </Link>
    );
  }

  let titleParts = book.title.split(':');
  let mainTitle = titleParts[0];
  let subTitle = titleParts[1]?.trim();
  let title;
  switch (size) {
    case 2:
      title = (
        <>
          <h2>{mainTitle}</h2>
          <h5 className={styles.Subtitle}>{subTitle || '\u00A0'}</h5>
        </>
      );
      break;
    case 3:
      title = (
        <>
          <h3>{mainTitle}</h3>
          <h5 className={styles.Subtitle}>{subTitle || '\u00A0'}</h5>
        </>
      );
      break;
    default:
      title = (
        <>
          <h2>{mainTitle}</h2>
          <h5 className={styles.Subtitle}>{subTitle || '\u00A0'}</h5>
        </>
      );
  }

  return (
    <Link to={`/livre/${encodeURIComponent(book.title)}`} className={styles.BookDisplay}>
      <article>
        {!hideImage && (
          <img
            className={styles.BookImage}
            src={book.cover_url}
            alt={`${book.title}, ${book.author} - ${book.date || t('BookDisplay.UnknownDate')}`}
          />
        )}
        <div className={styles.BookInfo}>
          <div className={styles.Rating}>{displayStars(book.averageRating)}</div>
          {title}
          <p>{book.author}</p>
          <p>{formatDate(book.date)}</p>

          {showDetails && book.editors?.length > 0 && (
            <p>
              <strong>{t('BookDisplay.Editors')} :</strong> {book.editors.join(', ')}
            </p>
          )}

          {showDetails && book.categories?.length > 0 && (
            <p>
              <strong>{t('BookDisplay.Categories')} :</strong> {book.categories.join(', ')}
            </p>
          )}

          {showDetails && book.summary && (
            <div className={styles.SummaryContainer}>
              <p className={`${styles.Summary} ${isExpanded ? styles.Expanded : styles.Collapsed}`}>
                <strong>{t('BookDisplay.Summary')} :</strong> {book.summary}
              </p>
              {book.summary.length > 300 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={styles.ToggleButton}>
                  {isExpanded ? 'Lire moins ▲' : 'Lire plus ▼'}
                </button>
              )}
            </div>
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
    ratings: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.number,
        score: PropTypes.number,
      })
    ),
    summary: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  adminView: PropTypes.bool,
};

export default BookDisplay;
