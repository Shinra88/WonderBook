// 📁 __tests__/services/commentService.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getComments,
  addOrUpdateComment,
  deleteComment,
  deleteCommentAsAdmin,
} from './commentService';

// Mock de l'API
vi.mock('./api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock des constantes
vi.mock('../utils/constants', () => ({
  API_ROUTES: {
    COMMENTS: {
      BASE: '/api/comments',
    },
  },
}));

import api from './api/api';

describe('commentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getComments', () => {
    it('should get comments for a book successfully', async () => {
      const mockComments = [
        { id: 1, content: 'Great book!', rating: 5, userId: 1 },
        { id: 2, content: 'Good read', rating: 4, userId: 2 },
      ];
      api.get.mockResolvedValue({ data: mockComments });

      const result = await getComments(123);

      expect(api.get).toHaveBeenCalledWith('/api/comments/123');
      expect(result).toEqual(mockComments);
    });

    it('should handle get comments error', async () => {
      const mockError = new Error('Comments fetch failed');
      api.get.mockRejectedValue(mockError);

      await expect(getComments(123)).rejects.toThrow('Comments fetch failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different book IDs', async () => {
      const mockComments = [];
      api.get.mockResolvedValue({ data: mockComments });

      await getComments(456);

      expect(api.get).toHaveBeenCalledWith('/api/comments/456');
    });

    it('should handle empty comments response', async () => {
      api.get.mockResolvedValue({ data: [] });

      const result = await getComments(123);

      expect(result).toEqual([]);
    });
  });

  describe('addOrUpdateComment', () => {
    it('should add comment with content and rating', async () => {
      const mockResponse = {
        id: 1,
        content: 'Amazing book!',
        rating: 5,
        userId: 1,
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const commentData = { content: 'Amazing book!', rating: 5 };
      const result = await addOrUpdateComment(123, commentData);

      expect(api.post).toHaveBeenCalledWith('/api/comments/123', {
        content: 'Amazing book!',
        rating: 5,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should add comment with only content', async () => {
      const mockResponse = { id: 1, content: 'Good book!', userId: 1 };
      api.post.mockResolvedValue({ data: mockResponse });

      const commentData = { content: 'Good book!' };
      const result = await addOrUpdateComment(123, commentData);

      expect(api.post).toHaveBeenCalledWith('/api/comments/123', {
        content: 'Good book!',
        rating: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should add comment with only rating', async () => {
      const mockResponse = { id: 1, rating: 4, userId: 1 };
      api.post.mockResolvedValue({ data: mockResponse });

      const commentData = { rating: 4 };
      const result = await addOrUpdateComment(123, commentData);

      expect(api.post).toHaveBeenCalledWith('/api/comments/123', {
        content: undefined,
        rating: 4,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle add comment error', async () => {
      const mockError = new Error('Comment add failed');
      api.post.mockRejectedValue(mockError);

      const commentData = { content: 'Test comment', rating: 3 };

      await expect(addOrUpdateComment(123, commentData)).rejects.toThrow('Comment add failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different book IDs for adding comments', async () => {
      const mockResponse = { id: 1, content: 'Test' };
      api.post.mockResolvedValue({ data: mockResponse });

      await addOrUpdateComment(789, { content: 'Test comment' });

      expect(api.post).toHaveBeenCalledWith('/api/comments/789', {
        content: 'Test comment',
        rating: undefined,
      });
    });

    it('should handle empty comment data', async () => {
      const mockResponse = { id: 1 };
      api.post.mockResolvedValue({ data: mockResponse });

      await addOrUpdateComment(123, {});

      expect(api.post).toHaveBeenCalledWith('/api/comments/123', {
        content: undefined,
        rating: undefined,
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete own comment successfully', async () => {
      const mockResponse = { success: true, message: 'Comment deleted' };
      api.delete.mockResolvedValue({ data: mockResponse });

      const result = await deleteComment(123);

      expect(api.delete).toHaveBeenCalledWith('/api/comments/admin/123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle delete comment error', async () => {
      const mockError = new Error('Delete failed');
      api.delete.mockRejectedValue(mockError);

      await expect(deleteComment(123)).rejects.toThrow('Delete failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different comment IDs for deletion', async () => {
      const mockResponse = { success: true };
      api.delete.mockResolvedValue({ data: mockResponse });

      await deleteComment(456);

      expect(api.delete).toHaveBeenCalledWith('/api/comments/admin/456');
    });
  });

  describe('deleteCommentAsAdmin', () => {
    it('should delete any comment as admin successfully', async () => {
      const mockResponse = { success: true, message: 'Comment deleted by admin' };
      api.delete.mockResolvedValue({ data: mockResponse });

      const result = await deleteCommentAsAdmin(123);

      expect(api.delete).toHaveBeenCalledWith('/api/comments/admin/123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle admin delete comment error', async () => {
      const mockError = new Error('Admin delete failed');
      api.delete.mockRejectedValue(mockError);

      await expect(deleteCommentAsAdmin(123)).rejects.toThrow('Admin delete failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different comment IDs for admin deletion', async () => {
      const mockResponse = { success: true };
      api.delete.mockResolvedValue({ data: mockResponse });

      await deleteCommentAsAdmin(789);

      expect(api.delete).toHaveBeenCalledWith('/api/comments/admin/789');
    });
  });

  describe('deleteComment vs deleteCommentAsAdmin', () => {
    it('should use same endpoint for both delete functions', async () => {
      const mockResponse = { success: true };
      api.delete.mockResolvedValue({ data: mockResponse });

      await deleteComment(123);
      await deleteCommentAsAdmin(123);

      expect(api.delete).toHaveBeenCalledTimes(2);
      expect(api.delete).toHaveBeenNthCalledWith(1, '/api/comments/admin/123');
      expect(api.delete).toHaveBeenNthCalledWith(2, '/api/comments/admin/123');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete comment workflow', async () => {
      // Mock responses for all operations
      const getResponse = { data: [] };
      const addResponse = { data: { id: 1, content: 'New comment', rating: 5 } };
      const deleteResponse = { data: { success: true } };

      api.get.mockResolvedValueOnce(getResponse);
      api.post.mockResolvedValueOnce(addResponse);
      api.delete.mockResolvedValueOnce(deleteResponse);

      // Test workflow
      const initialComments = await getComments(123);
      const newComment = await addOrUpdateComment(123, {
        content: 'New comment',
        rating: 5,
      });
      const deleteResult = await deleteComment(1);

      expect(initialComments).toEqual([]);
      expect(newComment).toEqual(addResponse.data);
      expect(deleteResult).toEqual(deleteResponse.data);
    });

    it('should handle comment update workflow', async () => {
      const getResponse = {
        data: [{ id: 1, content: 'Original comment', rating: 3 }],
      };
      const updateResponse = {
        data: { id: 1, content: 'Updated comment', rating: 5 },
      };

      api.get.mockResolvedValueOnce(getResponse);
      api.post.mockResolvedValueOnce(updateResponse);

      const comments = await getComments(123);
      const updatedComment = await addOrUpdateComment(123, {
        content: 'Updated comment',
        rating: 5,
      });

      expect(comments[0].content).toBe('Original comment');
      expect(updatedComment.content).toBe('Updated comment');
      expect(updatedComment.rating).toBe(5);
    });
  });
});
