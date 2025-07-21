import { useState, useEffect } from 'react';
import Banner from '../../images/library.png';
import Avatar from '../../images/avatar.png';
import FeatherIcon from '../../images/feather.png';
import styles from './Account.module.css';
import ChangePass from '../../modals/ChangePass/ChangePass';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/authService';
import { updateAvatarOnS3 } from '../../services/uploadServices';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Account() {
  const { user, login } = useAuth();
  const token = user?.token;
  const [showChangePass, setShowChangePass] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

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
      alert(t('Account.NoChangesDetected'));
      setIsEditing(false);
      return;
    }

    const confirmed = window.confirm(t('Account.ConfirmProfileUpdate'));
    if (!confirmed) return;

    try {
      const response = await updateUserProfile(form);
      if (response.user) {
        login(response.user, token);
        setOriginalForm(form);
        alert(t('Account.ProfileUpdated'));
      }
    } catch (err) {
      alert(t('Account.ProfileUpdateError'));
      console.error(err);
    } finally {
      setIsEditing(false);
    }
  };

  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const userId = user?.userId;
    const oldUrl = user?.avatar;

    // Update avatar in AWS S3
    const newUrl = await updateAvatarOnS3(file, userId, oldUrl);
    if (!newUrl) return alert(t('Account.ErrorUpdatingAvatar'));

    // Immediate update of the avatar in the form
    setForm(prev => ({ ...prev, avatar: newUrl }));

    // Update user in localStorage
    await login({ ...user, avatar: newUrl }, token);

    // Add a delay of 2 to 3 seconds before reloading the page
    setTimeout(() => {
      window.location.reload(); // This line forces a page refresh after 2-3 seconds
    }, 2000); // Delay of 2000 ms (2 seconds), you can adjust this value to 3000 ms for 3 seconds
  };

  const handleCancel = () => {
    setForm(originalForm);
    setIsEditing(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleSwitch = field => {
    setForm(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  return (
    <div className={styles.account}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <div className={styles.buttonContainer}>
          {!isEditing ? (
            <button type="button" className={styles.Button} onClick={toggleEdit}>
              {t('Account.EditProfile')}
              <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
            </button>
          ) : (
            <>
              <button type="button" className={styles.Button} onClick={toggleEdit}>
                {t('Account.Finish')}
                <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
              </button>
              <button
                type="button"
                className={styles.Button}
                onClick={() => setShowChangePass(true)}
              >
                {t('Account.ChangePassword')}
                <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
              </button>
              <button type="button" className={styles.cancelButton} onClick={handleCancel}>
                {t('Account.Cancel')}
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
              <p>{t('Account.Username')}</p>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </label>
            <label>
              <p>{t('Account.Email')}</p>
              <input
                type="email"
                name="mail"
                value={form.mail}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </label>
          </article>

          <aside>
            <label htmlFor="attachment" className={styles.UploadIcon}>
              <div className={styles.ImageContainer}>
                <img
                  src={
                    form.avatar // Uses the updated avatar immediately after loading
                      ? form.avatar
                      : user?.avatar?.startsWith('http')
                        ? user.avatar
                        : Avatar
                  }
                  alt="Avatar utilisateur"
                  className={styles.icon}
                />
                <p className={styles.FormatText}>{t('Account.AcceptedImageFormats')}</p>
                <p className={styles.FormatTypes}>PNG, JPEG, WEBP</p>
              </div>
              <input
                type="file"
                id="attachment"
                className={styles.FileInput}
                accept=".png, .jpeg, .jpg, .webp"
                disabled={!isEditing}
                onChange={handleAvatarChange} // When the image is chosen, it is displayed immediately
              />
            </label>
          </aside>
        </section>

        <hr />

        <section className={styles.notif}>
          <h4>{t('Account.Notifications')}</h4>
          <article className={styles.article_switch}>
            {[
              ['repForum', t('Account.RepForum')],
              ['addCom', t('Account.AddCom')],
              ['addBook', t('Account.AddBook')],
              ['news', t('Account.News')],
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
          <h4>{t('Account.AboutMe')}:</h4>
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
