import axios from 'axios';

export const uploadImageToS3 = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post("http://localhost:5000/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.imageUrl; // Retourne l'URL de l'image
  } catch (error) {
    console.error("Erreur lors de l'upload de l'image vers S3 :", error);
    return null;
  }
};
