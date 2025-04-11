import React, { useState, useEffect } from 'react';
import Banner from '../../images/library.png';
import Avatar from '../../images/avatar.png';
import FeatherIcon from '../../images/feather.png';
import styles from './Account.module.css';
import ChangePass from '../../modals/ChangePass/ChangePass';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/authService';
import { updateAvatarOnS3 } from '../../services/uploadServices';

function Account() {
  const { user, login } = useAuth();
  const token = user?.token;
  const [showChangePass, setShowChangePass] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    name: '',
    mail: '',
    aboutMe: '',
    avatar: '',
    repForum: false,
    addCom: false,
    addBook: false,
    news: false,
  });

  const [originalForm, setOriginalForm] = useState(null);

  useEffect(() => {
    if (user) {
      const userForm = {
        name: user.name || '',
        mail: user.mail || '',
        aboutMe: user.aboutMe || '',
        avatar: user.avatar || '',
        repForum: !!user.repForum,
        addCom: !!user.addCom,
        addBook: !!user.addBook,
        news: !!user.news,
      };
      setForm(userForm);
      setOriginalForm(userForm);
    }
  }, [user]);

  const toggleEdit = () => {
    if (isEditing) handleSaveChanges();
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    const isSame = JSON.stringify(form) === JSON.stringify(originalForm);
    if (isSame) {
      alert("Aucune modification détectée.");
      setIsEditing(false);
      return;
    }

    const confirmed = window.confirm("Confirmer la mise à jour de votre profil ?");
    if (!confirmed) return;

    try {
      const response = await updateUserProfile(form);
      if (response.user) {
        login(response.user, token); // Met à jour le localStorage
        setOriginalForm(form); // Met à jour l'originalForm pour éviter des modifications non enregistrées
        alert('Modifications enregistrées');
      }
    } catch (err) {
      alert("Erreur lors de la sauvegarde du profil");
      console.error(err);
    } finally {
      setIsEditing(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const userId = user?.userId;
    const oldUrl = user?.avatar;
  
    // Mise à jour de l'avatar dans AWS S3
    const newUrl = await updateAvatarOnS3(file, userId, oldUrl);
    if (!newUrl) return alert("Erreur lors du changement d'image");
  
    // Mise à jour immédiate de l'avatar dans le formulaire
    setForm((prev) => ({ ...prev, avatar: newUrl }));
  
    // Mise à jour de l'utilisateur dans le localStorage
    await login({ ...user, avatar: newUrl }, token); // Relance login pour mettre à jour le localStorage et l'état global
  
    // Ajout d'un délai de 2 à 3 secondes avant de recharger la page
    setTimeout(() => {
      window.location.reload(); // Cette ligne force un rafraîchissement de la page après 2-3 secondes
    }, 2000); // Délai de 2000 ms (2 secondes), vous pouvez ajuster cette valeur à 3000 ms pour 3 secondes
  }; 

  const handleCancel = () => {
    setForm(originalForm);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSwitch = (field) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  return (
    <div className={styles.account}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <div className={styles.buttonContainer}>
          {!isEditing ? (
            <button type="button" className={styles.Button} onClick={toggleEdit}>
              Éditer Profil
              <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
            </button>
          ) : (
            <>
              <button type="button" className={styles.Button} onClick={toggleEdit}>
                Terminer
                <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
              </button>
              <button type="button" className={styles.Button} onClick={() => setShowChangePass(true)}>
                Changer le mot de passe
                <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
              </button>
              <button type="button" className={styles.cancelButton} onClick={handleCancel}>
                Annuler
              </button>
            </>
          )}
          {showChangePass && (
            <ChangePass
              onClose={() => setShowChangePass(false)}
              onSuccess={() => {
                setShowChangePass(false);
                setIsEditing(false);
              }}
            />
          )}
        </div>

        <section className={styles.info}>
          <article>
            <label>
              <p>Pseudo</p>
              <input type="text" name="name" value={form.name} onChange={handleChange} disabled={!isEditing} />
            </label>
            <label>
              <p>E-mail</p>
              <input type="email" name="mail" value={form.mail} onChange={handleChange} disabled={!isEditing} />
            </label>
          </article>

          <aside>
            <label htmlFor="attachment" className={styles.UploadIcon}>
              <div className={styles.ImageContainer}>
                <img
                  src={
                    form.avatar // Utilise l'avatar mis à jour immédiatement après le chargement
                      ? form.avatar
                      : user?.avatar?.startsWith('http')
                      ? user.avatar
                      : Avatar
                  }
                  alt="Avatar utilisateur"
                  className={styles.icon}
                />
                <p className={styles.FormatText}>Formats d’image acceptés</p>
                <p className={styles.FormatTypes}>PNG, JPEG, WEBP</p>
              </div>
              <input
                type="file"
                id="attachment"
                className={styles.FileInput}
                accept=".png, .jpeg, .jpg, .webp"
                disabled={!isEditing}
                onChange={handleAvatarChange} // Lorsque l'image est choisie, on l'affiche immédiatement
              />
            </label>
          </aside>
        </section>

        <hr />

        <section className={styles.notif}>
          <h4>Notifications:</h4>
          <article className={styles.article_switch}>
            {[
              ['repForum', 'Réponse Forum'],
              ['addCom', 'Ajout d’un commentaire'],
              ['addBook', 'Ajout d’un livre'],
              ['news', 'Actualités'],
            ].map(([key, label]) => (
              <div className={styles.switch_container} key={key}>
                <p>{label}</p>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={() => toggleSwitch(key)}
                    disabled={!isEditing}
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            ))}
          </article>
        </section>

        <hr />

        <section className={styles.pres}>
          <h4>Mon Univers Littéraire:</h4>
          <textarea
            name="aboutMe"
            value={form.aboutMe}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </section>
      </main>
    </div>
  );
}

export default Account;
