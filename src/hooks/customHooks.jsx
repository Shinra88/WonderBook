import { useState, useEffect } from 'react';
import { getBestRatedBooks, getLastAddedBooks } from '../services/bookService';

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

// export function useBestRatedBooks() {
//   const [bestRatedBooks, setBestRatedBooks] = useState({});

//   useEffect(() => {
//     async function getRatedBooks() {
//       const books = await getBestRatedBooks();
//       setBestRatedBooks(books);
//     }
//     getRatedBooks();
//   }, []);

//   return { bestRatedBooks };
// }

export function useBestRatedBooks() {
  const [bestRatedBooks, setBestRatedBooks] = useState([]);
  const [error, setError] = useState(null); // Nouvelle variable d'état pour les erreurs

  useEffect(() => {
    async function fetchRateBooks() {
      try {
        const response = await getBestRatedBooks();
        if (Array.isArray(response)) {
          setBestRatedBooks(response);
        } else {
          setBestRatedBooks([]); // Si la réponse n'est pas un tableau, utiliser un tableau vide
          setError("La réponse des livres ajoutés n'est pas un tableau valide.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des meilleurs livres :", error);
        setError("Erreur lors de la récupération des meilleurs livres.");
        setBestRatedBooks([]);
      }
    }
    fetchRateBooks();
  }, []);

  return { bestRatedBooks, error };
}

export function useLastAddedBooks() {
  const [lastAddedBooks, setLastAddedBooks] = useState([]);
  const [error, setError] = useState(null); // Nouvelle variable d'état pour les erreurs

  useEffect(() => {
    async function fetchLastBooks() {
      try {
        const response = await getLastAddedBooks();
        if (Array.isArray(response)) {
          setLastAddedBooks(response);
        } else {
          setLastAddedBooks([]); // Si la réponse n'est pas un tableau, utiliser un tableau vide
          setError("La réponse des livres ajoutés n'est pas un tableau valide.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des derniers livres :", error);
        setError("Erreur lors de la récupération des derniers livres.");
        setLastAddedBooks([]);
      }
    }
    fetchLastBooks();
  }, []);

  return { lastAddedBooks, error };
}

export function useFilePreview(file) {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (file && file[0]?.length > 0) {
      const newUrl = URL.createObjectURL(file[0][0]);

      if (newUrl !== imgSrc) {
        setImgSrc(newUrl);
      }
    }
  }, [file]);

  return [imgSrc, setImgSrc];
}
