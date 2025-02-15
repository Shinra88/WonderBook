import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForgetSend.module.css';

function ForgetSend() {
  const navigate = useNavigate();
  const handleClickOutside = (event) => {
    if (event.target.classList.contains(styles.ForgetSend)) {
      navigate('/');
    }
  };
  return (
    <div
      className={styles.ForgetSend}
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
            Un e-mail de Réinitialisation à été envoyé à votre adresse e-mail.
          </p>
        </div>
        <button type="submit" onClick={() => navigate('/')} className={styles.Validate}>
          <span>Ok</span>
        </button>
      </div>
    </div>
  );
}

export default ForgetSend;
