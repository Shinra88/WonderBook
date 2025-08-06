import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ChangePass.module.css';
// ✅ CHANGEMENT : Remplacé authService par useAuth
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

function ChangePass({ onClose, onSuccess }) {
  // Function to handle password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  // ✅ CHANGEMENT : Récupère changePassword via useAuth
  const { changePassword } = useAuth();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={};':"\\|,.<>/?]).{8,}$/;

  const getPasswordStrength = password => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return t('ChangePass.PasswordStrengthWeak');
    if (score <= 4) return t('ChangePass.PasswordStrengthMedium');
    return t('ChangePass.PasswordStrengthStrong');
  };

  const validateFields = () => {
    const newErrors = {};
    if (!passwordRegex.test(newPassword)) {
      newErrors.password = t('ChangePass.PasswordRequirements');
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('ChangePass.PasswordsDoNotMatch');
    }
    return newErrors;
  };

  const isFormValid =
    oldPassword && newPassword && confirmPassword && Object.keys(errors).length === 0;

  useEffect(() => {
    const handleEscape = event => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    setErrors(validateFields());
    setPasswordStrength(getPasswordStrength(newPassword));
  }, [newPassword, confirmPassword]);

  const handleClickOutside = event => {
    if (event.target.classList.contains(styles.modalBackground)) onClose();
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    // ✅ IDENTIQUE : Même appel, mais via useAuth sécurisé
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
        <h2>{t('ChangePass.Title')}</h2>

        {notification.message && (
          <div className={notification.error ? styles.errorMessage : styles.successMessage}>
            {notification.message}
          </div>
        )}

        <label htmlFor="oldPassword">
          {t('ChangePass.OldPassword')}
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
          />
        </label>

        <label htmlFor="newPassword">
          {t('ChangePass.NewPassword')}
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className={errors.password ? styles.invalid : ''}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </label>
        <small className={styles.errorText}>{errors.password || '\u00A0'}</small>

        <label htmlFor="confirmPassword">
          {t('ChangePass.ConfirmNewPassword')}
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className={errors.confirmPassword ? styles.invalid : ''}
          />
        </label>
        <small className={styles.errorText}>{errors.confirmPassword || '\u00A0'}</small>

        {newPassword && (
          <small
            className={
              passwordStrength === t('ChangePass.PasswordStrengthStrong')
                ? styles.strong
                : passwordStrength === t('ChangePass.PasswordStrengthMedium')
                  ? styles.medium
                  : styles.weak
            }>
            {t('ChangePass.PasswordStrength')} : {passwordStrength}
          </small>
        )}
        <div className={styles.buttonContainer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            {t('ChangePass.Cancel')}
          </button>
          <button
            type="submit"
            className={styles.confirmButton}
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}>
            {isLoading ? t('ChangePass.Loading') : t('ChangePass.Validate')}
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
