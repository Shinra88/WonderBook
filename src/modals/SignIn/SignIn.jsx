import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { register } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from 'react-i18next';
import styles from './SignIn.module.css';

function SignIn({ onClose = null, openLogin }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getFormValues = () => ({
    username,
    email,
    password,
    confirmPassword,
  });

  const validateForm = (fields = getFormValues()) => {
    const { username, email, password, confirmPassword } = fields;

    const pseudoRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    const newErrors = {};

    if (!pseudoRegex.test(username)) {
      newErrors.username = t('SignIn.UsernameInvalid'); // "Pseudo invalide. 3-20 caractères, lettres, chiffres, tirets et underscores."
    }
    if (!emailRegex.test(email)) {
      newErrors.email = t('SignIn.EmailInvalid'); // "Adresse e-mail invalide."
    }
    if (!passwordRegex.test(password)) {
      newErrors.password = t('SignIn.PasswordInvalid'); // "8+ caractères, avec majuscule, minuscule, chiffre et caractère spécial."
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('SignIn.ConfirmPasswordInvalid'); // "Les mots de passe ne correspondent pas."
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!recaptchaToken) {
      setNotification({ error: true, message: t('SignIn.CaptchaRequired') });
      return;
    }

    const isValid = validateForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const result = await register(username, email, password, recaptchaToken);
      if (!result.success) {
        setNotification({ error: true, message: result.error });
      } else {
        setNotification({ error: false, message: t('SignIn.RegisterSuccess') });
        setShowToast(true);

        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setNotification({ error: true, message: t('SignIn.RegisterError') });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    username.trim() !== '' &&
    email.trim() !== '' &&
    password !== '' &&
    confirmPassword !== '' &&
    Object.keys(errors).length === 0;

  return (
    <div
      className={styles.modalBackground}
      onClick={(e) => {
        if (e.target.classList.contains(styles.modalBackground) && onClose) onClose();
      }}
    >
      {showToast && <ToastSuccess message={t('SignIn.RegisterSuccess')} />}

      <div className={styles.modalContent}>
        <h2>{t('SignIn.Register')}</h2>

        <div className={styles.recaptchaWrapper}>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => setRecaptchaToken(token)}
          />
        </div>

        {!recaptchaToken && (
          <p style={{ color: '#ff6666', fontWeight: 'bold', textAlign: 'center' }}>
            {t('SignIn.CaptchaRequired')}
          </p>
        )}

        {notification.message && (
          <div className={notification.error ? styles.errorMessage : styles.successMessage}>
            {notification.message}
          </div>
        )}

        <div className={styles.formContainer}>
          {[
            {
              label: t('SignIn.Username'),
              type: 'text',
              value: username,
              id: 'username',
              onChange: (v) => setUsername(v),
              error: errors.username,
            },
            {
              label: t('SignIn.Email'),
              type: 'email',
              value: email,
              id: 'email',
              onChange: (v) => setEmail(v),
              error: errors.email,
            },
          ].map((field) => (
            <div key={field.id} className={styles.formGroup}>
              <label htmlFor={field.id}>{field.label}</label>
              <div className={styles.inputWrapper}>
                <input
                  className={`${styles.inputField} ${field.error ? styles.invalid : ''}`}
                  disabled={!recaptchaToken}
                  type={field.type}
                  id={field.id}
                  value={field.value}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    field.onChange(newValue);
                    validateForm({ ...getFormValues(), [field.id]: newValue });
                  }}
                />
              </div>
              <small className={styles.errorText}>{field.error || '\u00A0'}</small>
            </div>
          ))}

          <div className={styles.formGroup}>
            <label htmlFor="password">{t('SignIn.Password')}</label>
            <div className={styles.passwordWrapper}>
              <input
                className={`${styles.inputField} ${errors.password ? styles.invalid : ''}`}
                disabled={!recaptchaToken}
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setPassword(newValue);
                  validateForm({ ...getFormValues(), password: newValue });
                  setPasswordStrength(getPasswordStrength(newValue));
                }}
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {password && (
              <small
                className={
                  passwordStrength === 'Fort'
                    ? styles.strong
                    : passwordStrength === 'Moyen'
                    ? styles.medium
                    : styles.weak
                }
              >
                {t(`SignIn.PasswordStrength.${passwordStrength}`)}
              </small>
            )}
            <small className={styles.errorText}>{errors.password || '\u00A0'}</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">{t('SignIn.ConfirmPassword')}</label>
            <div className={styles.inputWrapper}>
              <input
                className={`${styles.inputField} ${errors.confirmPassword ? styles.invalid : ''}`}
                disabled={!recaptchaToken}
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setConfirmPassword(newValue);
                  validateForm({ ...getFormValues(), confirmPassword: newValue });
                }}
              />
            </div>
            <small className={styles.errorText}>{errors.confirmPassword || '\u00A0'}</small>
          </div>
        </div>

        <div className={styles.Option}>
          <button
            type="button"
            className={styles.LinkButton}
            onClick={() => {
              onClose?.();
              openLogin();
            }}
          >
            {t('SignIn.AlreadyHaveAccount')}
          </button>
        </div>

        <div className={styles.buttonContainer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            {t('SignIn.Cancel')}
          </button>
          <button
            type="button"
            className={styles.validateButton}
            onClick={handleRegister}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? t('SignIn.Loading') : t('SignIn.Validate')}
          </button>
        </div>
      </div>
    </div>
  );
}

SignIn.propTypes = {
  onClose: PropTypes.func,
  openLogin: PropTypes.func.isRequired,
};

export default SignIn;
