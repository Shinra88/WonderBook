import { useState, useEffect } from 'react';
import Avatar from '../../images/avatar.webp';
import { updateUserById } from '../../services/adminServices';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import { useTranslation } from 'react-i18next';
import api from '../../services/api/api';
import styles from './UserEditModal.module.css';

function UserEditModal({ user, onClose, onSave, isAdmin }) {
  const [showRemoveAvatarBtn, setShowRemoveAvatarBtn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    mail: '',
    role: '',
    status: '',
    aboutMe: '',
    repForum: false,
    addCom: false,
    addBook: false,
    news: false,
  });

  useEffect(() => {
    if (user) {
      setForm({
        userId: user.userId,
        name: user.name || '',
        mail: user.mail || '',
        avatar: user.avatar || '',
        aboutMe: user.aboutMe || '',
        role: user.role || 'user',
        status: user.status || 'active',
        repForum: user.repForum ?? false,
        addCom: user.addCom ?? false,
        addBook: user.addBook ?? false,
        news: user.news ?? false,
      });
    }
  }, [user]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const updated = await updateUserById(user.userId, form);
      onSave(updated);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error(t('UserEditModal.ErrorUpdatingUser'), err);
      alert(t('UserEditModal.ErrorUpdatingUser'));
    }
  };

  return (
    <div className={styles.modalBackground} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2>{t('UserEditModal.Title', { name: user.name })}</h2>
        {showToast && <ToastSuccess message={t('UserEditModal.ChangesSaved')} />}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>{t('UserEditModal.Avatar')} :</label>
            <div
              className={styles.avatarWrapper}
              onMouseEnter={() => setShowRemoveAvatarBtn(true)}
              onMouseLeave={() => setShowRemoveAvatarBtn(false)}>
              <img src={form.avatar || Avatar} alt="avatar" className={styles.avatarPreview} />
              {form.avatar && showRemoveAvatarBtn && (
                <button
                  type="button"
                  className={styles.removeAvatarBtn}
                  onClick={() => setForm(prev => ({ ...prev, avatar: '' }))}>
                  {t('UserEditModal.Delete')}
                </button>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>{t('UserEditModal.Username')} :</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="name"
                className={styles.inputField}
                value={form.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>{t('UserEditModal.Email')} :</label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                name="mail"
                className={styles.inputField}
                value={form.mail}
                onChange={handleChange}
              />
            </div>
          </div>

          {isAdmin && (
            <div className={styles.formGroup}>
              <label>{t('UserEditModal.Role')} :</label>
              <div className={styles.inputWrapper}>
                <select
                  name="role"
                  className={styles.inputField}
                  value={form.role}
                  onChange={handleChange}>
                  <option value="user">{t('UserEditModal.User')}</option>
                  <option value="moderator">{t('UserEditModal.Moderator')}</option>
                  <option value="admin">{t('UserEditModal.Admin')}</option>
                </select>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>{t('UserEditModal.Status')} :</label>
            <div className={styles.inputWrapper}>
              <select
                name="status"
                className={styles.inputField}
                value={form.status}
                onChange={handleChange}>
                <option value="active">{t('UserEditModal.Active')}</option>
                <option value="suspended">{t('UserEditModal.Suspended')}</option>
                {isAdmin && <option value="banned">{t('UserEditModal.Banned')}</option>}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>{t('UserEditModal.About')} :</label>
            <textarea
              name="aboutMe"
              className={`${styles.textarea} ${styles.expanded}`}
              value={form.aboutMe}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('UserEditModal.Notifications')} :</label>
            <div className={styles.inputWrapper}>
              {['repForum', 'addCom', 'addBook', 'news'].map(notif => (
                <label key={notif} style={{ marginRight: '10px' }}>
                  <input
                    type="checkbox"
                    name={notif}
                    checked={form[notif]}
                    onChange={handleChange}
                  />{' '}
                  {notif}
                </label>
              ))}
            </div>
          </div>
          {isAdmin && (
            <div className={styles.formGroup}>
              <label>{t('UserEditModal.Password')} :</label>
              <div className={styles.inputWrapper}>
                <button
                  type="button"
                  className={styles.resetPass}
                  onClick={async () => {
                    try {
                      await api.post('/auth/forget-password', {
                        email: user.mail,
                        recaptchaToken: 'bypass_for_admin',
                      });
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 2500);

                      alert(t('UserEditModal.ResetLinkSent'));
                    } catch (err) {
                      alert(t('UserEditModal.ErrorSendingResetLink'));
                      console.error(err);
                    }
                  }}>
                  {t('UserEditModal.SendResetLink')}
                </button>
              </div>
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.validate}>
              {t('UserEditModal.Save')}
            </button>
            <button type="button" className={styles.cancel} onClick={onClose}>
              {t('UserEditModal.Cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserEditModal;
