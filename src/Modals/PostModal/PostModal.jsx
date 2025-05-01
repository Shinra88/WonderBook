import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { addPost } from '../../services/postsService';
import { useAuth } from '../../hooks/useAuth';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './PostModal.module.css';

export default function PostModal({ topicId, onClose, onSuccess }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!content) {
      setError('Le contenu est obligatoire.');
      return;
    }

    if (!recaptchaToken) {
      setError('Veuillez valider le CAPTCHA.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addPost({ topicId, content, recaptchaToken }, user.token);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Erreur lors de l'ajout du post.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackground}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Répondre au sujet</h2>

        {error && <p className={styles.errorText}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formField}>
            <textarea
              placeholder="Votre message"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => setRecaptchaToken(token)}
            />
          </div>

          <div className={styles.buttonRow}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!content || !recaptchaToken || isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

PostModal.propTypes = {
  topicId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
