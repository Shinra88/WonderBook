// 📁 services/bookService.js
import axios from 'axios';
import { API_ROUTES } from '../utils/constants';

// ✅ Récupère tous les livres
export async function getBooks() {
  try {
    const response = await axios.get(API_ROUTES.BOOKS.BASE);
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des livres :", err);
    return [];
  }
}

// ✅ Récupère un livre par ID
export async function getBook(id) {
  try {
    const response = await axios.get(`${API_ROUTES.BOOKS}/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération du livre :", err);
    return null;
  }
}

// ✅ Récupère les livres les mieux notés
export async function getBestRatedBooks() {
  try {
    const response = await axios.get(API_ROUTES.BOOKS.BEST_RATED);
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des meilleurs livres :", err);
    return [];
  }
}

// ✅ Récupère les 5 derniers livres ajoutés
export async function getLastAddedBooks() {
  try {
    const response = await axios.get(API_ROUTES.BOOKS.LAST_ADDED);
    return response.data;
  } catch (err) {
    console.error("Erreur lors des derniers livres :", err);
    return [];
  }
}

// ✅ Supprime un livre
export async function deleteBook(id) {
  try {
    await axios.delete(`${API_ROUTES.BOOKS}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return true;
  } catch (err) {
    console.error("Erreur lors de la suppression du livre :", err);
    return false;
  }
}

// ✅ Ajoute un livre (et upload image)
export async function addBook(data) {
  const userId = localStorage.getItem('userId');
  const book = {
    userId,
    title: data.title,
    author: data.author,
    date: data.year,
    editor: data.editor,
    ratings: [{ userId, score: data.rating ? parseInt(data.rating, 10) : 0 }],
    averageRating: parseInt(data.rating, 10) || 0,
  };

  const bodyFormData = new FormData();
  bodyFormData.append('book', JSON.stringify(book));
  bodyFormData.append('image', data.file?.[0]);

  try {
    const response = await axios.post(API_ROUTES.BOOKS, bodyFormData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  } catch (err) {
    console.error("Erreur ajout livre :", err);
    return { error: true, message: err.message };
  }
}

// ✅ Met à jour un livre (avec ou sans nouvelle image)
export async function updateBook(data, id) {
  const userId = localStorage.getItem('userId');
  const book = {
    userId,
    title: data.title,
    author: data.author,
    date: data.year,
    editor: data.editor,
  };

  let newData;
  if (data.file?.[0]) {
    newData = new FormData();
    newData.append('book', JSON.stringify(book));
    newData.append('image', data.file[0]);
  } else {
    newData = book;
  }

  try {
    const response = await axios.put(`${API_ROUTES.BOOKS}/${id}`, newData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  } catch (err) {
    console.error("Erreur mise à jour livre :", err);
    return { error: true, message: err.message };
  }
}

// ✅ Notation d’un livre
export async function rateBook(bookId, userId, rating) {
  const data = { userId, rating: parseInt(rating, 10) };
  try {
    const response = await axios.post(`${API_ROUTES.BOOKS}/${bookId}/rating`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  } catch (err) {
    console.error("Erreur notation livre :", err);
    return err.message;
  }
}
