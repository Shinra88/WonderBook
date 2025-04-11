import { createContext, useContext, useEffect, useState } from 'react';

// Crée le contexte d'authentification
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Vérifie si le token est encore valide
  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('token_expiry');

    if (token && expiry && Date.now() < parseInt(expiry, 10)) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setUser({ ...storedUser, token });
    } else {
      logout(); // Token expiré
    }
  }, []);

  const login = (userData, token) => {
    const expiresAt = Date.now() + 3 * 60 * 60 * 1000; // 3h
    localStorage.setItem('token', token);
    localStorage.setItem('token_expiry', expiresAt.toString());
    localStorage.setItem('user', JSON.stringify(userData));
    setUser({ ...userData, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser dans toute l'app
export function useAuth() {
  return useContext(AuthContext);
}
