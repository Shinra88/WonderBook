// 📁 __tests__/services/collectionService.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  addBookToCollection,
  removeBookFromCollection,
  getUserCollection,
  updateBookReadStatus,
  getReadingProgress,
  saveReadingProgress
} from './collectionService';

// Mock de l'API
vi.mock('./api/api', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn()
  }
}));

// Mock des constantes
vi.mock('../utils/constants', () => ({
  API_ROUTES: {
    COLLECTION: {
      ADD: '/collection/add',
      REMOVE: (bookId) => `/collection/remove/${bookId}`,
      GET_USER_COLLECTION: '/collection',
      UPDATE_READ: (bookId) => `/collection/${bookId}/read`,
      GET_PROGRESS: (bookId) => `/collection/${bookId}/progress`,
      SAVE_PROGRESS: (bookId) => `/collection/${bookId}/progress`
    }
  }
}));

import api from './api/api';

describe('collectionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('addBookToCollection', () => {
    it('should add book to collection successfully', async () => {
      const mockResponse = { data: { success: true, message: 'Book added' } };
      api.post.mockResolvedValue(mockResponse);

      const result = await addBookToCollection(123);

      expect(api.post).toHaveBeenCalledWith('/collection/add', { bookId: 123 });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle add book error', async () => {
      const mockError = new Error('Add failed');
      api.post.mockRejectedValue(mockError);

      await expect(addBookToCollection(123)).rejects.toThrow('Add failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different book IDs', async () => {
      const mockResponse = { data: { success: true } };
      api.post.mockResolvedValue(mockResponse);

      await addBookToCollection(456);

      expect(api.post).toHaveBeenCalledWith('/collection/add', { bookId: 456 });
    });
  });

  describe('removeBookFromCollection', () => {
    it('should remove book from collection successfully', async () => {
      const mockResponse = { data: { success: true, message: 'Book removed' } };
      api.delete.mockResolvedValue(mockResponse);

      const result = await removeBookFromCollection(123);

      expect(api.delete).toHaveBeenCalledWith('/collection/remove/123');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle remove book error', async () => {
      const mockError = new Error('Remove failed');
      api.delete.mockRejectedValue(mockError);

      await expect(removeBookFromCollection(123)).rejects.toThrow('Remove failed');
      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors du retrait de la collection :',
        mockError
      );
    });

    it('should handle different book IDs for removal', async () => {
      const mockResponse = { data: { success: true } };
      api.delete.mockResolvedValue(mockResponse);

      await removeBookFromCollection(789);

      expect(api.delete).toHaveBeenCalledWith('/collection/remove/789');
    });
  });

  describe('getUserCollection', () => {
    it('should get user collection without filters', async () => {
      const mockCollection = [
        { id: 1, title: 'Book 1', is_read: false },
        { id: 2, title: 'Book 2', is_read: true }
      ];
      api.get.mockResolvedValue({ data: mockCollection });

      const result = await getUserCollection();

      expect(api.get).toHaveBeenCalledWith('/collection', { params: {} });
      expect(result).toEqual(mockCollection);
    });

    it('should get user collection with all filters', async () => {
      const mockCollection = [{ id: 1, title: 'Book 1' }];
      api.get.mockResolvedValue({ data: mockCollection });

      const result = await getUserCollection({
        read: true,
        noted: true,
        commented: true
      });

      expect(api.get).toHaveBeenCalledWith('/collection', {
        params: {
          is_read: true,
          is_noted: true,
          is_commented: true
        }
      });
      expect(result).toEqual(mockCollection);
    });

    it('should get user collection with partial filters', async () => {
      const mockCollection = [];
      api.get.mockResolvedValue({ data: mockCollection });

      await getUserCollection({ read: true, noted: false });

      expect(api.get).toHaveBeenCalledWith('/collection', {
        params: { is_read: true }
      });
    });

    it('should handle get collection error', async () => {
      const mockError = new Error('Collection fetch failed');
      api.get.mockRejectedValue(mockError);

      await expect(getUserCollection()).rejects.toThrow('Collection fetch failed');
      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors de la récupération de la collection :',
        mockError
      );
    });

    it('should handle empty object parameter', async () => {
      const mockCollection = [];
      api.get.mockResolvedValue({ data: mockCollection });

      await getUserCollection({});

      expect(api.get).toHaveBeenCalledWith('/collection', { params: {} });
    });
  });

  describe('updateBookReadStatus', () => {
    it('should update book read status to true', async () => {
      const mockResponse = { data: { success: true, is_read: true } };
      api.patch.mockResolvedValue(mockResponse);

      const result = await updateBookReadStatus(123, true);

      expect(api.patch).toHaveBeenCalledWith('/collection/123/read', {
        is_read: true
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should update book read status to false', async () => {
      const mockResponse = { data: { success: true, is_read: false } };
      api.patch.mockResolvedValue(mockResponse);

      const result = await updateBookReadStatus(123, false);

      expect(api.patch).toHaveBeenCalledWith('/collection/123/read', {
        is_read: false
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle update read status error', async () => {
      const mockError = new Error('Update failed');
      api.patch.mockRejectedValue(mockError);

      await expect(updateBookReadStatus(123, true)).rejects.toThrow('Update failed');
      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors de la mise à jour du statut de lecture :',
        mockError
      );
    });
  });

  describe('getReadingProgress', () => {
    it('should get reading progress successfully', async () => {
      const mockResponse = { data: { cfi: 'epubcfi(/6/4[chapter01]!/4/2/1:0)' } };
      api.get.mockResolvedValue(mockResponse);

      const result = await getReadingProgress(123);

      expect(api.get).toHaveBeenCalledWith('/collection/123/progress');
      expect(result).toBe('epubcfi(/6/4[chapter01]!/4/2/1:0)');
    });

    it('should return null when no CFI in response', async () => {
      const mockResponse = { data: {} };
      api.get.mockResolvedValue(mockResponse);

      const result = await getReadingProgress(123);

      expect(result).toBeNull();
    });

    it('should return null when CFI is null', async () => {
      const mockResponse = { data: { cfi: null } };
      api.get.mockResolvedValue(mockResponse);

      const result = await getReadingProgress(123);

      expect(result).toBeNull();
    });

    it('should handle get reading progress error', async () => {
      const mockError = new Error('Progress fetch failed');
      api.get.mockRejectedValue(mockError);

      const result = await getReadingProgress(123);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Erreur récupération position de lecture :',
        mockError
      );
    });
  });

  describe('saveReadingProgress', () => {
    it('should save reading progress successfully', async () => {
      api.post.mockResolvedValue({ data: { success: true } });

      const cfi = 'epubcfi(/6/4[chapter01]!/4/2/1:0)';
      await saveReadingProgress(123, cfi);

      expect(api.post).toHaveBeenCalledWith('/collection/123/progress', { cfi });
    });

    it('should handle save reading progress error silently', async () => {
      const mockError = new Error('Save failed');
      api.post.mockRejectedValue(mockError);

      // Should not throw, just log error
      await saveReadingProgress(123, 'test-cfi');

      expect(console.error).toHaveBeenCalledWith(
        'Erreur sauvegarde position de lecture :',
        mockError
      );
    });

    it('should handle different CFI formats', async () => {
      api.post.mockResolvedValue({ data: { success: true } });

      const cfi = 'epubcfi(/6/2[cover]!/4)';
      await saveReadingProgress(456, cfi);

      expect(api.post).toHaveBeenCalledWith('/collection/456/progress', { cfi });
    });

    it('should handle empty CFI', async () => {
      api.post.mockResolvedValue({ data: { success: true } });

      await saveReadingProgress(123, '');

      expect(api.post).toHaveBeenCalledWith('/collection/123/progress', { cfi: '' });
    });
  });

  describe('Integration tests', () => {
    it('should handle complete collection workflow', async () => {
      // Mock responses for all operations
      const addResponse = { data: { success: true } };
      const collectionResponse = { data: [{ id: 1, is_read: false }] };
      const updateResponse = { data: { success: true, is_read: true } };
      const progressResponse = { data: { cfi: 'test-cfi' } };

      api.post.mockResolvedValueOnce(addResponse);
      api.get.mockResolvedValueOnce(collectionResponse);
      api.patch.mockResolvedValueOnce(updateResponse);
      api.get.mockResolvedValueOnce(progressResponse);
      api.post.mockResolvedValueOnce({ data: { success: true } });

      // Test workflow
      const addResult = await addBookToCollection(123);
      const collection = await getUserCollection();
      const updateResult = await updateBookReadStatus(123, true);
      const progress = await getReadingProgress(123);
      await saveReadingProgress(123, 'new-cfi');

      expect(addResult).toEqual(addResponse.data);
      expect(collection).toEqual(collectionResponse.data);
      expect(updateResult).toEqual(updateResponse.data);
      expect(progress).toBe('test-cfi');
    });
  });
});