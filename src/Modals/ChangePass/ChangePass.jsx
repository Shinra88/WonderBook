import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ChangePass.module.css';
import { changePassword } from '../../services/authService';

function ChangePass({ onClose, onSuccess }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleClickOutside = (event) => {
    if (event.target.classList.contains(styles.modalBackground)) onClose();
  };

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setNotification({ error: true, message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setIsLoading(true);
    const result = await changePassword(oldPassword, newPassword);

    if (result.success) {
      setNotification({ error: false, message: result.message });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      setNotification({ error: true, message: result.message });
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.modalBackground} onClick={handleClickOutside} role="presentation">
      <div className={styles.modalContent}>
        <h2>Changer le mot de passe</h2>

        {notification.message && (
          <div className={notification.error ? styles.errorMessage : styles.successMessage}>
            {notification.message}
          </div>
        )}

        <label htmlFor="oldPassword">
          Ancien mot de passe
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </label>

        <label htmlFor="newPassword">
          Nouveau mot de passe
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>

        <label htmlFor="confirmPassword">
          Confirmer mot de passe
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        <div className={styles.buttonContainer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Annuler
          </button>
          <button
            type="submit"
            className={styles.confirmButton}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}

ChangePass.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ChangePass;
