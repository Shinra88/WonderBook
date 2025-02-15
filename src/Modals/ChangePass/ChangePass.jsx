import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './ChangePass.module.css';
import { API_ROUTES } from '../../utils/constants';

function ChangePass({ onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });

  // **Fermeture avec la touche "Échap"**
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // **Ferme la modal si on clique en dehors du contenu**
  const handleClickOutside = (event) => {
    if (event.target.classList.contains(styles.modalBackground)) {
      onClose();
    }
  };

  // **Validation du changement de mot de passe**
  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setNotification({ error: true, message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(API_ROUTES.CHANGE_PASS, { oldPassword, newPassword });

      if (response.status !== 200) {
        setNotification({ error: true, message: 'Une erreur est survenue.' });
      } else {
        setNotification({ error: false, message: 'Mot de passe changé avec succès !' });
        onClose(); // Ferme la modal après succès
      }
    } catch (err) {
      setNotification({ error: true, message: err.response?.data?.message || 'Une erreur est survenue.' });
    } finally {
      setIsLoading(false);
    }
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
          <input type="password" id="oldPassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
        </label>

        <label htmlFor="newPassword">
          Nouveau mot de passe
          <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>

        <label htmlFor="confirmPassword">
          Confirmer mot de passe
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </label>

        <div className={styles.buttonContainer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className={styles.confirmButton} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Chargement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}

ChangePass.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ChangePass;
