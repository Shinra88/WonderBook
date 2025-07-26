import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDate, displayStars } from '../../../utils/helpers';
import { useTranslation } from 'react-i18next';
import styles from './BookDisplay.module.css';

function BookDisplay({ book, size, showDetails = false, hideImage = false, adminView = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();
  const statusLabel =
    book.status === 'pending' ? t('BookDisplay.Pending') : t('BookDisplay.Validated');

  // 🚀 Définir les dimensions selon le size pour s'adapter à votre design
  const getImageDimensions = size => {
    switch (size) {
      case 1:
        return { width: 120, height: 160 }; // Plus petit
      case 2:
        return { width: 140, height: 180 }; // Taille normale réduite
      case 3:
        return { width: 160, height: 200 }; // Grande taille réduite
      default:
        return { width: 140, height: 180 };
    }
  };

  const imageDimensions = getImageDimensions(size);

  // 🚀 Composant image optimisé
  const OptimizedBookCover = ({ book, dimensions, isLazy = true }) => (
    <div
      className={styles.BookImageContainer}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        minWidth: dimensions.width,
        minHeight: dimensions.height,
      }}>
      {!imageError ? (
        <>
          {/* Skeleton pendant le chargement */}
          {!imageLoaded && (
            <div
              className={styles.ImageSkeleton}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f0f0f0',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                borderRadius: '4px',
              }}
            />
          )}

          <img
            className={`${styles.BookImage} ${imageLoaded ? styles.ImageLoaded : styles.ImageLoading}`}
            src={book.cover_url}
            alt={`Couverture du livre ${book.title} par ${book.author}`}
            width={dimensions.width}
            height={dimensions.height}
            loading={isLazy ? 'lazy' : 'eager'}
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: '4px',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        </>
      ) : (
        // Fallback si l'image ne charge pas
        <div
          className={styles.ImageFallback}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '12px',
            color: '#666',
            textAlign: 'center',
            padding: '8px',
          }}>
          <div>📚</div>
          <div>{book.title}</div>
        </div>
      )}
    </div>
  );

  if (adminView) {
    return (
      <Link
        to={`/livre/${encodeURIComponent(book.title)}`}
        className={`${styles.BookDisplay} ${styles.admin} ${book.status === 'pending' ? styles.pendingRow : ''}`}>
        <OptimizedBookCover book={book} dimensions={{ width: 60, height: 90 }} />

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
          <h2 className={styles.MainTitle}>{mainTitle || 'Missing title'}</h2>
          {subTitle && <h3 className={styles.Subtitle}>{subTitle || 'Missing subtitle'}</h3>}
        </>
      );
      break;
    case 3:
      title = (
        <>
          <h3 className={styles.MainTitle}>{mainTitle || 'Missing title'}</h3>
          {subTitle && <h3 className={styles.Subtitle}>{subTitle || 'Missing subtitle'}</h3>}
        </>
      );
      break;
    default:
      title = (
        <>
          <h2 className={styles.MainTitle}>{mainTitle || 'Missing title'}</h2>
          {subTitle && <h3 className={styles.Subtitle}>{subTitle || 'Missing subtitle'}</h3>}
        </>
      );
  }

  return (
    <Link to={`/livre/${encodeURIComponent(book.title)}`} className={styles.BookDisplay}>
      <article className={styles.BookArticle}>
        {!hideImage && (
          <OptimizedBookCover book={book} dimensions={imageDimensions} isLazy={true} />
        )}

        <div className={styles.BookInfo}>
          <div className={styles.Rating}>{displayStars(book.averageRating)}</div>
          {title}
          <p>{book.author}</p>
          <p>{formatDate(book.date)}</p>

          {showDetails && book.editors?.length > 0 && (
            <p className={styles.Editors}>
              <strong>{t('BookDisplay.Editors')} :</strong> {book.editors.join(', ')}
            </p>
          )}

          {showDetails && book.categories?.length > 0 && (
            <p className={styles.Categories}>
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
                  onClick={e => {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                  }}
                  className={styles.ToggleButton}>
                  {isExpanded ? t('BookDisplay.ReadLess') : t('BookDisplay.ReadMore')}
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
    status: PropTypes.string,
    validated_by: PropTypes.string,
  }).isRequired,
  adminView: PropTypes.bool,
};

export default BookDisplay;
