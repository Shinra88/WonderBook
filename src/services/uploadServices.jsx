// 📁 services/uploadServices.jsx
import { API_ROUTES } from "../utils/constants";
import { getFromLocalStorage } from "../utils/localStorage";
import api from './api/api';

/**
 * ✅ Uploade une image (ex: couverture livre)
 */
export async function uploadImageToS3(file, title = "image") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  try {
    const response = await api.post(API_ROUTES.AUTH.UPLOAD_IMAGE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.imageUrl;
  } catch (error) {
    console.error("❌ Erreur lors de l'upload de l'image S3 :", error);
    return null;
  }
}

/**
 * 🔁 Met à jour un avatar (upload + suppression ancien)
 */
export async function updateAvatarOnS3(file, userId, oldUrl) {
  let user = null;

  try {
    const raw = getFromLocalStorage("user");
    user = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (!user) throw new Error("Utilisateur non trouvé");
  } catch (err) {
    console.error("❌ Erreur parsing user localStorage :", err);
    return null;
  }

  const name = user.name || 'default';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  formData.append('oldUrl', oldUrl || '');
  formData.append('name', name);

  try {
    const response = await api.put(API_ROUTES.AUTH.UPDATE_AVATAR, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response?.data?.imageUrl) {
      console.log("✅ Avatar mis à jour :", response.data.imageUrl);
      return response.data.imageUrl;
    }

    console.error("❌ Réponse inattendue :", response);
    return null;
  } catch (err) {
    console.error("❌ Erreur update avatar S3 :", err);
    return null;
  }
}
