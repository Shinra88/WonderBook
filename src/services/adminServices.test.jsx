// src/services/adminServices.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getAllUsers, updateUserById, deleteUserById, updateUserStatus } from './adminServices';
import api from './api/api';

// Mock de l'API
vi.mock('./api/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock des constantes
vi.mock('../utils/constants', () => ({
  API_ROUTES: {
    ADMIN: {
      GET_USERS: '/api/admin/users',
      UPDATE_USER: id => `/api/admin/users/${id}`,
      DELETE_USER: id => `/api/admin/users/${id}`,
      UPDATE_USER_STATUS: id => `/api/admin/users/${id}/status`,
    },
  },
}));

// Données de test
const mockUsers = [
  {
    userId: 1,
    name: 'John Doe',
    mail: 'john@example.com',
    role: 'user',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    userId: 2,
    name: 'Jane Smith',
    mail: 'jane@example.com',
    role: 'moderator',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
  },
];

const mockUser = {
  userId: 1,
  name: 'John Doe Updated',
  mail: 'john.updated@example.com',
  role: 'moderator',
  status: 'active',
};

describe('adminServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    test('should fetch users successfully', async () => {
      const mockResponse = {
        data: {
          users: mockUsers,
          total: 2,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await getAllUsers({
        page: 1,
        limit: 10,
        search: '',
        status: 'all',
      });

      expect(api.get).toHaveBeenCalledWith('/api/admin/users', {
        params: { page: 1, limit: 10, search: '', status: 'all' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle search and filters', async () => {
      const mockResponse = { data: { users: [mockUsers[0]], total: 1 } };
      api.get.mockResolvedValue(mockResponse);

      await getAllUsers({
        page: 1,
        limit: 10,
        search: 'john',
        status: 'active',
      });

      expect(api.get).toHaveBeenCalledWith('/api/admin/users', {
        params: { page: 1, limit: 10, search: 'john', status: 'active' },
      });
    });

    test('should handle API error', async () => {
      const mockError = new Error('Network error');
      api.get.mockRejectedValue(mockError);

      await expect(
        getAllUsers({
          page: 1,
          limit: 10,
          search: '',
          status: 'all',
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('updateUserById', () => {
    test('should update user successfully', async () => {
      const mockResponse = {
        data: {
          user: mockUser,
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const updateData = {
        name: 'John Doe Updated',
        mail: 'john.updated@example.com',
        role: 'moderator',
      };

      const result = await updateUserById(1, updateData);

      expect(api.put).toHaveBeenCalledWith('/api/admin/users/1', updateData);
      expect(result).toEqual(mockUser);
    });

    test('should handle update error', async () => {
      const mockError = new Error('Update failed');
      api.put.mockRejectedValue(mockError);

      await expect(updateUserById(1, { name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteUserById', () => {
    test('should delete user successfully', async () => {
      const mockResponse = {
        data: {
          message: 'User deleted successfully',
        },
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await deleteUserById(1);

      expect(api.delete).toHaveBeenCalledWith('/api/admin/users/1');
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle delete error', async () => {
      const mockError = new Error('Delete failed');
      api.delete.mockRejectedValue(mockError);

      await expect(deleteUserById(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('updateUserStatus', () => {
    test('should update user status to suspended', async () => {
      const mockResponse = {
        data: {
          user: { ...mockUser, status: 'suspended' },
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await updateUserStatus(1, 'suspended');

      expect(api.put).toHaveBeenCalledWith('/api/admin/users/1/status', { status: 'suspended' });
      expect(result).toEqual({ ...mockUser, status: 'suspended' });
    });

    test('should update user status to active', async () => {
      const mockResponse = {
        data: {
          user: { ...mockUser, status: 'active' },
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await updateUserStatus(1, 'active');

      expect(api.put).toHaveBeenCalledWith('/api/admin/users/1/status', { status: 'active' });
      expect(result.status).toBe('active');
    });

    test('should update user status to banned', async () => {
      const mockResponse = {
        data: {
          user: { ...mockUser, status: 'banned' },
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await updateUserStatus(1, 'banned');

      expect(api.put).toHaveBeenCalledWith('/api/admin/users/1/status', { status: 'banned' });
      expect(result.status).toBe('banned');
    });

    test('should handle status update error', async () => {
      const mockError = new Error('Status update failed');
      api.put.mockRejectedValue(mockError);

      await expect(updateUserStatus(1, 'suspended')).rejects.toThrow('Status update failed');
    });
  });

  describe('edge cases', () => {
    test('should handle empty users response', async () => {
      const mockResponse = {
        data: {
          users: [],
          total: 0,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await getAllUsers({
        page: 1,
        limit: 10,
        search: 'nonexistent',
        status: 'all',
      });

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });

    test('should handle large page numbers', async () => {
      const mockResponse = { data: { users: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      await getAllUsers({
        page: 999,
        limit: 10,
        search: '',
        status: 'all',
      });

      expect(api.get).toHaveBeenCalledWith('/api/admin/users', {
        params: { page: 999, limit: 10, search: '', status: 'all' },
      });
    });

    test('should handle special characters in search', async () => {
      const mockResponse = { data: { users: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      await getAllUsers({
        page: 1,
        limit: 10,
        search: 'test@example.com',
        status: 'all',
      });

      expect(api.get).toHaveBeenCalledWith('/api/admin/users', {
        params: { page: 1, limit: 10, search: 'test@example.com', status: 'all' },
      });
    });
  });
});
