import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { addTopic } from '../../services/topicsService';
import { useAuth } from '../../hooks/useAuth';
import ReCAPTCHA from 'react-google-recaptcha';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import styles from './TopicModal.module.css';

export default function TopicModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains(styles.modalBackground)) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title || !content) {
      setError('Titre et contenu obligatoires.');
      return;
    }

    if (!recaptchaToken) {
      setError('Veuillez valider le CAPTCHA.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addTopic({ title, content, recaptchaToken, notice }, user.token);
      setShowToast(true);
      onSuccess();

      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError("Erreur lors de l'ajout du topic.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleOutsideClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Créer un nouveau topic</h2>

        {showToast && <ToastSuccess message="Sujet publié avec succès 🎉" />}
        {!showToast && (
          <>
            {error && <p className={styles.errorText}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formField}>
                <input
                  type="text"
                  placeholder="Titre du sujet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <textarea
                  placeholder="Contenu du message"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <div className={styles.formField}>
                  <label>
                    <input
                      type="checkbox"
                      checked={notice}
                      onChange={(e) => setNotice(e.target.checked)}
                    />{' '}
                    Épingler ce sujet
                  </label>
                </div>
              )}

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
                  disabled={!title || !content || !recaptchaToken || isSubmitting}
                >
                  {isSubmitting ? 'Envoi...' : 'Publier'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

TopicModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
