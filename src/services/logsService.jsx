// services/logsService.jsx
import api from './api/api';
import { API_ROUTES } from '../utils/constants';

/** ✅ Récupère tous les logs avec pagination, recherche et filtrage */
export async function getAllLogs({ page, limit, userId, targetType, action, startDate, endDate }) {
  try {
    const res = await api.get(API_ROUTES.LOGS.GET_ALL, {
      params: { page, limit, userId, targetType, action, startDate, endDate },
    });

    // Votre backend retourne directement { logs: [...], total: X }
    if (res.data && typeof res.data === 'object') {
      return {
        logs: res.data.logs || [],
        total: res.data.total || 0,
        pagination: res.data.pagination || {},
      };
    }

    // Fallback si la structure est différente
    return {
      logs: [],
      total: 0,
      pagination: {},
    };
  } catch (err) {
    console.error('❌ Erreur getAllLogs :', err);
    throw err;
  }
}

/** ✅ Récupère les logs d'un utilisateur spécifique */
export async function getUserLogs(userId, { page, limit }) {
  try {
    const res = await api.get(API_ROUTES.LOGS.GET_USER_LOGS(userId), {
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    console.error(`❌ Erreur getUserLogs [userId=${userId}] :`, err);
    throw err;
  }
}

/** ✅ Récupère les statistiques des logs */
export async function getLogsStats({ startDate, endDate }) {
  try {
    const res = await api.get(API_ROUTES.LOGS.GET_STATS, {
      params: { startDate, endDate },
    });
    return res.data;
  } catch (err) {
    console.error('❌ Erreur getLogsStats :', err);
    throw err;
  }
}
