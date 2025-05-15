import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './CommentModerationModal.module.css';
import avatarDefault from '../../images/avatar.png';
import { displayStars } from '../../utils/helpers';
import { deleteCommentAsAdmin } from '../../services/commentService';
import FeatherIcon from '../../images/feather.png';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';

function CommentModerationModal({ bookId, comments, onClose, onUpdate }) {
  const modalRef = useRef();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleDelete = async (commentId) => {
    try {
      await deleteCommentAsAdmin(commentId);
      const updated = comments.filter((c) => c.commentId !== commentId);
      onUpdate(updated);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Erreur suppression commentaire admin :', error);
    }
  };

  return (
    <div className={styles.modalBackground}>
      <div ref={modalRef} className={styles.modalContent}>
        <h2>Modération des commentaires</h2>

        {showToast && <ToastSuccess message="Commentaire supprimé 🎉" />}

        {comments.length === 0 && <p>Aucun commentaire pour ce livre.</p>}
        {comments.map((comment) => (
          <div key={comment.commentId} className={styles.commentBlock}>
            <div className={styles.commentHeader}>
              <img
                src={comment.user?.avatar || avatarDefault}
                alt="avatar"
                className={styles.avatar}
              />
              <div>
                <strong>{comment.user?.name || 'Anonyme'}</strong>
                <div className={styles.date}>
                  {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
            <p className={styles.commentText}>« {comment.content} »</p>
            <div className={styles.stars}>{displayStars(comment.rating)}</div>
            <div className={styles.actions}>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(comment.commentId)}
              >
                Supprimer
                <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
              </button>
            </div>
          </div>
        ))}
        <button onClick={onClose} className={styles.closeBtn}>Fermer</button>
      </div>
    </div>
  );
}

CommentModerationModal.propTypes = {
  bookId: PropTypes.number.isRequired,
  comments: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default CommentModerationModal;
