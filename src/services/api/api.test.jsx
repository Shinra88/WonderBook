// 📁 __tests__/services/api/api.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock de fetch global
global.fetch = vi.fn();

describe('api service', () => {
  let api;

  beforeEach(async () => {
    vi.clearAllMocks();
    console.error = vi.fn();
    console.warn = vi.fn();

    // Mock fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue({ data: 'test' }),
    });

    // Import dynamique pour reset
    vi.resetModules();
    const apiModule = await import('../../../src/services/api/api');
    api = apiModule.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET requests', () => {
    it('should make GET request with correct parameters', async () => {
      await api.get('/test-endpoint');

      expect(global.fetch).toHaveBeenCalledWith('/test-endpoint', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should return data on successful GET request', async () => {
      const mockData = { users: [{ id: 1, name: 'Test' }] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      });

      const result = await api.get('/users');

      expect(result).toEqual({ data: mockData });
    });
  });

  describe('POST requests', () => {
    it('should make POST request with JSON data', async () => {
      const testData = { name: 'Test User', email: 'test@example.com' };

      await api.post('/users', testData);

      expect(global.fetch).toHaveBeenCalledWith('/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
    });

    it('should handle FormData correctly', async () => {
      const formData = new FormData();
      formData.append('file', 'test-file');

      await api.post('/upload', formData);

      expect(global.fetch).toHaveBeenCalledWith('/upload', {
        method: 'POST',
        credentials: 'include',
        headers: {},
        body: formData,
      });
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with JSON data', async () => {
      const testData = { id: 1, name: 'Updated User' };

      await api.put('/users/1', testData);

      expect(global.fetch).toHaveBeenCalledWith('/users/1', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      await api.delete('/users/1');

      expect(global.fetch).toHaveBeenCalledWith('/users/1', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Error handling', () => {
    it('should handle 401/403 responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
      });

      const result = await api.get('/protected');

      expect(console.warn).toHaveBeenCalledWith('🔐 Token invalide ou expiré');
      expect(result).toEqual({ data: null, error: 'Unauthorized' });
    });

    it('should handle 304 responses (cache)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 304,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
      });

      const result = await api.get('/cached-data');

      expect(result).toEqual({ data: null });
    });

    it('should handle non-JSON responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn().mockReturnValue('text/html'),
        },
      });

      const result = await api.get('/non-json');

      expect(result).toEqual({ data: null });
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      global.fetch.mockRejectedValueOnce(networkError);

      await expect(api.get('/error')).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith('Erreur API:', networkError);
    });

    it('should handle HTTP error responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
      });

      await expect(api.get('/server-error')).rejects.toThrow('HTTP 500');
    });
  });

  describe('Response parsing', () => {
    it('should parse JSON response correctly', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn().mockReturnValue('application/json; charset=utf-8'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      });

      const result = await api.get('/test');

      expect(result).toEqual({ data: mockData });
    });

    it('should handle empty JSON response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue(null),
      });

      const result = await api.get('/empty');

      expect(result).toEqual({ data: null });
    });
  });
});
