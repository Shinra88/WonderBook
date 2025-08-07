// useAuth.jsx - VERSION SÉCURISÉE et COMPATIBLE avec SonarQube
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { loginUser, logoutUser, fetchAuthenticatedUser } from '../services/authService';
import PropTypes from 'prop-types';

// Crée le contexte d'authentification
const AuthContext = createContext(null);

/**
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Déclare checkAuthStatus AVANT useEffect
  const checkAuthStatus = useCallback(async () => {
    try {
      const userData = await fetchAuthenticatedUser();
      setUser(userData);
    } catch {
      console.error('Erreur vérification auth:');
      setUser(null);
    }
  }, []);

  // Appelle checkAuthStatus au montage
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (mail, password, recaptchaToken) => {
    try {
      const data = await loginUser(mail, password, recaptchaToken);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      console.error('Erreur logout');
    } finally {
      setUser(null);
    }
  }, []);

  const register = useCallback(async (name, mail, password, recaptchaToken, website = '') => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, mail, password, recaptchaToken, website }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        return { success: true, user: userData.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch {
      return { success: false, error: 'Erreur de connexion' };
    }
  }, []);

  const updateUserProfile = useCallback(async form => {
    try {
      const body = {
        ...form,
        avatar: form.avatar,
        repForum: form.repForum ? 1 : 0,
        addCom: form.addCom ? 1 : 0,
        addBook: form.addBook ? 1 : 0,
        news: form.news ? 1 : 0,
      };

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Erreur mise à jour du profil' };
      }
    } catch {
      return { success: false, error: 'Erreur de connexion' };
    }
  }, []);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, message: result.message };
      } else {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erreur lors du changement de mot de passe',
        };
      }
    } catch {
      return { success: false, message: 'Erreur de connexion' };
    }
  }, []);

  const getAuthenticatedUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return { authenticated: true, user: userData };
      } else {
        return { authenticated: false, user: null };
      }
    } catch {
      console.error('Erreur auth user:');
      return { authenticated: false, user: null };
    }
  }, []);

  // ✅ useMemo pour éviter les recréations inutiles à chaque render
  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      register,
      updateUserProfile,
      changePassword,
      getAuthenticatedUser,
    }),
    [user, login, logout, register, updateUserProfile, changePassword, getAuthenticatedUser]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// ✅ Validation des props (SonarQube)
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook pour utiliser l'auth dans les composants
export function useAuth() {
  return useContext(AuthContext);
}
