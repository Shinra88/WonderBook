import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './Forget.module.css';

function Forget({ onClose }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });

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
    try {
      setIsLoading(true);
      const response = await axios.post('/api/forget-password', { email });

      if (!response?.data?.success) {
        setNotification({ error: true, message: 'Une erreur est survenue' });
      } else {
        setNotification({ error: false, message: 'Un email de réinitialisation a été envoyé.' });
      }
    } catch (err) {
      setNotification({ error: true, message: err.message });
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

        <div className={styles.buttonContainer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Annuler
          </button>
          <button type="button" className={styles.validateButton} onClick={forget} disabled={isLoading}>
            {isLoading ? 'Chargement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}

Forget.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Forget;
