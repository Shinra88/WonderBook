import api from './api/api';
import { API_ROUTES } from '../utils/constants';

// ➔ Retrieve all posts related to a topic
export async function getPostsByTopicId(topicId) {
  try {
    const { data } = await api.get(API_ROUTES.POSTS.GET_BY_TOPIC(topicId));

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des posts :', error);
    throw error;
  }
}

export async function addPost({ topicId, content }, token) {
  try {
    const response = await api.post(
      `${API_ROUTES.POSTS.BASE}/add`,
      { topicId, content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur ajout post :', error);
    throw error;
  }
}

export async function deletePost(id, token) {
  try {
    const res = await api.delete(`${API_ROUTES.POSTS.BASE}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur deletePost :", err);
    throw err;
  }
}
