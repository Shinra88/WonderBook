//uploadServices.jsx
import axios from "axios";
import { API_ROUTES } from "../utils/constants";
import { getFromLocalStorage, storeInLocalStorage } from "../utils/localStorage";

/**
 * ✅ Uploade une image simple (ex : couverture de livre)
 */
export async function uploadImageToS3(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(API_ROUTES.AUTH.UPLOAD_IMAGE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.imageUrl; // Retourne l'URL de l'image uploadée
  } catch (error) {
    console.error("❌ Erreur lors de l'upload de l'image S3 :", error);
    return null; // Si l'upload échoue, retourne null
  }
}

/**
 * 🔁 Met à jour un avatar : supprime l'ancien, renomme le nouveau et met à jour la BDD
 */
export async function updateAvatarOnS3(file, userId, oldUrl) {
  const token = getFromLocalStorage('token');

  let user = null;
  try {
    // Vérification du contenu du localStorage
    user = getFromLocalStorage("user");
    console.log("User du localStorage avant JSON.parse: ", user);

    // Si c'est une chaîne, on la parse en objet
    if (typeof user === 'string') {
      user = JSON.parse(user);
    }
  } catch (err) {
    console.error("❌ Erreur lors du JSON.parse du user dans le localStorage :", err);
    return null; // Retourne null en cas d'erreur de parsing
  }

  if (!user) {
    console.error("❌ Aucun utilisateur trouvé dans le localStorage.");
    return null; // Si aucun utilisateur n'est trouvé dans le localStorage, retourne null
  }

  const name = user.name || 'default'; // Nom de l'utilisateur ou 'default' si non défini

  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId); // Ajout de l'ID utilisateur
  formData.append('oldUrl', oldUrl || ''); // Ajout de l'ancienne URL si elle existe
  formData.append('name', name); // Ajout du nom

  try {
    const response = await axios.put(API_ROUTES.AUTH.UPDATE_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`, // Utilisation du token d'authentification
      },
    });

    // Vérification de la réponse du serveur
    if (response?.data?.imageUrl) {
      console.log("✅ Avatar mis à jour avec succès :", response.data.imageUrl);
      return response.data.imageUrl; // Retourne l'URL de l'avatar mis à jour
    } else {
      console.error("❌ Format de réponse inattendu du serveur :", response);
      return null; // Si la réponse est incorrecte, retourne null
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'upload de l'avatar :", err);
    return null; // Retourne null en cas d'erreur d'upload
  }
}
