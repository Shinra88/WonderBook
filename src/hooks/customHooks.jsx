// 📁 hooks/customHooks.jsx - VERSION SÉCURISÉE
import { useState, useEffect } from 'react';
// ✅ CHANGEMENT : Remplacé authService par useAuth
import { useAuth } from './useAuth';
import { getBestRatedBooks, getLastAddedBooks, getBooks } from '../services/bookService';

/** ✅ Retrieves the logged in user - VERSION SÉCURISÉE */
export function useUser() {
  const [connectedUser, setConnectedUser] = useState(null);
  const [auth, setAuth] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  // ✅ CHANGEMENT : Utilise useAuth au lieu d'importer getAuthenticatedUser
  const { getAuthenticatedUser } = useAuth();

  useEffect(() => {
    async function getUserDetails() {
      try {
        // ✅ IDENTIQUE : Même logique, mais via useAuth sécurisé
        const { authenticated, user } = await getAuthenticatedUser();
        setConnectedUser(user);
        setAuth(authenticated);
      } catch (error) {
        console.error('Erreur authentification:', error);
        setConnectedUser(null);
        setAuth(false);
      } finally {
        setUserLoading(false);
      }
    }
    getUserDetails();
  }, [getAuthenticatedUser]); // ✅ AJOUT : Dépendance pour éviter les warnings

  return { connectedUser, auth, userLoading };
}

/** ✅ Retrieves the best rated books (with filters) */
export function useBestRatedBooks(filters) {
  const [bestRatedBooks, setBestRatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const response = await getBestRatedBooks(filters);
        setBestRatedBooks(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error('Erreur meilleurs livres:', err);
        setError('Erreur chargement des meilleurs livres');
        setBestRatedBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [filters]);

  return { bestRatedBooks, loading, error };
}

/** ✅ Retrieves the last added books (with filters) */
export function useLastAddedBooks(filters) {
  const [lastAddedBooks, setLastAddedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const response = await getLastAddedBooks(filters);
        setLastAddedBooks(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error('Erreur derniers livres:', err);
        setError('Erreur chargement des derniers livres');
        setLastAddedBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [filters]);

  return { lastAddedBooks, loading, error };
}

/** ✅ Retrieves the local file preview (image) */
export function useFilePreview(file) {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImgSrc(null);
    }
  }, [file]);

  return [imgSrc];
}

/** ✅ Retrieves all books (filtered + search) */
export function useFilteredBooks(filters = {}, page = 1, limit = 10) {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const { books: fetchedBooks, total: totalCount } = await getBooks(filters, page, limit);
        setBooks(Array.isArray(fetchedBooks) ? fetchedBooks : []);
        setTotal(totalCount || 0);
      } catch (err) {
        console.error('Erreur livres filtrés:', err);
        setError('Erreur chargement des livres');
        setBooks([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [filters, page, limit]);

  return { books, total, loading, error };
}
