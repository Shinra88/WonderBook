// 📁 __tests__/services/uploadServices.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  uploadImageToS3,
  updateAvatarOnS3,
  uploadEbookToS3
} from './uploadServices';

// Mock de l'API
vi.mock('./api/api', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn()
  }
}));

// Mock des constantes
vi.mock('../utils/constants', () => ({
  API_ROUTES: {
    AUTH: {
      UPLOAD_IMAGE: '/api/upload/image',
      UPDATE_AVATAR: '/api/upload/avatar',
      UPLOAD_EBOOK: '/api/upload/ebook'
    }
  }
}));

// Mock du localStorage utilities
vi.mock('../utils/localStorage', () => ({
  getFromLocalStorage: vi.fn()
}));

import api from './api/api';
import { getFromLocalStorage } from '../utils/localStorage';

describe('uploadServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadImageToS3', () => {
    it('should upload image successfully with default title', async () => {
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { data: { imageUrl: 'https://s3.amazonaws.com/bucket/image.jpg' } };
      api.post.mockResolvedValue(mockResponse);

      const result = await uploadImageToS3(mockFile);

      expect(api.post).toHaveBeenCalledWith(
        '/api/upload/image',
        expect.any(FormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      expect(result).toBe('https://s3.amazonaws.com/bucket/image.jpg');

      // Vérifier le contenu du FormData
      const formDataCall = api.post.mock.calls[0][1];
      expect(formDataCall.get('file')).toBe(mockFile);
      expect(formDataCall.get('title')).toBe('image');
    });

    it('should upload image with custom title', async () => {
      const mockFile = new File(['image content'], 'book-cover.jpg', { type: 'image/jpeg' });
      const mockResponse = { data: { imageUrl: 'https://s3.amazonaws.com/bucket/book-cover.jpg' } };
      api.post.mockResolvedValue(mockResponse);

      const result = await uploadImageToS3(mockFile, 'book-cover');

      const formDataCall = api.post.mock.calls[0][1];
      expect(formDataCall.get('title')).toBe('book-cover');
      expect(result).toBe('https://s3.amazonaws.com/bucket/book-cover.jpg');
    });

    it('should handle upload error and return null', async () => {
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      const mockError = new Error('Upload failed');
      api.post.mockRejectedValue(mockError);

      const result = await uploadImageToS3(mockFile);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different file types', async () => {
      const mockFile = new File(['image content'], 'test.png', { type: 'image/png' });
      const mockResponse = { data: { imageUrl: 'https://s3.amazonaws.com/bucket/test.png' } };
      api.post.mockResolvedValue(mockResponse);

      await uploadImageToS3(mockFile, 'png-image');

      const formDataCall = api.post.mock.calls[0][1];
      expect(formDataCall.get('file')).toBe(mockFile);
      expect(formDataCall.get('title')).toBe('png-image');
    });
  });

  describe('updateAvatarOnS3', () => {
    const mockUser = { name: 'John Doe', id: 123 };

    it('should update avatar successfully', async () => {
      const mockFile = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockResponse = { data: { imageUrl: 'https://s3.amazonaws.com/bucket/new-avatar.jpg' } };
      
      getFromLocalStorage.mockReturnValue(JSON.stringify(mockUser));
      api.put.mockResolvedValue(mockResponse);

      const result = await updateAvatarOnS3(mockFile, 123, 'old-avatar-url');

      expect(api.put).toHaveBeenCalledWith(
        '/api/upload/avatar',
        expect.any(FormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      expect(result).toBe('https://s3.amazonaws.com/bucket/new-avatar.jpg');

      // Vérifier le contenu du FormData
      const formDataCall = api.put.mock.calls[0][1];
      expect(formDataCall.get('file')).toBe(mockFile);
      expect(formDataCall.get('userId')).toBe('123');
      expect(formDataCall.get('oldUrl')).toBe('old-avatar-url');
      expect(formDataCall.get('name')).toBe('John Doe');
    });

    it('should handle user without name', async () => {
      const userWithoutName = { id: 123 };
      const mockFile = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockResponse = { data: { imageUrl: 'https://s3.amazonaws.com/bucket/avatar.jpg' } };
      
      getFromLocalStorage.mockReturnValue(JSON.stringify(userWithoutName));
      api.put.mockResolvedValue(mockResponse);

      await updateAvatarOnS3(mockFile, 123, 'old-url');

      const formDataCall = api.put.mock.calls[0][1];
      expect(formDataCall.get('name')).toBe('default');
    });

    it('should handle empty oldUrl', async () => {
      const mockFile = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockResponse = { data: { imageUrl: 'https://s3.amazonaws.com/bucket/avatar.jpg' } };
      
      getFromLocalStorage.mockReturnValue(JSON.stringify(mockUser));
      api.put.mockResolvedValue(mockResponse);

      await updateAvatarOnS3(mockFile, 123);

      const formDataCall = api.put.mock.calls[0][1];
      expect(formDataCall.get('oldUrl')).toBe('');
    });

    it('should handle user not found in localStorage', async () => {
      const mockFile = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      
      getFromLocalStorage.mockReturnValue(null);

      const result = await updateAvatarOnS3(mockFile, 123, 'old-url');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      expect(api.put).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON in localStorage', async () => {
      const mockFile = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      
      getFromLocalStorage.mockReturnValue('invalid-json');

      const result = await updateAvatarOnS3(mockFile, 123, 'old-url');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      expect(api.put).not.toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      const mockFile = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockError = new Error('Avatar update failed');
      
      getFromLocalStorage.mockReturnValue(JSON.stringify(mockUser));
      api.put.mockRejectedValue(mockError);

      const result = await updateAvatarOnS3(mockFile, 123, 'old-url');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle unexpected API response', async () => {
      const mockFile = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockResponse = { data: { success: true } }; // Missing imageUrl
      
      getFromLocalStorage.mockReturnValue(JSON.stringify(mockUser));
      api.put.mockResolvedValue(mockResponse);

      const result = await updateAvatarOnS3(mockFile, 123, 'old-url');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle user as object instead of string', async () => {
      const mockFile = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockResponse = { data: { imageUrl: 'https://s3.amazonaws.com/bucket/avatar.jpg' } };
      
      getFromLocalStorage.mockReturnValue(mockUser); // Direct object instead of JSON string
      api.put.mockResolvedValue(mockResponse);

      const result = await updateAvatarOnS3(mockFile, 123, 'old-url');

      expect(result).toBe('https://s3.amazonaws.com/bucket/avatar.jpg');
    });
  });

  describe('uploadEbookToS3', () => {
    it('should upload ebook successfully', async () => {
      const mockFile = new File(['ebook content'], 'book.epub', { type: 'application/epub+zip' });
      const mockResponse = { data: { ebook_url: 'https://s3.amazonaws.com/bucket/book.epub' } };
      api.put.mockResolvedValue(mockResponse);

      const result = await uploadEbookToS3(mockFile, 123);

      expect(api.put).toHaveBeenCalledWith(
        '/api/upload/ebook',
        expect.any(FormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      expect(result).toBe('https://s3.amazonaws.com/bucket/book.epub');

      // Vérifier le contenu du FormData
      const formDataCall = api.put.mock.calls[0][1];
      expect(formDataCall.get('file')).toBe(mockFile);
      expect(formDataCall.get('bookId')).toBe('123');
    });

    it('should handle missing file', async () => {
      const result = await uploadEbookToS3(null, 123);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      expect(api.put).not.toHaveBeenCalled();
    });

    it('should handle missing bookId', async () => {
      const mockFile = new File(['ebook content'], 'book.epub', { type: 'application/epub+zip' });

      const result = await uploadEbookToS3(mockFile, null);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      expect(api.put).not.toHaveBeenCalled();
    });

    it('should handle missing both file and bookId', async () => {
      const result = await uploadEbookToS3(null, null);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      expect(api.put).not.toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      const mockFile = new File(['ebook content'], 'book.epub', { type: 'application/epub+zip' });
      const mockError = new Error('Ebook upload failed');
      api.put.mockRejectedValue(mockError);

      const result = await uploadEbookToS3(mockFile, 123);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle unexpected API response', async () => {
      const mockFile = new File(['ebook content'], 'book.epub', { type: 'application/epub+zip' });
      const mockResponse = { data: { success: true } }; // Missing ebook_url
      api.put.mockResolvedValue(mockResponse);

      const result = await uploadEbookToS3(mockFile, 123);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different file types', async () => {
      const mockFile = new File(['pdf content'], 'book.pdf', { type: 'application/pdf' });
      const mockResponse = { data: { ebook_url: 'https://s3.amazonaws.com/bucket/book.pdf' } };
      api.put.mockResolvedValue(mockResponse);

      const result = await uploadEbookToS3(mockFile, 456);

      expect(result).toBe('https://s3.amazonaws.com/bucket/book.pdf');

      const formDataCall = api.put.mock.calls[0][1];
      expect(formDataCall.get('file')).toBe(mockFile);
      expect(formDataCall.get('bookId')).toBe('456');
    });

    it('should handle string bookId', async () => {
      const mockFile = new File(['ebook content'], 'book.epub', { type: 'application/epub+zip' });
      const mockResponse = { data: { ebook_url: 'https://s3.amazonaws.com/bucket/book.epub' } };
      api.put.mockResolvedValue(mockResponse);

      await uploadEbookToS3(mockFile, '789');

      const formDataCall = api.put.mock.calls[0][1];
      expect(formDataCall.get('bookId')).toBe('789');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete upload workflow', async () => {
      // Mock pour tous les uploads
      const imageFile = new File(['image'], 'image.jpg', { type: 'image/jpeg' });
      const avatarFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      const ebookFile = new File(['ebook'], 'book.epub', { type: 'application/epub+zip' });
      
      const imageResponse = { data: { imageUrl: 'https://s3.com/image.jpg' } };
      const avatarResponse = { data: { imageUrl: 'https://s3.com/avatar.jpg' } };
      const ebookResponse = { data: { ebook_url: 'https://s3.com/book.epub' } };

      getFromLocalStorage.mockReturnValue(JSON.stringify({ name: 'John' }));
      api.post.mockResolvedValueOnce(imageResponse);
      api.put.mockResolvedValueOnce(avatarResponse);
      api.put.mockResolvedValueOnce(ebookResponse);

      // Test workflow
      const imageUrl = await uploadImageToS3(imageFile, 'test-image');
      const avatarUrl = await updateAvatarOnS3(avatarFile, 123, 'old-avatar');
      const ebookUrl = await uploadEbookToS3(ebookFile, 456);

      expect(imageUrl).toBe('https://s3.com/image.jpg');
      expect(avatarUrl).toBe('https://s3.com/avatar.jpg');
      expect(ebookUrl).toBe('https://s3.com/book.epub');

      // Vérifier que tous les appels ont été faits
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.put).toHaveBeenCalledTimes(2);
    });

    it('should handle large files', async () => {
      const largeFileContent = 'A'.repeat(10000); // 10KB
      const largeFile = new File([largeFileContent], 'large-book.epub', { 
        type: 'application/epub+zip' 
      });
      const mockResponse = { data: { ebook_url: 'https://s3.com/large-book.epub' } };
      api.put.mockResolvedValue(mockResponse);

      const result = await uploadEbookToS3(largeFile, 123);

      expect(result).toBe('https://s3.com/large-book.epub');
      expect(api.put).toHaveBeenCalledWith(
        '/api/upload/ebook',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    });
  });
});