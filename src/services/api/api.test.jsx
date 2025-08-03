// 📁 __tests__/services/api/api.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock d'axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock de localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('api service', () => {
  let mockAxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    console.warn = vi.fn();
    
    // Mock de l'instance axios
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Réimporter le module pour réinitialiser les interceptors
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create axios instance with correct baseURL', async () => {
    await import('./api');
    
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: '/api'
    });
  });

  it('should setup request and response interceptors', async () => {
    await import('./api');
    
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  describe('Request Interceptor', () => {
    let requestInterceptor;

    beforeEach(async () => {
      await import('./api');
      requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    });

    it('should add Authorization header when token exists', () => {
      const token = 'test-token-123';
      mockLocalStorage.getItem.mockReturnValue(token);
      
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not add Authorization header when no token', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should preserve existing headers', () => {
      const token = 'test-token';
      mockLocalStorage.getItem.mockReturnValue(token);
      
      const config = { 
        headers: { 
          'Content-Type': 'application/json',
          'Custom-Header': 'custom-value'
        } 
      };
      const result = requestInterceptor(config);
      
      expect(result.headers['Content-Type']).toBe('application/json');
      expect(result.headers['Custom-Header']).toBe('custom-value');
      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should handle request error', () => {
      const requestErrorHandler = mockAxiosInstance.interceptors.request.use.mock.calls[0][1];
      const error = new Error('Request error');
      
      expect(() => requestErrorHandler(error)).rejects.toThrow('Request error');
    });
  });

  describe('Response Interceptor', () => {
    let responseInterceptor;
    let responseErrorHandler;

    beforeEach(async () => {
      await import('./api');
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      responseInterceptor = interceptorCall[0];
      responseErrorHandler = interceptorCall[1];
    });

    it('should return response unchanged on success', () => {
      const response = { data: { success: true }, status: 200 };
      const result = responseInterceptor(response);
      
      expect(result).toBe(response);
    });

    it('should log warning on 401 error', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      
      await expect(responseErrorHandler(error)).rejects.toThrow();
      expect(console.warn).toHaveBeenCalledWith('🔐 Token invalide ou expiré');
    });

    it('should log warning on 403 error', async () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      };
      
      await expect(responseErrorHandler(error)).rejects.toThrow();
      expect(console.warn).toHaveBeenCalledWith('🔐 Token invalide ou expiré');
    });

    it('should not log warning on other error codes', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };
      
      await expect(responseErrorHandler(error)).rejects.toThrow();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should handle error without response', async () => {
      const error = new Error('Network error');
      
      await expect(responseErrorHandler(error)).rejects.toThrow('Network error');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should handle error with response but no status', async () => {
      const error = {
        response: {
          data: { message: 'Unknown error' }
        }
      };
      
      await expect(responseErrorHandler(error)).rejects.toThrow();
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('Integration tests', () => {
    it('should export the configured axios instance', async () => {
      const { default: api } = await import('./api');
      
      expect(api).toBe(mockAxiosInstance);
    });

    it('should handle complete request flow with token', async () => {
      const token = 'integration-test-token';
      mockLocalStorage.getItem.mockReturnValue(token);
      
      await import('./api');
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      const config = { headers: {}, url: '/test' };
      const processedConfig = requestInterceptor(config);
      
      expect(processedConfig.headers.Authorization).toBe(`Bearer ${token}`);
      expect(processedConfig.url).toBe('/test');
    });
  });
});