import { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api/api';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './ForgetPassword.module.css';
import { useTranslation } from 'react-i18next';

function ForgetPassword({ token }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ error: false, message: '' });
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');

  const { t } = useTranslation();

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setNotification({ error: true, message: t('ForgetPassword.PasswordMismatch') });
      return;
    }

    if (newPassword.length < 8) {
      setNotification({ error: true, message: t('ForgetPassword.PasswordTooShort') });
      return;
    }

    if (!recaptchaToken) {
      setNotification({ error: true, message: t('ForgetPassword.CaptchaRequired') });
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
        setNotification({ error: false, message: t('ForgetPassword.SuccessMessage') });

        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setNotification({
          error: true,
          message: response.data.message || t('ForgetPassword.UnknownError'),
        });
      }
    } catch (err) {
      console.error('Erreur reset password :', err);
      setNotification({
        error: true,
        message: err.response?.data?.message || t('ForgetPassword.ServerError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.Login}>
      <div className={styles.Form}>
        {showToast && <ToastSuccess message={t('ForgetPassword.SuccessMessage')} />}

        <h2>{t('ForgetPassword.ResetTitle')}</h2>

        {notification.message && (
          <div className={notification.error ? styles.errorMessage : styles.successMessage}>
            {notification.message}
          </div>
        )}

        <label htmlFor="newPassword">
          {t('ForgetPassword.NewPasswordLabel')}
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Votre nouveau mot de passe"
          />
        </label>

        <label htmlFor="confirmPassword">
          {t('ForgetPassword.ConfirmPasswordLabel')}
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirmez votre nouveau mot de passe"
          />
        </label>

        <div className={styles.recaptchaContainer}>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={token => setRecaptchaToken(token)}
          />
        </div>

        <button
          type="button"
          onClick={handleResetPassword}
          className={styles.validateButton}
          disabled={isLoading}>
          {isLoading ? t('ForgetPassword.Loading') : t('ForgetPassword.Validate')}
        </button>
      </div>
    </div>
  );
}

ForgetPassword.propTypes = {
  token: PropTypes.string.isRequired,
};

export default ForgetPassword;
