import api from './api/api';
import { API_ROUTES } from '../utils/constants';

// ➔ Récupérer tous les commentaires d'un livre
export async function getComments(bookId) {
  try {
    const { data } = await api.get(`${API_ROUTES.COMMENTS.BASE}/${bookId}`);
    return data;
  } catch (error) {
    console.error('Erreur récupération commentaires :', error);
    throw error;
  }
}

// ➔ Ajouter ou mettre à jour un commentaire
export async function addOrUpdateComment(bookId, { content, rating }) {
  try {
    const { data } = await api.post(`${API_ROUTES.COMMENTS.BASE}/${bookId}`, { content, rating });
    return data;
  } catch (error) {
    console.error('Erreur ajout/modification commentaire :', error);
    throw error;
  }
}

// ➔ Supprimer son propre commentaire
export async function deleteComment(bookId) {
  try {
    const { data } = await api.delete(`${API_ROUTES.COMMENTS.BASE}/${bookId}`);
    return data;
  } catch (error) {
    console.error('Erreur suppression commentaire :', error);
    throw error;
  }
}

// ➔ Supprimer n'importe quel commentaire (admin/modo)
export async function deleteCommentAsAdmin(commentId) {
  try {
    const { data } = await api.delete(`${API_ROUTES.COMMENTS.BASE}/admin/${commentId}`);
    return data;
  } catch (error) {
    console.error('Erreur suppression commentaire (admin) :', error);
    throw error;
  }
}
