// 📁 services/authService.js
import axios from 'axios';
import { API_ROUTES } from '../utils/constants';
import { storeInLocalStorage, getFromLocalStorage, removeFromLocalStorage } from '../utils/localStorage';

/** ✅ Connexion */
export async function login(mail, password) {
  try {
    const response = await axios.post(API_ROUTES.AUTH.LOGIN, { mail, password });
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
    const response = await axios.post(API_ROUTES.AUTH.REGISTER, { name, mail, password, recaptchaToken, website });
    const { token, user } = response.data;
    storeInLocalStorage('token', token);
    storeInLocalStorage('user', JSON.stringify(user));
    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || 'Erreur lors de l\'inscription' };
  }
}

/** ✅ Récupère l'utilisateur connecté */
export function getCurrentUser() {
  const token = getFromLocalStorage('token');
  const user = JSON.parse(getFromLocalStorage('user'));
  if (!token || !user) return null;
  return { token, ...user };
}

/** ✅ Vérifie si l'utilisateur est connecté */
export function isAuthenticated() {
  return Boolean(getFromLocalStorage('token'));
}

/** ✅ Met à jour le profil utilisateur */
export async function updateUserProfile(form) {
  try {
    const token = getFromLocalStorage('token');
    console.log("🔐 Token actuel :", getFromLocalStorage('token'));


    const body = {
      ...form,
      avatar: form.avatar,
      repForum: form.repForum ? 1 : 0,
      addCom: form.addCom ? 1 : 0,
      addBook: form.addBook ? 1 : 0,
      news: form.news ? 1 : 0,
    };
    console.log("💥 Header Authorization envoyé :", `Bearer ${token}`);
    console.log("📦 Données envoyées :", body);
    
    const response = await axios.put(API_ROUTES.AUTH.UPDATE_PROFILE, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const updatedUser = response.data.user;
    storeInLocalStorage('user', JSON.stringify(updatedUser));

    return { success: true, user: updatedUser };
  } catch (err) {
    console.error('Erreur updateUserProfile:', err);
    return { success: false, error: err.response?.data?.error || 'Erreur mise à jour du profil' };
  }
}

/** ✅ Changement de mot de passe */
export async function changePassword(oldPassword, newPassword) {
  try {
    const token = getFromLocalStorage('token');

    const response = await axios.post(API_ROUTES.AUTH.CHANGE_PASS, {
      oldPassword,
      newPassword,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, message: response.data.message };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Erreur lors du changement de mot de passe',
    };
  }
}
