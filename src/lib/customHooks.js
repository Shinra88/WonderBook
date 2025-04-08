import { useState, useEffect } from 'react';
import { getAuthenticatedUser, getBestRatedBooks, getLastAddedBooks } from './common';

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

export function useBestRatedBooks() {
  const [bestRatedBooks, setBestRatedBooks] = useState({});

  useEffect(() => {
    async function getRatedBooks() {
      const books = await getBestRatedBooks();
      setBestRatedBooks(books);
    }
    getRatedBooks();
  }, []);

  return { bestRatedBooks };
}

export function useFilePreview(file) {
  const fileInput = file[0] ?? [];
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (file && file[0]?.length > 0) {
      const newUrl = URL.createObjectURL(file[0][0]);

      if (newUrl !== imgSrc) {
        setImgSrc(newUrl);
      }
    }
  }, [fileInput[0]?.name]);

  return [imgSrc, setImgSrc];
}

export function useLastAddedBooks() {
  const [lastAddedBooks, setLastAddedBooks] = useState([]);

  useEffect(() => {
    async function fetchLastBooks() {
      const response = await getLastAddedBooks();
      setLastAddedBooks(response);
    }
    fetchLastBooks();
  }, []);

  return { lastAddedBooks };
}

