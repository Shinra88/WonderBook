// 📁 services/bookService.js
import api from '../services/api/api';
import { API_ROUTES } from '../utils/constants';

// ✅ Utility function to apply filters to a URL
function appendFiltersToParams(params, filters = {}) {
  if (filters.year) params.append('year', filters.year);
  if (filters.start && filters.end) {
    params.append('start', filters.start);
    params.append('end', filters.end);
  }
  if (filters.categories?.length) {
    filters.categories.forEach(cat => params.append('categories', cat));
  }
  if (filters.type) params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);

  // 🆕 Added for admin/moderator sorting
  if (filters.pendingFirst) params.append('pendingFirst', 'true');
}

// ✅ Retrieves all books (with or without filters)
export async function getBooks(filters = {}, page = 1, limit = 10) {
  const params = new URLSearchParams();
  appendFiltersToParams(params, filters);
  params.append('page', page);
  params.append('limit', limit);

  try {
    const response = await api.get(`${API_ROUTES.BOOKS.BASE}?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Erreur lors de la récupération des livres :', err);
    return { books: [], total: 0 };
  }
}

// ✅ Retrieves a book by ID
export async function getBook(id) {
  try {
    const response = await api.get(`${API_ROUTES.BOOKS.BASE}/${id}`);
    return response.data;
  } catch (err) {
    console.error('Erreur lors de la récupération du livre :', err);
    return null;
  }
}

// ✅ Retrieves the best-rated books (with filters)
export async function getBestRatedBooks(filters = {}) {
  const params = new URLSearchParams();
  appendFiltersToParams(params, filters);

  try {
    const response = await api.get(`${API_ROUTES.BOOKS.BEST_RATED}?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Erreur lors de la récupération des meilleurs livres :', err);
    return [];
  }
}

// ✅ Retrieves the 5 last added books (with filters)
export async function getLastAddedBooks(filters = {}) {
  const params = new URLSearchParams();
  appendFiltersToParams(params, filters);

  try {
    const response = await api.get(`${API_ROUTES.BOOKS.LAST_ADDED}?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Erreur lors des derniers livres :', err);
    return [];
  }
}

// ✅ Deletes a book
export async function deleteBook(id) {
  try {
    await api.delete(`${API_ROUTES.BOOKS.BASE}/${id}`);
    return true;
  } catch (err) {
    console.error('Erreur lors de la suppression du livre :', err);
    return false;
  }
}

// ✅ Adds a book (and uploads image)
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
    console.error('Erreur ajout livre :', err);
    return { error: true, message: err.message };
  }
}

// ✅ Updates a book (with or without new image)
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
    console.error('Erreur mise à jour livre :', err);
    return { error: true, message: err.message };
  }
}

// ✅ Rates a book
export async function rateBook(bookId, userId, rating) {
  const data = { userId, rating: parseInt(rating, 10) };
  try {
    const response = await api.post(`${API_ROUTES.BOOKS.BASE}/${bookId}/rating`, data);
    return response.data;
  } catch (err) {
    console.error('Erreur notation livre :', err);
    return err.message;
  }
}

// ✅ Retrieves a book by its title
export const getBookByTitle = async title => {
  try {
    const response = await api.get(`${API_ROUTES.BOOKS.BASE}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du livre par titre :', error);
    return null;
  }
};

// ✅ Updates a book's information
// (for admins/moderators)
export async function updateBookInfo(id, data) {
  try {
    const response = await api.put(`${API_ROUTES.BOOKS.BASE}/${id}`, data);
    return response.data;
  } catch (err) {
    console.error('Erreur mise à jour du livre :', err);
    return { error: true, message: err.message };
  }
}
