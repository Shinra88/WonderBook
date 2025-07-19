import { useState, useEffect } from 'react';
import styles from './CommentModal.module.css';
import { addOrUpdateComment } from '../../services/commentService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

function CommentModal({ book, userId, onClose }) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (book?.existingComment) {
      setContent(book.existingComment.content || '');
      setRating(book.existingComment.rating || 0);
    }
  }, [book]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('Le commentaire ne peut pas être vide.');
      return;
    }
    try {
      setLoading(true);
      await addOrUpdateComment(book.bookId, { content, rating });
      onClose();
    } catch (error) {
      console.error('Erreur en envoyant le commentaire:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Commenter "{book.title}"</h2>
        <img src={book.cover_url} alt={book.title} className={styles.cover} />
        <textarea
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écris ton avis ici..."
        />

        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={
                (hoverRating || rating) >= star ? styles.filledStar : styles.emptyStar
              }
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <FontAwesomeIcon icon={faStar} />
            </span>
          ))}
        </div>

        <div className={styles.buttons}>
          <button onClick={onClose} className={styles.cancelButton}>Annuler</button>
          <button onClick={handleSubmit} disabled={loading} className={styles.validateButton}>
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;