import axios from 'axios';
import { API_ROUTES } from '../utils/constants';

export async function getLastAddedBooks() {
  try {
    const response = await axios.get(API_ROUTES.LAST_ADDED);
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des derniers livres ajoutés :", err);
    return [];
  }
}

/** ✅ Stockage local */
export function storeInLocalStorage(token, userId) {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
}

export function getFromLocalStorage(item) {
  return localStorage.getItem(item);
}

/** ✅ Récupération de l'utilisateur authentifié */
export async function getAuthenticatedUser() {
  try {
    const token = getFromLocalStorage('token');
    const userId = getFromLocalStorage('userId');
    if (!token) return { authenticated: false, user: null };
    return { authenticated: true, user: { userId, token } };
  } catch (err) {
    console.error("getAuthenticatedUser: Erreur", err);
    return { authenticated: false, user: null };
  }
}

/** ✅ Récupère tous les livres */
export async function getBooks() {
  try {
    const response = await axios.get(`${API_ROUTES.BOOKS}`);
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des livres :", err);
    return [];
  }
}

/** ✅ Récupère un livre spécifique */
export async function getBook(id) {
  try {
    const response = await axios.get(`${API_ROUTES.BOOKS}/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération du livre :", err);
    return null;
  }
}

/** ✅ Récupère les livres les mieux notés */
export async function getBestRatedBooks() {
  try {
    const response = await axios.get(`${API_ROUTES.BEST_RATED}`);
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des meilleurs livres :", err);
    return [];
  }
}

/** ✅ Supprime un livre */
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

/** ✅ Évalue un livre */
export async function rateBook(bookId, userId, rating) {
  const data = { userId, rating: parseInt(rating, 10) };

  try {
    const response = await axios.post(`${API_ROUTES.BOOKS}/${bookId}/rating`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la notation du livre :", err);
    return err.message;
  }
}

/** ✅ Ajoute un livre */
export async function addBook(data) {
  const userId = localStorage.getItem('userId');
  const book = {
    userId,
    title: data.title,
    author: data.author,
    date: data.year, // 🟢 correspondance exacte avec le champ du backend
    editor: data.editor,
    ratings: [{ userId, score: data.rating ? parseInt(data.rating, 10) : 0 }],
    averageRating: parseInt(data.rating, 10) || 0,
  };

  const bodyFormData = new FormData();
  bodyFormData.append('book', JSON.stringify(book));
  bodyFormData.append('image', data.file?.[0]);

  try {
    return await axios.post(`${API_ROUTES.BOOKS}`, bodyFormData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  } catch (err) {
    console.error("Erreur lors de l'ajout du livre :", err);
    return { error: true, message: err.message };
  }
}

/** ✅ Met à jour un livre */
export async function updateBook(data, id) {
  const userId = localStorage.getItem('userId');

  const book = {
    userId,
    title: data.title,
    author: data.author,
    date: data.year, // 🟢 mise à jour du champ
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
    console.error("Erreur lors de la mise à jour du livre :", err);
    return { error: true, message: err.message };
  }
}

/** ✅ Upload d'image vers S3 */
export async function uploadImageToS3(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_ROUTES.UPLOAD_IMAGE}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.imageUrl; // ✅ Assurez-vous que le backend renvoie `imageUrl`
  } catch (error) {
    console.error("❌ Erreur lors de l'upload de l'image sur S3 :", error);
    return null;
  }
}
