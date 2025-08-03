// 📁 __tests__/services/postService.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPostsByTopicId,
  addPost,
  deletePost
} from './postsService';

// Mock de l'API
vi.mock('./api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock des constantes
vi.mock('../utils/constants', () => ({
  API_ROUTES: {
    POSTS: {
      BASE: '/api/posts',
      GET_BY_TOPIC: (topicId) => `/api/posts/topic/${topicId}`
    }
  }
}));

import api from './api/api';

describe('postService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPostsByTopicId', () => {
    it('should get posts by topic ID successfully', async () => {
      const mockPosts = [
        { id: 1, content: 'First post', topicId: 123, userId: 1 },
        { id: 2, content: 'Second post', topicId: 123, userId: 2 }
      ];
      api.get.mockResolvedValue({ data: mockPosts });

      const result = await getPostsByTopicId(123);

      expect(api.get).toHaveBeenCalledWith('/api/posts/topic/123');
      expect(result).toEqual(mockPosts);
    });

    it('should handle get posts error', async () => {
      const mockError = new Error('Posts fetch failed');
      api.get.mockRejectedValue(mockError);

      await expect(getPostsByTopicId(123)).rejects.toThrow('Posts fetch failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different topic IDs', async () => {
      const mockPosts = [];
      api.get.mockResolvedValue({ data: mockPosts });

      await getPostsByTopicId(456);

      expect(api.get).toHaveBeenCalledWith('/api/posts/topic/456');
    });

    it('should handle empty posts response', async () => {
      api.get.mockResolvedValue({ data: [] });

      const result = await getPostsByTopicId(123);

      expect(result).toEqual([]);
    });

    it('should handle string topic ID', async () => {
      const mockPosts = [{ id: 1, content: 'Test' }];
      api.get.mockResolvedValue({ data: mockPosts });

      await getPostsByTopicId('789');

      expect(api.get).toHaveBeenCalledWith('/api/posts/topic/789');
    });
  });

  describe('addPost', () => {
    const mockToken = 'test-token-123';

    it('should add post successfully', async () => {
      const mockResponse = {
        id: 1,
        content: 'New post content',
        topicId: 123,
        userId: 1
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const postData = { topicId: 123, content: 'New post content' };
      const result = await addPost(postData, mockToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/posts/add',
        { topicId: 123, content: 'New post content' },
        {
          headers: {
            Authorization: 'Bearer test-token-123'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle add post error', async () => {
      const mockError = new Error('Add post failed');
      api.post.mockRejectedValue(mockError);

      const postData = { topicId: 123, content: 'Test content' };

      await expect(addPost(postData, mockToken)).rejects.toThrow('Add post failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different topic IDs for adding posts', async () => {
      const mockResponse = { id: 1, content: 'Test' };
      api.post.mockResolvedValue({ data: mockResponse });

      const postData = { topicId: 456, content: 'Different topic post' };
      await addPost(postData, mockToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/posts/add',
        { topicId: 456, content: 'Different topic post' },
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token-123' }
        })
      );
    });

    it('should handle empty content', async () => {
      const mockResponse = { id: 1 };
      api.post.mockResolvedValue({ data: mockResponse });

      const postData = { topicId: 123, content: '' };
      await addPost(postData, mockToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/posts/add',
        { topicId: 123, content: '' },
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token-123' }
        })
      );
    });

    it('should handle different tokens', async () => {
      const mockResponse = { id: 1 };
      api.post.mockResolvedValue({ data: mockResponse });

      const postData = { topicId: 123, content: 'Test' };
      const differentToken = 'different-token-456';

      await addPost(postData, differentToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/posts/add',
        expect.anything(),
        {
          headers: {
            Authorization: 'Bearer different-token-456'
          }
        }
      );
    });

    it('should handle long content', async () => {
      const mockResponse = { id: 1 };
      api.post.mockResolvedValue({ data: mockResponse });

      const longContent = 'A'.repeat(1000);
      const postData = { topicId: 123, content: longContent };

      await addPost(postData, mockToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/posts/add',
        { topicId: 123, content: longContent },
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token-123' }
        })
      );
    });
  });

  describe('deletePost', () => {
    const mockToken = 'test-token-123';

    it('should delete post successfully', async () => {
      const mockResponse = { success: true, message: 'Post deleted' };
      api.delete.mockResolvedValue({ data: mockResponse });

      const result = await deletePost(123, mockToken);

      expect(api.delete).toHaveBeenCalledWith('/api/posts/123', {
        headers: {
          Authorization: 'Bearer test-token-123'
        }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle delete post error', async () => {
      const mockError = new Error('Delete failed');
      api.delete.mockRejectedValue(mockError);

      await expect(deletePost(123, mockToken)).rejects.toThrow('Delete failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different post IDs for deletion', async () => {
      const mockResponse = { success: true };
      api.delete.mockResolvedValue({ data: mockResponse });

      await deletePost(456, mockToken);

      expect(api.delete).toHaveBeenCalledWith('/api/posts/456', {
        headers: {
          Authorization: 'Bearer test-token-123'
        }
      });
    });

    it('should handle different tokens for deletion', async () => {
      const mockResponse = { success: true };
      api.delete.mockResolvedValue({ data: mockResponse });

      const differentToken = 'admin-token-789';
      await deletePost(123, differentToken);

      expect(api.delete).toHaveBeenCalledWith('/api/posts/123', {
        headers: {
          Authorization: 'Bearer admin-token-789'
        }
      });
    });

    it('should handle string post ID', async () => {
      const mockResponse = { success: true };
      api.delete.mockResolvedValue({ data: mockResponse });

      await deletePost('789', mockToken);

      expect(api.delete).toHaveBeenCalledWith('/api/posts/789', {
        headers: {
          Authorization: 'Bearer test-token-123'
        }
      });
    });
  });

  describe('Integration tests', () => {
    it('should handle complete post workflow', async () => {
      const mockToken = 'workflow-token';
      
      // Mock responses for all operations
      const getResponse = { data: [] };
      const addResponse = { 
        data: { id: 1, content: 'New post', topicId: 123 } 
      };
      const deleteResponse = { data: { success: true } };

      api.get.mockResolvedValueOnce(getResponse);
      api.post.mockResolvedValueOnce(addResponse);
      api.delete.mockResolvedValueOnce(deleteResponse);

      // Test workflow
      const initialPosts = await getPostsByTopicId(123);
      const newPost = await addPost(
        { topicId: 123, content: 'New post' }, 
        mockToken
      );
      const deleteResult = await deletePost(1, mockToken);

      expect(initialPosts).toEqual([]);
      expect(newPost).toEqual(addResponse.data);
      expect(deleteResult).toEqual(deleteResponse.data);

      // Verify all API calls were made correctly
      expect(api.get).toHaveBeenCalledWith('/api/posts/topic/123');
      expect(api.post).toHaveBeenCalledWith(
        '/api/posts/add',
        { topicId: 123, content: 'New post' },
        { headers: { Authorization: 'Bearer workflow-token' } }
      );
      expect(api.delete).toHaveBeenCalledWith('/api/posts/1', {
        headers: { Authorization: 'Bearer workflow-token' }
      });
    });

    it('should handle posts with special characters', async () => {
      const mockToken = 'test-token';
      const mockResponse = { data: { id: 1 } };
      api.post.mockResolvedValue(mockResponse);

      const specialContent = 'Post with émojis 🎉 and "quotes" & symbols!';
      const postData = { topicId: 123, content: specialContent };

      await addPost(postData, mockToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/posts/add',
        { topicId: 123, content: specialContent },
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });
});