import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ChangePass.module.css';
import { changePassword } from '../../services/authService';

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

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return 'Faible';
    if (score <= 4) return 'Moyen';
    return 'Fort';
  };

  const validateFields = () => {
    const newErrors = {};
    if (!passwordRegex.test(newPassword)) {
      newErrors.password = '8+ caractères avec maj, min, chiffre et caractère spécial.';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }
    return newErrors;
  };

  const isFormValid =
    oldPassword && newPassword && confirmPassword && Object.keys(errors).length === 0;

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    setErrors(validateFields());
    setPasswordStrength(getPasswordStrength(newPassword));
  }, [newPassword, confirmPassword]);

  const handleClickOutside = (event) => {
    if (event.target.classList.contains(styles.modalBackground)) onClose();
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

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
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={errors.password ? styles.invalid : ''}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </label>          
        <small className={styles.errorText}>{errors.password || '\u00A0'}</small>

        <label htmlFor="confirmPassword">
          Confirmer mot de passe
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errors.confirmPassword ? styles.invalid : ''}
          />
        </label>
        <small className={styles.errorText}>{errors.confirmPassword || '\u00A0'}</small>

        {newPassword && (
            <small
              className={
                passwordStrength === 'Fort'
                  ? styles.strong
                  : passwordStrength === 'Moyen'
                  ? styles.medium
                  : styles.weak
              }
            >
              Force du mot de passe : {passwordStrength}
            </small>
          )}
        <div className={styles.buttonContainer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Annuler
          </button>
          <button
            type="submit"
            className={styles.confirmButton}
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
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
