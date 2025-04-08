import React, { useState } from 'react';
import Banner from '../../images/library.png';
import Avatar from '../../images/avatar.png';
import FeatherIcon from '../../images/feather.png';
import styles from './Account.module.css';
import ChangePass from '../../modals/ChangePass/ChangePass';

function Account() {
  const [showChangePass, setShowChangePass] = useState(false);
  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  // État pour gérer chaque switch individuellement
  const [switches, setSwitches] = useState({
    forumReply: false,
    commentAdded: false,
    bookAdded: false,
    newsUpdates: false,
  });

  // Fonction pour gérer le toggle d’un switch spécifique
  const toggleSwitch = (switchName) => {
    setSwitches((prevState) => ({
      ...prevState,
      [switchName]: !prevState[switchName],
    }));
  };

  const toggleEdit = () => {
    setIsEditing((prevState) => !prevState);
  };

  return (
    <div className={styles.account}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <div className={styles.buttonContainer}>
          <button type="button" className={styles.Button} onClick={toggleEdit} aria-label="edit">
            {isEditing ? 'Terminer' : 'Éditer Profil'}
            <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
          </button>

          {isEditing && (
            <div>
              <button type="button" className={styles.Button} onClick={() => setShowChangePass(true)}>
                Changer le mot de passe
                <img
                  src={FeatherIcon}
                  alt="Feather Icon"
                  className={styles.icon}
                />
              </button>
              {showChangePass && <ChangePass onClose={() => setShowChangePass(false)} />}
            </div>
          )}
        </div>

        <section className={styles.info}>
          <article>
            <label htmlFor="username">
              <p>Pseudo</p>
              <input
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
              />
            </label>

            <label htmlFor="email">
              <p>E-mail</p>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
              />
            </label>
          </article>
          <aside>
            <label htmlFor="attachment" className={styles.ImageUpload}>
              <div className={styles.ImageContainer}>
                <img src={Avatar} alt="Upload Icon" className={styles.UploadIcon} />
                <p className={styles.FormatText}>Formats d’image acceptés</p>
                <p className={styles.FormatTypes}>PNG, JPEG, WEBP</p>
              </div>
              <input
                type="file"
                id="attachment"
                className={styles.FileInput}
                accept=".png, .jpeg, .jpg, .webp"
                disabled={!isEditing}
              />
            </label>
          </aside>
        </section>
        <hr />

        <section className={styles.notif}>
          <h4>Notifications:</h4>
          <article className={styles.article_switch}>
            <div className={styles.switch_container}>
              <p>Réponse Forum</p>
              <label htmlFor="switch1" className={styles.switch}>
                <input
                  type="checkbox"
                  id="switch1"
                  checked={switches.forumReply}
                  onChange={() => toggleSwitch('forumReply')}
                  disabled={!isEditing}
                />
                <span className={styles.slider} />
              </label>
            </div>
            <div className={styles.switch_container}>
              <p>Ajout d’un commentaire</p>
              <label htmlFor="switch2" className={styles.switch}>
                <input
                  type="checkbox"
                  id="switch2"
                  checked={switches.commentAdded}
                  onChange={() => toggleSwitch('commentAdded')}
                  disabled={!isEditing}
                />
                <span className={styles.slider} />
              </label>
            </div>
            <div className={styles.switch_container}>
              <p>Ajout d’un livre</p>
              <label htmlFor="switch3" className={styles.switch}>
                <input
                  type="checkbox"
                  id="switch3"
                  checked={switches.bookAdded}
                  onChange={() => toggleSwitch('bookAdded')}
                  disabled={!isEditing}
                />
                <span className={styles.slider} />
              </label>
            </div>
            <div className={styles.switch_container}>
              <p>Actualités</p>
              <label htmlFor="switch4" className={styles.switch}>
                <input
                  type="checkbox"
                  id="switch4"
                  checked={switches.newsUpdates}
                  onChange={() => toggleSwitch('newsUpdates')}
                  disabled={!isEditing}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </article>
        </section>
        <hr />

        <section className={styles.pres}>
          <h4>Mon Univers Littéraire:</h4>
          <article>
            <label htmlFor="pres">
              <textarea
                name="pres"
                id="pres"
                disabled={!isEditing}
              />
            </label>
          </article>
        </section>
      </main>
    </div>
  );
}

export default Account;
