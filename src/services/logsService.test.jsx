// src/services/logsService.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getAllLogs, getUserLogs, getLogsStats } from './logsService';
import api from './api/api';

// Mock de l'API
vi.mock('./api/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock des constantes
vi.mock('../utils/constants', () => ({
  API_ROUTES: {
    LOGS: {
      GET_ALL: '/api/logs',
      GET_USER_LOGS: userId => `/api/logs/user/${userId}`,
      GET_STATS: '/api/logs/stats',
    },
  },
}));

// Mock console.error pour éviter les logs pendant les tests
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Données de test
const mockLogs = [
  {
    logId: 1,
    userId: 1,
    action: 'Utilisateur suspendu : JohnDoe',
    targetId: 5,
    targetType: 'user',
    created_at: '2024-01-15T10:30:00Z',
    user: { name: 'AdminUser', role: 'admin' },
  },
  {
    logId: 2,
    userId: 2,
    action: 'Livre ajouté : "Test Book" par Test Author',
    targetId: 10,
    targetType: 'book',
    created_at: '2024-01-14T14:20:00Z',
    user: { name: 'ModeratorUser', role: 'moderator' },
  },
];

const mockStats = {
  actionStats: [
    { targetType: 'user', _count: { logId: 15 } },
    { targetType: 'book', _count: { logId: 23 } },
  ],
  userStats: [{ userId: 1, _count: { logId: 10 }, user: { name: 'AdminUser', role: 'admin' } }],
};

describe('logsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

  describe('getAllLogs', () => {
    test('should fetch all logs successfully', async () => {
      const mockResponse = {
        data: {
          logs: mockLogs,
          total: 25,
          pagination: { page: 1, limit: 10, totalPages: 3 },
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await getAllLogs({
        page: 1,
        limit: 10,
        userId: null,
        targetType: null,
        action: '',
        startDate: null,
        endDate: null,
      });

      expect(api.get).toHaveBeenCalledWith('/api/logs', {
        params: {
          page: 1,
          limit: 10,
          userId: null,
          targetType: null,
          action: '',
          startDate: null,
          endDate: null,
        },
      });
      expect(result).toEqual({
        logs: mockLogs,
        total: 25,
        pagination: { page: 1, limit: 10, totalPages: 3 },
      });
    });

    test('should handle filters correctly', async () => {
      const mockResponse = {
        data: {
          logs: [mockLogs[0]],
          total: 1,
          pagination: { page: 1, limit: 10, totalPages: 1 },
        },
      };

      api.get.mockResolvedValue(mockResponse);

      await getAllLogs({
        page: 1,
        limit: 10,
        userId: 1,
        targetType: 'user',
        action: 'suspendu',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(api.get).toHaveBeenCalledWith('/api/logs', {
        params: {
          page: 1,
          limit: 10,
          userId: 1,
          targetType: 'user',
          action: 'suspendu',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
    });

    test('should handle response without logs property', async () => {
      const mockResponse = {
        data: {
          total: 0,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await getAllLogs({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        logs: [],
        total: 0,
        pagination: {},
      });
    });

    test('should handle null response data', async () => {
      const mockResponse = {
        data: null,
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await getAllLogs({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        logs: [],
        total: 0,
        pagination: {},
      });
    });

    test('should handle string response data', async () => {
      const mockResponse = {
        data: 'Invalid response',
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await getAllLogs({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        logs: [],
        total: 0,
        pagination: {},
      });
    });

    test('should handle API error', async () => {
      const mockError = new Error('Network error');
      api.get.mockRejectedValue(mockError);

      await expect(
        getAllLogs({
          page: 1,
          limit: 10,
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('getUserLogs', () => {
    test('should fetch user logs successfully', async () => {
      const mockResponse = {
        data: {
          logs: [mockLogs[0]],
          total: 1,
          pagination: { page: 1, limit: 20, totalPages: 1 },
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await getUserLogs(1, {
        page: 1,
        limit: 20,
      });

      expect(api.get).toHaveBeenCalledWith('/api/logs/user/1', {
        params: { page: 1, limit: 20 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle different user IDs', async () => {
      const mockResponse = {
        data: { logs: [], total: 0 },
      };

      api.get.mockResolvedValue(mockResponse);

      await getUserLogs(999, { page: 1, limit: 20 });

      expect(api.get).toHaveBeenCalledWith('/api/logs/user/999', {
        params: { page: 1, limit: 20 },
      });
    });

    test('should handle API error for user logs', async () => {
      const mockError = new Error('User not found');
      api.get.mockRejectedValue(mockError);

      await expect(
        getUserLogs(999, {
          page: 1,
          limit: 20,
        })
      ).rejects.toThrow('User not found');
    });
  });

  describe('getLogsStats', () => {
    test('should fetch stats successfully', async () => {
      const mockResponse = {
        data: mockStats,
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await getLogsStats({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(api.get).toHaveBeenCalledWith('/api/logs/stats', {
        params: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
      expect(result).toEqual(mockStats);
    });

    test('should fetch stats without date filters', async () => {
      const mockResponse = {
        data: mockStats,
      };

      api.get.mockResolvedValue(mockResponse);

      await getLogsStats({});

      expect(api.get).toHaveBeenCalledWith('/api/logs/stats', {
        params: {},
      });
    });

    test('should handle stats API error', async () => {
      const mockError = new Error('Stats unavailable');
      api.get.mockRejectedValue(mockError);

      await expect(getLogsStats({})).rejects.toThrow('Stats unavailable');
    });
  });

  describe('edge cases', () => {
    test('should handle very large page numbers', async () => {
      const mockResponse = {
        data: { logs: [], total: 0, pagination: {} },
      };

      api.get.mockResolvedValue(mockResponse);

      await getAllLogs({
        page: 999999,
        limit: 10,
      });

      expect(api.get).toHaveBeenCalledWith('/api/logs', {
        params: {
          page: 999999,
          limit: 10,
          userId: undefined,
          targetType: undefined,
          action: undefined,
          startDate: undefined,
          endDate: undefined,
        },
      });
    });

    test('should handle special characters in action filter', async () => {
      const mockResponse = {
        data: { logs: [], total: 0 },
      };

      api.get.mockResolvedValue(mockResponse);

      await getAllLogs({
        page: 1,
        limit: 10,
        action: 'Livre ajouté : "Test & Spécial" par Auteur',
      });

      expect(api.get).toHaveBeenCalledWith('/api/logs', {
        params: {
          page: 1,
          limit: 10,
          userId: undefined,
          targetType: undefined,
          action: 'Livre ajouté : "Test & Spécial" par Auteur',
          startDate: undefined,
          endDate: undefined,
        },
      });
    });

    test('should handle date boundaries correctly', async () => {
      const mockResponse = {
        data: { logs: [], total: 0 },
      };

      api.get.mockResolvedValue(mockResponse);

      await getAllLogs({
        page: 1,
        limit: 10,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      });

      expect(api.get).toHaveBeenCalledWith('/api/logs', {
        params: {
          page: 1,
          limit: 10,
          userId: undefined,
          targetType: undefined,
          action: undefined,
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
        },
      });
    });

    test('should handle empty stats response', async () => {
      const mockResponse = {
        data: {
          actionStats: [],
          userStats: [],
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await getLogsStats({});

      expect(result.actionStats).toEqual([]);
      expect(result.userStats).toEqual([]);
    });
  });
});
