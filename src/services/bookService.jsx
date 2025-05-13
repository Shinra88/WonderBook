// 📁 services/bookService.js
import api from '../services/api/api';
import { API_ROUTES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

// ✅ Fonction utilitaire pour appliquer les filtres à une URL
function appendFiltersToParams(params, filters = {}) {
  if (filters.year) params.append('year', filters.year);
  if (filters.start && filters.end) {
    params.append('start', filters.start);
    params.append('end', filters.end);
  }
  if (filters.categories?.length) {
    filters.categories.forEach((cat) => params.append('categories', cat));
  }
  if (filters.type) params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);

  // 🆕 Ajout pour tri admin/modo
  if (filters.pendingFirst) params.append('pendingFirst', 'true');
}

// ✅ Récupère tous les livres (avec ou sans filtres)
export async function getBooks(filters = {}, page = 1, limit = 10) {
  const params = new URLSearchParams();
  appendFiltersToParams(params, filters);
  params.append('page', page);
  params.append('limit', limit);

  try {
    const response = await api.get(`${API_ROUTES.BOOKS.BASE}?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des livres :", err);
    return { books: [], total: 0 };
  }
}

// ✅ Récupère un livre par ID
export async function getBook(id) {
  try {
    const response = await api.get(`${API_ROUTES.BOOKS.BASE}/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération du livre :", err);
    return null;
  }
}

// ✅ Récupère les livres les mieux notés (avec filtres)
export async function getBestRatedBooks(filters = {}) {
  const params = new URLSearchParams();
  appendFiltersToParams(params, filters);

  try {
    const response = await api.get(`${API_ROUTES.BOOKS.BEST_RATED}?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des meilleurs livres :", err);
    return [];
  }
}

// ✅ Récupère les 5 derniers livres ajoutés (avec filtres)
export async function getLastAddedBooks(filters = {}) {
  const params = new URLSearchParams();
  appendFiltersToParams(params, filters);

  try {
    const response = await api.get(`${API_ROUTES.BOOKS.LAST_ADDED}?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error("Erreur lors des derniers livres :", err);
    return [];
  }
}

// ✅ Supprime un livre
export async function deleteBook(id) {
  try {
    await api.delete(`${API_ROUTES.BOOKS.BASE}/${id}`);
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
    const response = await api.post(API_ROUTES.BOOKS.BASE, bodyFormData);
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
    const response = await api.put(`${API_ROUTES.BOOKS.BASE}/${id}`, newData);
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
    const response = await api.post(`${API_ROUTES.BOOKS.BASE}/${bookId}/rating`, data);
    return response.data;
  } catch (err) {
    console.error("Erreur notation livre :", err);
    return err.message;
  }
}

// ✅ Récupère un livre par son titre
export const getBookByTitle = async (title) => {
  try {
    const response = await api.get(`${API_ROUTES.BOOKS.BASE}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du livre par titre :", error);
    return null;
  }
};

// ✅ Met à jour les informations d'un livre
// (pour les admins/modos)
export async function updateBookInfo(id, data) {
  try {
    const response = await api.put(`${API_ROUTES.BOOKS.BASE}/${id}`, data);
    return response.data;
  } catch (err) {
    console.error("Erreur mise à jour du livre :", err);
    return { error: true, message: err.message };
  }
}