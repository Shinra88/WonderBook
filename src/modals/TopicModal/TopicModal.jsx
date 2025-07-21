import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { addTopic } from '../../services/topicsService';
import { useAuth } from '../../hooks/useAuth';
import ReCAPTCHA from 'react-google-recaptcha';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import { useTranslation } from 'react-i18next';
import styles from './TopicModal.module.css';

export default function TopicModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    const handleEscape = event => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleOutsideClick = e => {
    if (e.target.classList.contains(styles.modalBackground)) {
      onClose();
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (!title || !content) {
      setError(t('TopicModal.Error.RequiredFields'));
      return;
    }

    if (!recaptchaToken) {
      setError(t('TopicModal.Error.CaptchaRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      await addTopic({ title, content, recaptchaToken, notice }, user.token);
      setShowToast(true);
      onSuccess();

      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(t('TopicModal.Error.AdditionFailed'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleOutsideClick}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>{t('TopicModal.AddSubject')}</h2>

        {showToast && <ToastSuccess message={t('TopicModal.SuccessMessage')} />}
        {!showToast && (
          <>
            {error && <p className={styles.errorText}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formField}>
                <input
                  type="text"
                  placeholder={t('TopicModal.Title')}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <textarea
                  placeholder={t('TopicModal.Content')}
                  rows={5}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>

              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <div className={styles.formField}>
                  <label>
                    <input
                      type="checkbox"
                      checked={notice}
                      onChange={e => setNotice(e.target.checked)}
                    />{' '}
                    {t('TopicModal.Notice')}
                  </label>
                </div>
              )}

              <div className={styles.formField}>
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={token => setRecaptchaToken(token)}
                />
              </div>

              <div className={styles.buttonRow}>
                <button type="button" className={styles.cancelButton} onClick={onClose}>
                  {t('TopicModal.Cancel')}
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!title || !content || !recaptchaToken || isSubmitting}
                >
                  {isSubmitting ? t('TopicModal.Sending') : t('TopicModal.Submit')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

TopicModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
