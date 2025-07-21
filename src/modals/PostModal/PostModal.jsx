import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { addPost } from '../../services/postsService';
import { useAuth } from '../../hooks/useAuth';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTranslation } from 'react-i18next';
import styles from './PostModal.module.css';

export default function PostModal({ topicId, onClose, onSuccess }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = event => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (!content) {
      setError(t('PostModal.Error.RequiredField'));
      return;
    }

    if (!recaptchaToken) {
      setError(t('PostModal.Error.CaptchaRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      await addPost({ topicId, content, recaptchaToken }, user.token);
      onSuccess();
      onClose();
    } catch (err) {
      setError(t('PostModal.Error.AdditionFailed'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertTag = (tag, defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.slice(0, start);
    const selected = content.slice(start, end);
    const after = content.slice(end);

    const wrapped = `[${tag}]${selected || defaultText}[/${tag}]`;
    setContent(before + wrapped + after);

    setTimeout(() => {
      textarea.focus();
      const offset = selected ? selected.length : defaultText.length;
      const selectStart = start + tag.length + 2;
      const selectEnd = selectStart + offset;
      textarea.setSelectionRange(selectStart, selectEnd);
    }, 0);
  };

  return (
    <div className={styles.modalBackground}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{t('PostModal.AnswerToTopic')}</h2>

        {error && <p className={styles.errorText}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formField}>
            <div className={styles.toolsRow}>
              <button
                type="button"
                className={styles.toolButton}
                onClick={() => insertTag('spoiler', 'Texte caché')}
              >
                🔒 {t('PostModal.Spoiler')}
              </button>
              <button
                type="button"
                className={styles.toolButton}
                onClick={() => insertTag('b', 'Texte en gras')}
              >
                🅱️ {t('PostModal.Bold')}
              </button>
              <button
                type="button"
                className={styles.toolButton}
                onClick={() => insertTag('i', 'Texte en italique')}
              >
                {t('PostModal.Italic')}
              </button>
              <button
                type="button"
                className={styles.toolButton}
                onClick={() => insertTag('u', 'Texte souligné')}
              >
                {t('PostModal.Underline')}
              </button>
              <button
                type="button"
                className={styles.toolButton}
                onClick={() => insertTag('s', 'Texte barré')}
              >
                {t('PostModal.Strikethrough')}
              </button>
            </div>

            <textarea
              ref={textareaRef}
              placeholder={t('PostModal.MessagePlaceholder')}
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={token => setRecaptchaToken(token)}
            />
          </div>

          <div className={styles.buttonRow}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              {t('PostModal.Cancel')}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!content || !recaptchaToken || isSubmitting}
            >
              {isSubmitting ? t('PostModal.Sending') : t('PostModal.Publish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

PostModal.propTypes = {
  topicId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
