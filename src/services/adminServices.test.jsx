// 📁 __tests__/services/adminServices.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAllUsers, updateUserById, deleteUserById, updateUserStatus } from './adminServices';

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
      GET_USERS: '/admin/users',
      UPDATE_USER: id => `/admin/users/${id}`,
      DELETE_USER: id => `/admin/users/${id}`,
      UPDATE_USER_STATUS: id => `/admin/users/${id}/status`,
    },
  },
}));

import api from './api/api';

describe('adminServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllUsers', () => {
    it('should fetch users with all parameters', async () => {
      const mockResponse = {
        data: {
          users: [{ id: 1, name: 'John' }],
          total: 1,
          page: 1,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const params = { page: 1, limit: 10, search: 'john', status: 'active' };
      const result = await getAllUsers(params);

      expect(api.get).toHaveBeenCalledWith('/admin/users', {
        params: { page: 1, limit: 10, search: 'john', status: 'active' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch users with partial parameters', async () => {
      const mockResponse = { data: { users: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const params = { page: 1, limit: 5 };
      const result = await getAllUsers(params);

      expect(api.get).toHaveBeenCalledWith('/admin/users', {
        params: { page: 1, limit: 5 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error', async () => {
      const mockError = new Error('Network error');
      api.get.mockRejectedValue(mockError);

      const params = { page: 1, limit: 10 };

      await expect(getAllUsers(params)).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith('❌ Erreur getAllUsers :', mockError);
    });

    it('should handle empty parameters', async () => {
      const mockResponse = { data: { users: [] } };
      api.get.mockResolvedValue(mockResponse);

      const result = await getAllUsers({});

      expect(api.get).toHaveBeenCalledWith('/admin/users', {
        params: {},
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateUserById', () => {
    it('should update user successfully', async () => {
      const mockUser = { id: 1, name: 'John Updated', email: 'john@test.com' };
      const mockResponse = { data: { user: mockUser } };

      api.put.mockResolvedValue(mockResponse);

      const updateData = { name: 'John Updated', email: 'john@test.com' };
      const result = await updateUserById(1, updateData);

      expect(api.put).toHaveBeenCalledWith('/admin/users/1', updateData);
      expect(result).toEqual(mockUser);
    });

    it('should handle update error', async () => {
      const mockError = new Error('Update failed');
      api.put.mockRejectedValue(mockError);

      const updateData = { name: 'New Name' };

      await expect(updateUserById(1, updateData)).rejects.toThrow('Update failed');
      expect(console.error).toHaveBeenCalledWith('❌ Erreur updateUser [id=1] :', mockError);
    });

    it('should handle different user IDs', async () => {
      const mockResponse = { data: { user: { id: 999 } } };
      api.put.mockResolvedValue(mockResponse);

      await updateUserById(999, { role: 'admin' });

      expect(api.put).toHaveBeenCalledWith('/admin/users/999', { role: 'admin' });
    });
  });

  describe('deleteUserById', () => {
    it('should delete user successfully', async () => {
      const mockResponse = { data: { message: 'User deleted', success: true } };
      api.delete.mockResolvedValue(mockResponse);

      const result = await deleteUserById(1);

      expect(api.delete).toHaveBeenCalledWith('/admin/users/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle delete error', async () => {
      const mockError = new Error('Delete failed');
      api.delete.mockRejectedValue(mockError);

      await expect(deleteUserById(1)).rejects.toThrow('Delete failed');
      expect(console.error).toHaveBeenCalledWith('❌ Erreur deleteUser [id=1] :', mockError);
    });

    it('should handle different user IDs for deletion', async () => {
      const mockResponse = { data: { success: true } };
      api.delete.mockResolvedValue(mockResponse);

      await deleteUserById(42);

      expect(api.delete).toHaveBeenCalledWith('/admin/users/42');
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status successfully', async () => {
      const mockUser = { id: 1, status: 'suspended' };
      const mockResponse = { data: { user: mockUser } };

      api.put.mockResolvedValue(mockResponse);

      const result = await updateUserStatus(1, 'suspended');

      expect(api.put).toHaveBeenCalledWith('/admin/users/1/status', { status: 'suspended' });
      expect(result).toEqual(mockUser);
    });

    it('should handle different status values', async () => {
      const mockResponse = { data: { user: { id: 1, status: 'banned' } } };
      api.put.mockResolvedValue(mockResponse);

      await updateUserStatus(1, 'banned');

      expect(api.put).toHaveBeenCalledWith('/admin/users/1/status', { status: 'banned' });
    });

    it('should handle status update error', async () => {
      const mockError = new Error('Status update failed');
      api.put.mockRejectedValue(mockError);

      await expect(updateUserStatus(1, 'active')).rejects.toThrow('Status update failed');
      expect(console.error).toHaveBeenCalledWith('Erreur updateUserStatus:', mockError);
    });

    it('should handle different user IDs for status update', async () => {
      const mockResponse = { data: { user: { id: 123, status: 'active' } } };
      api.put.mockResolvedValue(mockResponse);

      await updateUserStatus(123, 'active');

      expect(api.put).toHaveBeenCalledWith('/admin/users/123/status', { status: 'active' });
    });
  });

  describe('Integration tests', () => {
    it('should handle complete admin workflow', async () => {
      // Mock responses for all operations
      const getUsersResponse = { data: { users: [{ id: 1, name: 'John' }] } };
      const updateResponse = { data: { user: { id: 1, name: 'John Updated' } } };
      const statusResponse = { data: { user: { id: 1, status: 'suspended' } } };
      const deleteResponse = { data: { success: true } };

      api.get.mockResolvedValueOnce(getUsersResponse);
      api.put.mockResolvedValueOnce(updateResponse);
      api.put.mockResolvedValueOnce(statusResponse);
      api.delete.mockResolvedValueOnce(deleteResponse);

      // Test workflow
      const users = await getAllUsers({ page: 1, limit: 10 });
      const updatedUser = await updateUserById(1, { name: 'John Updated' });
      const statusUpdatedUser = await updateUserStatus(1, 'suspended');
      const deleteResult = await deleteUserById(1);

      expect(users).toEqual(getUsersResponse.data);
      expect(updatedUser).toEqual(updateResponse.data.user);
      expect(statusUpdatedUser).toEqual(statusResponse.data.user);
      expect(deleteResult).toEqual(deleteResponse.data);
    });
  });
});
