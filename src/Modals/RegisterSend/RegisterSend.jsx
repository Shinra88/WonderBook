import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './RegisterSend.module.css';

function RegisterSend() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || null;

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
          {user ? (
            <>
              <p>
                Bienvenue <strong>{user.name}</strong> !
              </p>
              <p>
                Un e-mail de confirmation a été envoyé à <strong>{user.mail}</strong>.
              </p>
            </>
          ) : (
            <p className={styles.Error}>
              Les données d'inscription sont manquantes.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className={styles.Validate}
        >
          Ok
        </button>
      </div>
    </div>
  );
}

export default RegisterSend;
