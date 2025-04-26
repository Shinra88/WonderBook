// ✓ services/authService.js
import api from '../services/api/api';
import { API_ROUTES } from '../utils/constants';
import {
  storeInLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage
} from '../utils/localStorage';

/** ✅ Connexion */
export async function login(mail, password) {
  try {
    const response = await api.post(API_ROUTES.AUTH.LOGIN, { mail, password });
    const { token, user } = response.data;
    storeInLocalStorage('token', token);
    storeInLocalStorage('user', JSON.stringify(user));
    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || 'Erreur de connexion' };
  }
}

/** ✅ Déconnexion */
export function logout() {
  removeFromLocalStorage('token');
  removeFromLocalStorage('user');
}

/** ✅ Enregistrement */
export async function register(name, mail, password, recaptchaToken, website = "") {
  try {
    const response = await api.post(API_ROUTES.AUTH.REGISTER, {
      name,
      mail,
      password,
      recaptchaToken,
      website
    });
    const { token, user } = response.data;
    storeInLocalStorage('token', token);
    storeInLocalStorage('user', JSON.stringify(user));
    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || 'Erreur lors de l\'inscription' };
  }
}

/** ✅ Récupère l'utilisateur connecté (localStorage) */
export function getCurrentUser() {
  const token = getFromLocalStorage('token');
  const user = JSON.parse(getFromLocalStorage('user'));
  if (!token || !user) return null;
  return { token, ...user };
}

/** ✅ Est connecté ? */
export function isAuthenticated() {
  return Boolean(getFromLocalStorage('token'));
}

/** ✅ Récupère le profil utilisateur depuis l'API */
export async function getAuthenticatedUser() {
  try {
    const response = await api.get(API_ROUTES.AUTH.UPDATE_PROFILE);
    return { authenticated: true, user: response.data };
  } catch (err) {
    console.error("Erreur auth user:", err);
    return { authenticated: false, user: null };
  }
}

/** ✅ Met à jour le profil utilisateur */
export async function updateUserProfile(form) {
  try {
    const body = {
      ...form,
      avatar: form.avatar,
      repForum: form.repForum ? 1 : 0,
      addCom: form.addCom ? 1 : 0,
      addBook: form.addBook ? 1 : 0,
      news: form.news ? 1 : 0,
    };

    const response = await api.put(API_ROUTES.AUTH.UPDATE_PROFILE, body);
    const updatedUser = response.data.user;
    storeInLocalStorage('user', JSON.stringify(updatedUser));
    return { success: true, user: updatedUser };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || 'Erreur mise à jour du profil'
    };
  }
}

/** ✅ Changement de mot de passe */
export async function changePassword(oldPassword, newPassword) {
  try {
    const response = await api.post(API_ROUTES.AUTH.CHANGE_PASS, {
      oldPassword,
      newPassword,
    });
    return { success: true, message: response.data.message };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Erreur lors du changement de mot de passe',
    };
  }
}
