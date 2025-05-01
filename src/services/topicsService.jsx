// src/services/topicsService.jsx
import api from './api/api';
import { API_ROUTES } from '../utils/constants';

// ➔ Récupérer tous les topics
export async function getTopics() {
  try {
    const { data } = await api.get(API_ROUTES.FORUM.BASE);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des topics :', error);
    throw error;
  }
}

// ➔ Ajouter un topic
export async function addTopic({ title, content }, token) {
  try {
    const response = await api.post(API_ROUTES.FORUM.ADD_TOPIC,
      { title, content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout du topic :", error);
    throw error;
  }
}

// ➔ Récupérer un topic par ID
export async function getTopicById(topicId) {
  try {
    const { data } = await api.get(`${API_ROUTES.FORUM.BASE}/${topicId}`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du topic :', error);
    throw error;
  }
}

