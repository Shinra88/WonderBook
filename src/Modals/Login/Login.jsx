import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './Login.module.css';

function Login({
  setUser,
  onClose,
  openRegister,
  openForgetPassword,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const login = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/login', { email, password });
      if (!response?.data?.token) {
        alert('Une erreur est survenue');
      } else {
        setUser(response.data);
        onClose(); // Ferme la modal après connexion réussie
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={styles.Login}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
      role="presentation"
    >
      <div className={styles.Form}>
        <h2>Connexion</h2>
        <label htmlFor="email">
          <p>E-mail</p>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label htmlFor="password">
          <p>Mot de passe</p>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className={styles.Option}>
          <button type="button" className={styles.LinkButton} onClick={() => { onClose(); openForgetPassword(); }}>
            Mot de passe oublié ?
          </button>
          <p>ou</p>
          <button type="button" className={styles.LinkButton} onClick={() => { onClose(); openRegister(); }}>
            Créer un compte
          </button>
        </div>
        <div className={styles.Submit}>
          <button type="button" className={styles.Cancel} onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className={styles.Validate} onClick={login} disabled={isLoading}>
            {isLoading ? 'Chargement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  openRegister: PropTypes.func.isRequired,
  openForgetPassword: PropTypes.func.isRequired,
};

export default Login;
