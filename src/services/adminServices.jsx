// services/adminServices.jsx
import api from './api/api';
import { API_ROUTES } from '../utils/constants';

/** ✅ Récupère tous les utilisateurs */
export async function getAllUsers() {
  try {
    const res = await api.get(API_ROUTES.ADMIN.GET_USERS);
    return res.data;
  } catch (err) {
    console.error('❌ Erreur getAllUsers :', err);
    throw err;
  }
}

/** ✅ Met à jour un utilisateur (rôle, email, etc.) */
export async function updateUserById(id, data) {
    try {
      const res = await api.put(API_ROUTES.ADMIN.UPDATE_USER(id), data);
      return res.data.user; // ✅ c’est ça que tu veux mettre à jour dans setUsers()
    } catch (err) {
      console.error(`❌ Erreur updateUser [id=${id}] :`, err);
      throw err;
    }
  }  

/** ✅ Supprime un utilisateur */
export async function deleteUserById(id) {
  try {
    const res = await api.delete(API_ROUTES.ADMIN.DELETE_USER(id));
    return res.data;
  } catch (err) {
    console.error(`❌ Erreur deleteUser [id=${id}] :`, err);
    throw err;
  }
}

//** ✅ Met à jour le statut d'un utilisateur (actif, suspendu, banni) */
export async function updateUserStatus(id, status) {
    try {
      const response = await api.put(`${API_ROUTES.ADMIN.UPDATE_USER_STATUS(id)}`, { status });
      return response.data.user;
    } catch (err) {
      console.error("Erreur updateUserStatus:", err);
      throw err;
    }
  }
  
