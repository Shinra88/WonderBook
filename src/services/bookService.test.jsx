// 📁 __tests__/services/bookService.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getBooks,
  getBook,
  getBestRatedBooks,
  getLastAddedBooks,
  deleteBook,
  addBook,
  updateBook,
  rateBook,
  getBookByTitle,
  updateBookInfo,
} from './bookService';

// Mock de l'API
vi.mock('../services/api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock des constantes
vi.mock('../utils/constants', () => ({
  API_ROUTES: {
    BOOKS: {
      BASE: '/api/books',
      BEST_RATED: '/api/books/best-rated',
      LAST_ADDED: '/api/books/last-added',
    },
  },
}));

// Mock de localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

import api from '../services/api/api';

describe('bookService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
    mockLocalStorage.getItem.mockReturnValue('user123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getBooks', () => {
    it('should fetch books with filters and pagination', async () => {
      const mockResponse = {
        data: { books: [{ id: 1, title: 'Test Book' }], total: 1 },
      };
      api.get.mockResolvedValue(mockResponse);

      const filters = {
        year: 2023,
        start: '2023-01-01',
        end: '2023-12-31',
        categories: ['fiction', 'drama'],
        type: 'novel',
        search: 'test',
        pendingFirst: true,
      };

      const result = await getBooks(filters, 2, 20);

      expect(api.get).toHaveBeenCalledWith(
        '/api/books?year=2023&start=2023-01-01&end=2023-12-31&categories=fiction&categories=drama&type=novel&search=test&pendingFirst=true&page=2&limit=20'
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch books without filters', async () => {
      const mockResponse = { data: { books: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await getBooks();

      expect(api.get).toHaveBeenCalledWith('/api/books?page=1&limit=10');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      const result = await getBooks();

      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors de la récupération des livres :',
        expect.any(Error)
      );
      expect(result).toEqual({ books: [], total: 0 });
    });
  });

  describe('getBook', () => {
    it('should fetch book by ID', async () => {
      const mockBook = { id: 1, title: 'Test Book' };
      api.get.mockResolvedValue({ data: mockBook });

      const result = await getBook(1);

      expect(api.get).toHaveBeenCalledWith('/api/books/1');
      expect(result).toEqual(mockBook);
    });

    it('should handle error and return null', async () => {
      api.get.mockRejectedValue(new Error('Book not found'));

      const result = await getBook(999);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getBestRatedBooks', () => {
    it('should fetch best rated books with filters', async () => {
      const mockBooks = [{ id: 1, rating: 4.8 }];
      api.get.mockResolvedValue({ data: mockBooks });

      const filters = { categories: ['fiction'], year: 2023 };
      const result = await getBestRatedBooks(filters);

      expect(api.get).toHaveBeenCalledWith('/api/books/best-rated?year=2023&categories=fiction');
      expect(result).toEqual(mockBooks);
    });

    it('should handle error and return empty array', async () => {
      api.get.mockRejectedValue(new Error('Server error'));

      const result = await getBestRatedBooks();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getLastAddedBooks', () => {
    it('should fetch last added books', async () => {
      const mockBooks = [{ id: 1, title: 'Recent Book' }];
      api.get.mockResolvedValue({ data: mockBooks });

      const result = await getLastAddedBooks({ type: 'novel' });

      expect(api.get).toHaveBeenCalledWith('/api/books/last-added?type=novel');
      expect(result).toEqual(mockBooks);
    });

    it('should handle error and return empty array', async () => {
      api.get.mockRejectedValue(new Error('Server error'));

      const result = await getLastAddedBooks();

      expect(result).toEqual([]);
    });
  });

  describe('deleteBook', () => {
    it('should delete book successfully', async () => {
      api.delete.mockResolvedValue({});

      const result = await deleteBook(1);

      expect(api.delete).toHaveBeenCalledWith('/api/books/1');
      expect(result).toBe(true);
    });

    it('should handle delete error', async () => {
      api.delete.mockRejectedValue(new Error('Delete failed'));

      const result = await deleteBook(1);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addBook', () => {
    it('should add book with image', async () => {
      const mockResponse = { data: { id: 1, title: 'New Book' } };
      api.post.mockResolvedValue(mockResponse);

      const bookData = {
        title: 'New Book',
        author: 'Author Name',
        year: 2023,
        editor: 'Publisher',
        rating: '4',
        file: [new File([''], 'image.jpg')],
      };

      const result = await addBook(bookData);

      expect(api.post).toHaveBeenCalledWith('/api/books', expect.any(FormData));
      expect(result).toEqual(mockResponse.data);
    });

    it('should add book without rating', async () => {
      const mockResponse = { data: { id: 1 } };
      api.post.mockResolvedValue(mockResponse);

      const bookData = {
        title: 'Book',
        author: 'Author',
        year: 2023,
        editor: 'Publisher',
      };

      await addBook(bookData);

      expect(api.post).toHaveBeenCalled();
    });

    it('should handle add book error', async () => {
      api.post.mockRejectedValue(new Error('Add failed'));

      const result = await addBook({ title: 'Test' });

      expect(result).toEqual({
        error: true,
        message: 'Add failed',
      });
    });
  });

  describe('updateBook', () => {
    it('should update book with new image', async () => {
      const mockResponse = { data: { id: 1, title: 'Updated' } };
      api.put.mockResolvedValue(mockResponse);

      const bookData = {
        title: 'Updated Book',
        author: 'Author',
        year: 2023,
        editor: 'Publisher',
        file: [new File([''], 'new-image.jpg')],
      };

      const result = await updateBook(bookData, 1);

      expect(api.put).toHaveBeenCalledWith('/api/books/1', expect.any(FormData));
      expect(result).toEqual(mockResponse.data);
    });

    it('should update book without new image', async () => {
      const mockResponse = { data: { id: 1 } };
      api.put.mockResolvedValue(mockResponse);

      const bookData = {
        title: 'Updated Book',
        author: 'Author',
        year: 2023,
        editor: 'Publisher',
      };

      const result = await updateBook(bookData, 1);

      expect(api.put).toHaveBeenCalledWith('/api/books/1', {
        userId: 'user123',
        title: 'Updated Book',
        author: 'Author',
        date: 2023,
        editor: 'Publisher',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle update error', async () => {
      api.put.mockRejectedValue(new Error('Update failed'));

      const result = await updateBook({ title: 'Test' }, 1);

      expect(result).toEqual({
        error: true,
        message: 'Update failed',
      });
    });
  });

  describe('rateBook', () => {
    it('should rate book successfully', async () => {
      const mockResponse = { data: { success: true, averageRating: 4.5 } };
      api.post.mockResolvedValue(mockResponse);

      const result = await rateBook(1, 'user123', '4');

      expect(api.post).toHaveBeenCalledWith('/api/books/1/rating', {
        userId: 'user123',
        rating: 4,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle rating error', async () => {
      const mockError = new Error('Rating failed');
      api.post.mockRejectedValue(mockError);

      const result = await rateBook(1, 'user123', '5');

      expect(result).toBe('Rating failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getBookByTitle', () => {
    it('should fetch book by title', async () => {
      const mockBook = { id: 1, title: 'Test Book' };
      api.get.mockResolvedValue({ data: mockBook });

      const result = await getBookByTitle('Test Book');

      expect(api.get).toHaveBeenCalledWith('/api/books/title/Test%20Book');
      expect(result).toEqual(mockBook);
    });

    it('should handle special characters in title', async () => {
      const mockBook = { id: 1, title: 'Book & More' };
      api.get.mockResolvedValue({ data: mockBook });

      await getBookByTitle('Book & More');

      expect(api.get).toHaveBeenCalledWith('/api/books/title/Book%20%26%20More');
    });

    it('should handle error and return null', async () => {
      api.get.mockRejectedValue(new Error('Not found'));

      const result = await getBookByTitle('Unknown Book');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateBookInfo', () => {
    it('should update book info successfully', async () => {
      const mockResponse = { data: { id: 1, status: 'approved' } };
      api.put.mockResolvedValue(mockResponse);

      const updateData = { status: 'approved', moderatorNote: 'Looks good' };
      const result = await updateBookInfo(1, updateData);

      expect(api.put).toHaveBeenCalledWith('/api/books/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle update info error', async () => {
      api.put.mockRejectedValue(new Error('Update failed'));

      const result = await updateBookInfo(1, { status: 'rejected' });

      expect(result).toEqual({
        error: true,
        message: 'Update failed',
      });
    });
  });

  describe('appendFiltersToParams', () => {
    it('should handle empty categories array', async () => {
      const filters = { categories: [] };

      const mockResponse = { data: { books: [] } };
      api.get.mockResolvedValue(mockResponse);

      await getBooks(filters);

      expect(api.get).toHaveBeenCalledWith('/api/books?page=1&limit=10');
    });

    it('should handle filters with start but no end', async () => {
      const filters = { start: '2023-01-01' };

      const mockResponse = { data: { books: [] } };
      api.get.mockResolvedValue(mockResponse);

      await getBooks(filters);

      expect(api.get).toHaveBeenCalledWith('/api/books?page=1&limit=10');
    });

    it('should handle multiple categories', async () => {
      const filters = { categories: ['fiction', 'romance', 'mystery'] };

      const mockResponse = { data: { books: [] } };
      api.get.mockResolvedValue(mockResponse);

      await getBooks(filters);

      expect(api.get).toHaveBeenCalledWith(
        '/api/books?categories=fiction&categories=romance&categories=mystery&page=1&limit=10'
      );
    });
  });
});
