import React, { useState, useEffect } from 'react';
import Avatar from '../../images/avatar.png';
import { updateUserById } from '../../services/adminServices';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import styles from './UserEditModal.module.css';

function UserEditModal({ user, onClose, onSave, isAdmin }) {
    const [showRemoveAvatarBtn, setShowRemoveAvatarBtn] = useState(false);
    const [showToast, setShowToast] = useState(false);

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const updated = await updateUserById(user.userId, form);
          onSave(updated);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2500); // Masquer après 2,5s
        } catch (err) {
          console.error('❌ Erreur lors de la sauvegarde :', err);
          alert('Erreur lors de la sauvegarde');
        }
      };      

  return (
    <div className={styles.modalBackground} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Modifier {user.name}</h2>
        {showToast && <ToastSuccess message="Modifications enregistrées ✔️" />}
        <form onSubmit={handleSubmit}>
            
        <div className={styles.formGroup}>
            <label>Avatar :</label>
            <div
                className={styles.avatarWrapper}
                onMouseEnter={() => setShowRemoveAvatarBtn(true)}
                onMouseLeave={() => setShowRemoveAvatarBtn(false)}
            >
                <img
                src={form.avatar || Avatar}
                alt="avatar"
                className={styles.avatarPreview}
                />
                {form.avatar && showRemoveAvatarBtn && (
                <button
                    type="button"
                    className={styles.removeAvatarBtn}
                    onClick={() => setForm(prev => ({ ...prev, avatar: '' }))}
                >
                    Supprimer
                </button>
                )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Pseudo :</label>
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
            <label>Email :</label>
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
              <label>Rôle :</label>
              <div className={styles.inputWrapper}>
                <select
                  name="role"
                  className={styles.inputField}
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="user">Utilisateur</option>
                  <option value="moderator">Modérateur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Statut :</label>
            <div className={styles.inputWrapper}>
              <select
                name="status"
                className={styles.inputField}
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                {isAdmin && <option value="banned">Banni</option>}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>À propos :</label>
            <textarea
              name="aboutMe"
              className={`${styles.textarea} ${styles.expanded}`}
              value={form.aboutMe}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Notifications :</label>
            <div className={styles.inputWrapper}>
              {['repForum', 'addCom', 'addBook', 'news'].map((notif) => (
                <label key={notif} style={{ marginRight: '10px' }}>
                  <input
                    type="checkbox"
                    name={notif}
                    checked={form[notif]}
                    onChange={handleChange}
                  /> {notif}
                </label>
              ))}
            </div>
          </div>
          {isAdmin && (
            <div className={styles.formGroup}>
              <label>Mot de passe :</label>
              <div className={styles.inputWrapper}>
                <button
                  type="button"
                  className={styles.resetPass}
                  onClick={async () => {
                    try {
                        await api.post('/auth/forget-password', { email: user.mail, recaptchaToken: 'bypass_for_admin' });
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 2500);
                        
                      alert('Lien de réinitialisation envoyé');
                    } catch (err) {
                      alert("Erreur lors de l'envoi du lien.");
                      console.error(err);
                    }
                  }}
                >
                  Envoyer un lien de réinitialisation
                </button>
              </div>
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.validate}>
              Sauvegarder
            </button>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserEditModal;
