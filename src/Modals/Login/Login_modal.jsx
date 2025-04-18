import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api/api';
import styles from './Login.module.css';

function LoginModal({ onClose, openRegister, openForgetPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Tentative de login vers :', import.meta.env.VITE_BACKEND_URL + '/api/auth/login');

      const res = await api.post('/auth/login', {
        mail: email,
        password,
      });

      if (!res?.data?.token) {
        alert('Une erreur est survenue');
        return;
      }

      login(res.data.user, res.data.token); // ✅ Appelle le contexte Auth
      onClose();

    } catch (err) {
      console.error('Erreur de login :', err?.response?.data || err.message || err);
      alert(err?.response?.data?.error || 'Erreur lors de la connexion');    
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={styles.Login}
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
          <button
            type="submit"
            className={styles.Validate}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}

LoginModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  openRegister: PropTypes.func.isRequired,
  openForgetPassword: PropTypes.func.isRequired,
};

export default LoginModal;
