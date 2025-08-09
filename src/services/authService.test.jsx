// src/services/authService.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { loginUser, logoutUser, fetchAuthenticatedUser } from './authService';

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Données de test
const mockUser = {
  userId: 1,
  name: 'John Doe',
  mail: 'john@example.com',
  role: 'user',
  status: 'active',
};

const mockLoginResponse = {
  user: mockUser,
  message: 'Connexion réussie',
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('loginUser', () => {
    test('should login user successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockLoginResponse,
      });

      const result = await loginUser('john@example.com', 'password123', 'recaptcha-token');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mail: 'john@example.com',
          password: 'password123',
          recaptchaToken: 'recaptcha-token',
        }),
      });
      expect(result).toEqual(mockLoginResponse);
    });

    test('should handle login without recaptcha token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockLoginResponse,
      });

      await loginUser('john@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mail: 'john@example.com',
          password: 'password123',
          recaptchaToken: undefined,
        }),
      });
    });

    test('should handle login error with error message', async () => {
      const errorResponse = {
        error: 'Identifiants invalides',
      };

      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => errorResponse,
      });

      await expect(loginUser('john@example.com', 'wrongpassword', 'token')).rejects.toThrow(
        'Identifiants invalides'
      );
    });

    test('should handle login error without specific error message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(loginUser('john@example.com', 'wrongpassword', 'token')).rejects.toThrow(
        'Erreur lors de la connexion'
      );
    });

    test('should handle network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(loginUser('john@example.com', 'password123', 'token')).rejects.toThrow(
        'Network error'
      );
    });

    test('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(loginUser('john@example.com', 'password123', 'token')).rejects.toThrow(
        'Invalid JSON'
      );
    });
  });

  describe('logoutUser', () => {
    test('should logout user successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      });

      await logoutUser();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });

    test('should handle logout even if response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      });

      // La fonction ne throw pas d'erreur même si la réponse n'est pas ok
      await expect(logoutUser()).resolves.toBeUndefined();
    });

    test('should handle network error during logout', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(logoutUser()).rejects.toThrow('Network error');
    });
  });

  describe('fetchAuthenticatedUser', () => {
    test('should fetch authenticated user successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const result = await fetchAuthenticatedUser();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockUser);
    });

    test('should return null when user is not authenticated', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      });

      const result = await fetchAuthenticatedUser();

      expect(result).toBeNull();
    });

    test('should return null on 401 unauthorized', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      });

      const result = await fetchAuthenticatedUser();

      expect(result).toBeNull();
    });

    test('should return null on 403 forbidden', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
      });

      const result = await fetchAuthenticatedUser();

      expect(result).toBeNull();
    });

    test('should handle network error gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchAuthenticatedUser()).rejects.toThrow('Network error');
    });

    test('should handle malformed JSON in user response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(fetchAuthenticatedUser()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('edge cases', () => {
    test('should handle empty email and password', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Email et mot de passe requis' }),
      });

      await expect(loginUser('', '')).rejects.toThrow('Email et mot de passe requis');
    });

    test('should handle special characters in credentials', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockLoginResponse,
      });

      await loginUser('test+user@example.com', 'p@ssw0rd!', 'token');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mail: 'test+user@example.com',
          password: 'p@ssw0rd!',
          recaptchaToken: 'token',
        }),
      });
    });

    test('should handle very long credentials', async () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const longPassword = 'p'.repeat(200);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockLoginResponse,
      });

      await loginUser(longEmail, longPassword, 'token');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mail: longEmail,
          password: longPassword,
          recaptchaToken: 'token',
        }),
      });
    });

    test('should handle response with extra user data', async () => {
      const extendedUser = {
        ...mockUser,
        avatar: 'avatar.jpg',
        preferences: { theme: 'dark' },
        lastLogin: '2024-01-15T10:30:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => extendedUser,
      });

      const result = await fetchAuthenticatedUser();

      expect(result).toEqual(extendedUser);
    });
  });
});
