// 📁 __tests__/hooks/customHooks.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock des services AVANT les imports
vi.mock('../services/authService', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('../services/bookService', () => ({
  getBestRatedBooks: vi.fn(),
  getLastAddedBooks: vi.fn(),
  getBooks: vi.fn(),
}));

// Import des hooks et services APRÈS les mocks
import {
  useUser,
  useBestRatedBooks,
  useLastAddedBooks,
  useFilePreview,
  useFilteredBooks,
} from './customHooks';

import { getAuthenticatedUser } from '../services/authService';
import { getBestRatedBooks, getLastAddedBooks, getBooks } from '../services/bookService';

// Mock de URL.createObjectURL et URL.revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
});

describe('customHooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn(); // Mock console.error pour éviter les logs dans les tests
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useUser', () => {
    it('should initialize with default values', () => {
      getAuthenticatedUser.mockResolvedValue({ authenticated: false, user: null });

      const { result } = renderHook(() => useUser());

      expect(result.current.connectedUser).toBeNull();
      expect(result.current.auth).toBe(false);
      expect(result.current.userLoading).toBe(true);
    });

    it('should set authenticated user successfully', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      getAuthenticatedUser.mockResolvedValue({ authenticated: true, user: mockUser });

      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.userLoading).toBe(false);
      });

      expect(result.current.connectedUser).toEqual(mockUser);
      expect(result.current.auth).toBe(true);
      expect(result.current.userLoading).toBe(false);
    });

    it('should handle unauthenticated user', async () => {
      getAuthenticatedUser.mockResolvedValue({ authenticated: false, user: null });

      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.userLoading).toBe(false);
      });

      expect(result.current.connectedUser).toBeNull();
      expect(result.current.auth).toBe(false);
      expect(result.current.userLoading).toBe(false);
    });

    it('should handle authentication service error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      getAuthenticatedUser.mockRejectedValue(new Error('Auth service error'));

      const { result } = renderHook(() => useUser());

      // Attendre que l'effet se termine même en cas d'erreur
      await waitFor(
        () => {
          expect(result.current.userLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      expect(result.current.connectedUser).toBeNull();
      expect(result.current.auth).toBe(false);
      expect(result.current.userLoading).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('useBestRatedBooks', () => {
    const mockFilters = { genre: 'fiction', rating: 4 };

    it('should initialize with default values', () => {
      getBestRatedBooks.mockResolvedValue([]);

      const { result } = renderHook(() => useBestRatedBooks(mockFilters));

      expect(result.current.bestRatedBooks).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should fetch best rated books successfully', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', rating: 4.8 },
        { id: 2, title: 'Book 2', rating: 4.7 },
      ];
      getBestRatedBooks.mockResolvedValue(mockBooks);

      const { result } = renderHook(() => useBestRatedBooks(mockFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bestRatedBooks).toEqual(mockBooks);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(getBestRatedBooks).toHaveBeenCalledWith(mockFilters);
    });

    it('should handle non-array response', async () => {
      getBestRatedBooks.mockResolvedValue(null);

      const { result } = renderHook(() => useBestRatedBooks(mockFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bestRatedBooks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      getBestRatedBooks.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useBestRatedBooks(mockFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bestRatedBooks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erreur chargement des meilleurs livres');
      expect(console.error).toHaveBeenCalledWith('Erreur meilleurs livres:', expect.any(Error));
    });

    it('should refetch when filters change', async () => {
      const mockBooks1 = [{ id: 1, title: 'Book 1' }];
      const mockBooks2 = [{ id: 2, title: 'Book 2' }];

      getBestRatedBooks.mockResolvedValueOnce(mockBooks1).mockResolvedValueOnce(mockBooks2);

      const { result, rerender } = renderHook(({ filters }) => useBestRatedBooks(filters), {
        initialProps: { filters: mockFilters },
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.bestRatedBooks).toEqual(mockBooks1);

      const newFilters = { genre: 'mystery', rating: 5 };
      rerender({ filters: newFilters });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bestRatedBooks).toEqual(mockBooks2);
      expect(getBestRatedBooks).toHaveBeenCalledWith(newFilters);
    });
  });

  describe('useLastAddedBooks', () => {
    const mockFilters = { genre: 'fiction' };

    it('should initialize with default values', () => {
      getLastAddedBooks.mockResolvedValue([]);

      const { result } = renderHook(() => useLastAddedBooks(mockFilters));

      expect(result.current.lastAddedBooks).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should fetch last added books successfully', async () => {
      const mockBooks = [
        { id: 1, title: 'New Book 1', createdAt: '2023-12-01' },
        { id: 2, title: 'New Book 2', createdAt: '2023-11-30' },
      ];
      getLastAddedBooks.mockResolvedValue(mockBooks);

      const { result } = renderHook(() => useLastAddedBooks(mockFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lastAddedBooks).toEqual(mockBooks);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(getLastAddedBooks).toHaveBeenCalledWith(mockFilters);
    });

    it('should handle non-array response', async () => {
      getLastAddedBooks.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLastAddedBooks(mockFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lastAddedBooks).toEqual([]);
    });

    it('should handle fetch error', async () => {
      getLastAddedBooks.mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() => useLastAddedBooks(mockFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lastAddedBooks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erreur chargement des derniers livres');
      expect(console.error).toHaveBeenCalledWith('Erreur derniers livres:', expect.any(Error));
    });
  });

  describe('useFilePreview', () => {
    beforeEach(() => {
      mockCreateObjectURL.mockReturnValue('blob:mock-url');
    });

    it('should return null for no file', () => {
      const { result } = renderHook(() => useFilePreview(null));

      expect(result.current[0]).toBeNull();
    });

    it('should create object URL for valid file', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      const { result } = renderHook(() => useFilePreview(mockFile));

      expect(result.current[0]).toBe('blob:mock-url');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it('should revoke object URL on cleanup', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      const { result, unmount } = renderHook(() => useFilePreview(mockFile));

      expect(result.current[0]).toBe('blob:mock-url');

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle file change', () => {
      const mockFile1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
      const mockFile2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });

      mockCreateObjectURL
        .mockReturnValueOnce('blob:mock-url-1')
        .mockReturnValueOnce('blob:mock-url-2');

      const { result, rerender } = renderHook(({ file }) => useFilePreview(file), {
        initialProps: { file: mockFile1 },
      });

      expect(result.current[0]).toBe('blob:mock-url-1');

      rerender({ file: mockFile2 });

      expect(result.current[0]).toBe('blob:mock-url-2');
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url-1');
    });

    it('should handle non-file input', () => {
      const { result } = renderHook(() => useFilePreview('not-a-file'));

      expect(result.current[0]).toBeNull();
      expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('useFilteredBooks', () => {
    const mockFilters = { genre: 'fiction', author: 'John Doe' };

    it('should initialize with default values', () => {
      getBooks.mockResolvedValue({ books: [], total: 0 });

      const { result } = renderHook(() => useFilteredBooks());

      expect(result.current.books).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should fetch filtered books successfully', async () => {
      const mockResponse = {
        books: [
          { id: 1, title: 'Book 1' },
          { id: 2, title: 'Book 2' },
        ],
        total: 25,
      };
      getBooks.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFilteredBooks(mockFilters, 2, 5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.books).toEqual(mockResponse.books);
      expect(result.current.total).toBe(25);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(getBooks).toHaveBeenCalledWith(mockFilters, 2, 5);
    });

    it('should handle non-array books response', async () => {
      getBooks.mockResolvedValue({ books: null, total: 0 });

      const { result } = renderHook(() => useFilteredBooks(mockFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.books).toEqual([]);
      expect(result.current.total).toBe(0);
    });

    it('should handle missing total in response', async () => {
      getBooks.mockResolvedValue({ books: [] });

      const { result } = renderHook(() => useFilteredBooks(mockFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.books).toEqual([]);
      expect(result.current.total).toBe(0);
    });

    it('should handle fetch error', async () => {
      getBooks.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useFilteredBooks(mockFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.books).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erreur chargement des livres');
      expect(console.error).toHaveBeenCalledWith('Erreur livres filtrés:', expect.any(Error));
    });

    it('should refetch when parameters change', async () => {
      const mockResponse1 = { books: [{ id: 1 }], total: 1 };
      const mockResponse2 = { books: [{ id: 2 }], total: 1 };

      getBooks.mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2);

      const { result, rerender } = renderHook(
        ({ filters, page, limit }) => useFilteredBooks(filters, page, limit),
        {
          initialProps: {
            filters: mockFilters,
            page: 1,
            limit: 10,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.books).toEqual(mockResponse1.books);

      rerender({
        filters: { genre: 'mystery' },
        page: 2,
        limit: 20,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.books).toEqual(mockResponse2.books);
      expect(getBooks).toHaveBeenLastCalledWith({ genre: 'mystery' }, 2, 20);
    });

    it('should handle complex filter changes', async () => {
      const mockResponse = { books: [], total: 0 };
      getBooks.mockResolvedValue(mockResponse);

      const { result, rerender } = renderHook(({ filters }) => useFilteredBooks(filters), {
        initialProps: { filters: {} },
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Test avec différents types de filtres
      const complexFilters = {
        genre: 'fiction',
        author: 'Jane Doe',
        yearRange: [2020, 2023],
        rating: { min: 4, max: 5 },
      };

      rerender({ filters: complexFilters });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(getBooks).toHaveBeenLastCalledWith(complexFilters, 1, 10);
    });
  });
});
