// src/services/topicsService.jsx
import api from './api/api';
import { API_ROUTES } from '../utils/constants';

// ➔ Retrieves all topics
export async function getTopics() {
  try {
    const { data } = await api.get(API_ROUTES.FORUM.BASE);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des topics :', error);
    throw error;
  }
}

// ➔ Add a topic with notice and recaptcha
export async function addTopic({ title, content, recaptchaToken, notice }, token) {
  try {
    const response = await api.post(
      API_ROUTES.FORUM.ADD_TOPIC,
      { title, content, recaptchaToken, notice },
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

// ➔ Retrieves a topic by ID
export async function getTopicById(topicId) {
  try {
    const { data } = await api.get(`${API_ROUTES.FORUM.BASE}/${topicId}`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du topic :', error);
    throw error;
  }
}

// ✅ Updates the "notice" (pinned) status of a topic
export async function updateTopicNotice(id, token) {
  try {
    const response = await api.patch(
      API_ROUTES.FORUM.UPDATE_NOTICE(id),
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur updateTopicNotice :', error);
    throw error;
  }
}

// ➔ Deletes a topic
export async function deleteTopic(id, token) {
  try {
    const response = await api.delete(`${API_ROUTES.FORUM.BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    console.error('Erreur suppression topic :', err);
    throw err;
  }
}

// ➔ Lock or unlock a topic
export async function toggleTopicLock(id, token) {
  try {
    const response = await api.patch(
      API_ROUTES.FORUM.LOCK_TOPIC(id),
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur toggle lock topic :', error);
    throw error;
  }
}
