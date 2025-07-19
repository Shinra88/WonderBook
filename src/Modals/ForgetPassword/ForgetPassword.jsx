import { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api/api';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './ForgetPassword.module.css';

function ForgetPassword({ token }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ error: false, message: '' });
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setNotification({ error: true, message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (newPassword.length < 8) {
      setNotification({ error: true, message: 'Le mot de passe doit faire au moins 8 caractères.' });
      return;
    }

    if (!recaptchaToken) {
      setNotification({ error: true, message: "Merci de valider le CAPTCHA." });
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post(`/auth/reset-password/${token}`, {
        newPassword,
        recaptchaToken,
      });

      if (response.data.success) {
        setShowToast(true);
        setNotification({ error: false, message: 'Mot de passe réinitialisé avec succès.' });

        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
      } else {
        setNotification({ error: true, message: response.data.message || 'Erreur inconnue.' });
      }
    } catch (err) {
      console.error('Erreur reset password :', err);
      setNotification({ error: true, message: err.response?.data?.message || 'Erreur serveur.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.Login}>
      <div className={styles.Form}>
        {showToast && <ToastSuccess message="Mot de passe modifié 🎉" />}
  
        <h2>Réinitialiser votre mot de passe</h2>
  
        {notification.message && (
          <div className={notification.error ? styles.errorMessage : styles.successMessage}>
            {notification.message}
          </div>
        )}
  
        <label htmlFor="newPassword">
          Nouveau mot de passe
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Votre nouveau mot de passe"
          />
        </label>
  
        <label htmlFor="confirmPassword">
          Confirmer le mot de passe
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmez votre nouveau mot de passe"
          />
        </label>
  
        <div className={styles.recaptchaContainer}>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => setRecaptchaToken(token)}
          />
        </div>
  
        <button
          type="button"
          onClick={handleResetPassword}
          className={styles.validateButton}
          disabled={isLoading}
        >
          {isLoading ? 'Chargement...' : 'Valider'}
        </button>
      </div>
    </div>
  );  
}

ForgetPassword.propTypes = {
  token: PropTypes.string.isRequired,
};

export default ForgetPassword;
