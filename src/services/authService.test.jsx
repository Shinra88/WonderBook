// 📁 __tests__/services/authService.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  login,
  logout,
  register,
  getCurrentUser,
  isAuthenticated,
  getAuthenticatedUser,
  updateUserProfile,
  changePassword
} from './authService';

// Mock de l'API
vi.mock('../services/api/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn()
  }
}));

// Mock des constantes
vi.mock('../utils/constants', () => ({
  API_ROUTES: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      UPDATE_PROFILE: '/auth/profile',
      CHANGE_PASS: '/auth/change-password'
    }
  }
}));

// Mock du localStorage utilities
vi.mock('../utils/localStorage', () => ({
  storeInLocalStorage: vi.fn(),
  getFromLocalStorage: vi.fn(),
  removeFromLocalStorage: vi.fn()
}));

import api from '../services/api/api';
import {
  storeInLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage
} from '../utils/localStorage';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = { id: 1, name: 'John', email: 'john@test.com' };
      const mockToken = 'test-token-123';
      const mockResponse = {
        data: { token: mockToken, user: mockUser }
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const result = await login('john@test.com', 'password123');
      
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        mail: 'john@test.com',
        password: 'password123'
      });
      expect(storeInLocalStorage).toHaveBeenCalledWith('token', mockToken);
      expect(storeInLocalStorage).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('should handle login error with API response', async () => {
      const mockError = {
        response: {
          data: { error: 'Invalid credentials' }
        }
      };
      
      api.post.mockRejectedValue(mockError);
      
      const result = await login('wrong@test.com', 'wrongpass');
      
      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
      expect(storeInLocalStorage).not.toHaveBeenCalled();
    });

    it('should handle login error without API response', async () => {
      api.post.mockRejectedValue(new Error('Network error'));
      
      const result = await login('test@test.com', 'password');
      
      expect(result).toEqual({
        success: false,
        error: 'Erreur de connexion'
      });
    });
  });

  describe('logout', () => {
    it('should clear localStorage on logout', () => {
      logout();
      
      expect(removeFromLocalStorage).toHaveBeenCalledWith('token');
      expect(removeFromLocalStorage).toHaveBeenCalledWith('user');
    });
  });

  describe('register', () => {
    it('should register successfully with all parameters', async () => {
      const mockUser = { id: 1, name: 'Jane', email: 'jane@test.com' };
      const mockToken = 'register-token-456';
      const mockResponse = {
        data: { token: mockToken, user: mockUser }
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const result = await register(
        'Jane Doe',
        'jane@test.com',
        'password123',
        'recaptcha-token',
        'https://example.com'
      );
      
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Jane Doe',
        mail: 'jane@test.com',
        password: 'password123',
        recaptchaToken: 'recaptcha-token',
        website: 'https://example.com'
      });
      expect(storeInLocalStorage).toHaveBeenCalledWith('token', mockToken);
      expect(storeInLocalStorage).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('should register with default website parameter', async () => {
      const mockResponse = {
        data: { token: 'token', user: { id: 1 } }
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      await register('John', 'john@test.com', 'pass', 'recaptcha');
      
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'John',
        mail: 'john@test.com',
        password: 'pass',
        recaptchaToken: 'recaptcha',
        website: ''
      });
    });

    it('should handle register error', async () => {
      const mockError = {
        response: {
          data: { error: 'Email already exists' }
        }
      };
      
      api.post.mockRejectedValue(mockError);
      
      const result = await register('John', 'existing@test.com', 'pass', 'recaptcha');
      
      expect(result).toEqual({
        success: false,
        error: 'Email already exists'
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when token and user exist', () => {
      const mockUser = { id: 1, name: 'John' };
      const mockToken = 'valid-token';
      
      getFromLocalStorage
        .mockReturnValueOnce(mockToken)
        .mockReturnValueOnce(JSON.stringify(mockUser));
      
      const result = getCurrentUser();
      
      expect(result).toEqual({ token: mockToken, ...mockUser });
    });

    it('should return null when no token', () => {
      getFromLocalStorage
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(JSON.stringify({ id: 1 }));
      
      const result = getCurrentUser();
      
      expect(result).toBeNull();
    });

    it('should return null when no user', () => {
      getFromLocalStorage
        .mockReturnValueOnce('token')
        .mockReturnValueOnce(null);
      
      const result = getCurrentUser();
      
      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      getFromLocalStorage.mockReturnValue('valid-token');
      
      const result = isAuthenticated();
      
      expect(result).toBe(true);
    });

    it('should return false when no token', () => {
      getFromLocalStorage.mockReturnValue(null);
      
      const result = isAuthenticated();
      
      expect(result).toBe(false);
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return authenticated user successfully', async () => {
      const mockUser = { id: 1, name: 'John', email: 'john@test.com' };
      const mockResponse = { data: mockUser };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await getAuthenticatedUser();
      
      expect(api.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual({ authenticated: true, user: mockUser });
    });

    it('should handle API error', async () => {
      const mockError = new Error('Unauthorized');
      api.get.mockRejectedValue(mockError);
      
      const result = await getAuthenticatedUser();
      
      expect(result).toEqual({ authenticated: false, user: null });
      expect(console.error).toHaveBeenCalledWith('Erreur auth user:', mockError);
    });
  });

  describe('updateUserProfile', () => {
    it('should update profile successfully', async () => {
      const mockUpdatedUser = { id: 1, name: 'John Updated' };
      const mockResponse = { data: { user: mockUpdatedUser } };
      
      api.put.mockResolvedValue(mockResponse);
      
      const formData = {
        name: 'John Updated',
        avatar: 'avatar.jpg',
        repForum: true,
        addCom: false,
        addBook: true,
        news: false
      };
      
      const result = await updateUserProfile(formData);
      
      expect(api.put).toHaveBeenCalledWith('/auth/profile', {
        name: 'John Updated',
        avatar: 'avatar.jpg',
        repForum: 1,
        addCom: 0,
        addBook: 1,
        news: 0
      });
      expect(storeInLocalStorage).toHaveBeenCalledWith('user', JSON.stringify(mockUpdatedUser));
      expect(result).toEqual({ success: true, user: mockUpdatedUser });
    });

    it('should handle update error', async () => {
      const mockError = {
        response: {
          data: { error: 'Validation failed' }
        }
      };
      
      api.put.mockRejectedValue(mockError);
      
      const result = await updateUserProfile({ name: 'Test' });
      
      expect(result).toEqual({
        success: false,
        error: 'Validation failed'
      });
      expect(storeInLocalStorage).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockResponse = { data: { message: 'Password changed successfully' } };
      
      api.post.mockResolvedValue(mockResponse);
      
      const result = await changePassword('oldpass', 'newpass');
      
      expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
        oldPassword: 'oldpass',
        newPassword: 'newpass'
      });
      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully'
      });
    });

    it('should handle change password error', async () => {
      const mockError = {
        response: {
          data: { message: 'Current password is incorrect' }
        }
      };
      
      api.post.mockRejectedValue(mockError);
      
      const result = await changePassword('wrongpass', 'newpass');
      
      expect(result).toEqual({
        success: false,
        message: 'Current password is incorrect'
      });
    });

    it('should handle generic change password error', async () => {
      api.post.mockRejectedValue(new Error('Network error'));
      
      const result = await changePassword('old', 'new');
      
      expect(result).toEqual({
        success: false,
        message: 'Erreur lors du changement de mot de passe'
      });
    });
  });
});