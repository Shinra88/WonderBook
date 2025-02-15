import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterSend.module.css';

function RegisterSend() {
  const navigate = useNavigate();
  const handleClickOutside = (event) => {
    if (event.target.classList.contains(styles.RegisterSend)) {
      navigate('/');
    }
  };
  return (
    <div
      className={styles.RegisterSend}
      onClick={handleClickOutside}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClickOutside(e);
        }
      }}
    >
      <div className={styles.Form}>
        <h2>Inscription</h2>
        <div className={styles.Content}>
          <p>
            Un e-mail de confirmation à été envoyé à votre adresse e-mail.
          </p>
        </div>
        <button type="submit" onClick={() => navigate('/')} className={styles.Validate}>
          <span>Ok</span>
        </button>
      </div>
    </div>
  );
}

export default RegisterSend;
