import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './SignIn.module.css';

function SignIn({ setUser, onClose, openLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const Signin = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/signup', { email, password });

      if (!response?.data?.token) {
        setNotification({ error: true, message: 'Une erreur est survenue' });
      } else {
        setUser(response.data);
        if (onClose) {
          onClose();
        }
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
        <h2>Inscription</h2>

        {notification.message && (
          <div className={notification.error ? styles.errorMessage : styles.successMessage}>
            {notification.message}
          </div>
        )}

        <div className={styles.formContainer}>
          <label htmlFor="username">
            Pseudo
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

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

          <label htmlFor="password">
            Mot de passe
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label htmlFor="confirmPassword">
            Confirmer mot de passe
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
        </div>

        <div className={styles.Option}>
          <button
            type="button"
            className={styles.LinkButton}
            onClick={() => {
              onClose(); // Ferme la modal d'inscription
              openLogin(); // Ouvre la modal de connexion
            }}
          >
            Déjà un compte ? Connectez-vous
          </button>
        </div>

        <div className={styles.buttonContainer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Annuler
          </button>
          <button type="button" className={styles.validateButton} onClick={Signin} disabled={isLoading}>
            {isLoading ? 'Chargement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}

SignIn.propTypes = {
  setUser: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  openLogin: PropTypes.func.isRequired,
};

SignIn.defaultProps = {
  onClose: null,
};

export default SignIn;
