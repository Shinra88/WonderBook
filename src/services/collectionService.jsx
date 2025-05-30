// services/collectionService.js
import api from './api/api';
import { API_ROUTES } from '../utils/constants';

// ➔ Ajouter un livre à la collection
export async function addBookToCollection(bookId) {
  try {
    const response = await api.post(API_ROUTES.COLLECTION.ADD, { bookId });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l’ajout à la collection :', error);
    throw error;
  }
}

// ➔ Retirer un livre de la collection
export async function removeBookFromCollection(bookId) {
  try {
    const response = await api.delete(API_ROUTES.COLLECTION.REMOVE(bookId));
    return response.data;
  } catch (error) {
    console.error('Erreur lors du retrait de la collection :', error);
    throw error;
  }
}

// ➔ Récupérer la collection de l'utilisateur avec filtres facultatifs
export const getUserCollection = async ({ read = false, noted = false, commented = false } = {}) => {
  try {
    const params = {};
    if (read) params.is_read = true;
    if (noted) params.is_noted = true;
    if (commented) params.is_commented = true;

    const { data } = await api.get(API_ROUTES.COLLECTION.GET_USER_COLLECTION, { params });
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection :', error);
    throw error;
  }
};

// ➔ Mettre à jour le statut "lu" d'un livre
export async function updateBookReadStatus(bookId, isRead) {
  try {
    const response = await api.patch(API_ROUTES.COLLECTION.UPDATE_READ(bookId), { is_read: isRead });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de lecture :', error);
    throw error;
  }
}

// ➔ Récupérer la position de lecture (CFI)
export async function getReadingProgress(bookId) {
  try {
    const { data } = await api.get(API_ROUTES.COLLECTION.GET_PROGRESS(bookId));
    return data.cfi || null;
  } catch (error) {
    console.error('Erreur récupération position de lecture :', error);
    return null;
  }
}

// ➔ Sauvegarder la position de lecture (CFI)
export async function saveReadingProgress(bookId, cfi) {
  try {
    await api.post(API_ROUTES.COLLECTION.SAVE_PROGRESS(bookId), { cfi });
  } catch (error) {
    console.error('Erreur sauvegarde position de lecture :', error);
  }
}

