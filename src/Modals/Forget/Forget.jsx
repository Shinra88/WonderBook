import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api/api';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './Forget.module.css';

function Forget({ onClose }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });
  const [showToast, setShowToast] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const forget = async () => {
    if (!email) {
      setNotification({ error: true, message: "Merci d'entrer votre email." });
      return;
    }

    if (!recaptchaToken) {
      setNotification({ error: true, message: "Merci de valider le CAPTCHA." });
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/auth/forget-password', {
        email,
        recaptchaToken,
      });

      if (!response?.data?.success) {
        setNotification({ error: true, message: response?.data?.message || 'Une erreur est survenue.' });
      } else {
        setNotification({ error: false, message: 'Un email de réinitialisation a été envoyé.' });
        setShowToast(true);
        setEmail('');
        setRecaptchaToken('');
        setTimeout(() => {
          setShowToast(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setNotification({ error: true, message: err.response?.data?.message || err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={styles.modalBackground}
      onClick={(e) => {
        if (e.target.classList.contains(styles.modalBackground) && onClose) {
          onClose();
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === 'Escape') && onClose) {
          onClose();
        }
      }}
    >
      <div className={styles.modalContent}>
        <h2>Mot de passe oublié</h2>

        {showToast && (
          <ToastSuccess message="Un email de réinitialisation a été envoyé !" />
        )}

        {!showToast && (
          <>
            {notification.message && (
              <div className={notification.error ? styles.errorMessage : styles.successMessage}>
                {notification.message}
              </div>
            )}

            <label htmlFor="email">
              E-mail
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <div className={styles.recaptchaContainer}>
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>

            <div className={styles.buttonContainer}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Annuler
              </button>
              <button type="button" className={styles.validateButton} onClick={forget} disabled={isLoading}>
                {isLoading ? 'Chargement...' : 'Valider'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Forget.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Forget;
