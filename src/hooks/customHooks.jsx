// 📁 hooks/customHooks.jsx
import { useState, useEffect } from 'react';
import { getAuthenticatedUser } from '../services/authService';
import {
  getBestRatedBooks,
  getLastAddedBooks,
  getBooks,
} from '../services/bookService';

/** ✅ Récupère l'utilisateur connecté */
export function useUser() {
  const [connectedUser, setConnectedUser] = useState(null);
  const [auth, setAuth] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    async function getUserDetails() {
      const { authenticated, user } = await getAuthenticatedUser();
      setConnectedUser(user);
      setAuth(authenticated);
      setUserLoading(false);
    }
    getUserDetails();
  }, []);

  return { connectedUser, auth, userLoading };
}

/** ✅ Récupère les meilleurs livres (avec filtres) */
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
        console.error("Erreur meilleurs livres:", err);
        setError("Erreur chargement des meilleurs livres");
        setBestRatedBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [filters]);

  return { bestRatedBooks, loading, error };
}

/** ✅ Récupère les derniers livres ajoutés (avec filtres) */
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
        console.error("Erreur derniers livres:", err);
        setError("Erreur chargement des derniers livres");
        setLastAddedBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [filters]);

  return { lastAddedBooks, loading, error };
}

/** ✅ Prévisualisation locale de fichier (image) */
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

/** ✅ Récupère tous les livres (filtrés) */
export function useFilteredBooks(filters) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const response = await getBooks(filters);
        setBooks(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error("Erreur livres filtrés:", err);
        setError("Erreur chargement des livres");
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [filters]);

  return { books, loading, error };
}