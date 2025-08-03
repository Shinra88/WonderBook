// 📁 __tests__/services/topicsService.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTopics,
  addTopic,
  getTopicById,
  updateTopicNotice,
  deleteTopic,
  toggleTopicLock
} from './topicsService';

// Mock de l'API
vi.mock('./api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock des constantes
vi.mock('../utils/constants', () => ({
  API_ROUTES: {
    FORUM: {
      BASE: '/api/forum',
      ADD_TOPIC: '/api/forum/add',
      UPDATE_NOTICE: (id) => `/api/forum/${id}/notice`,
      LOCK_TOPIC: (id) => `/api/forum/${id}/lock`
    }
  }
}));

import api from './api/api';

describe('topicsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTopics', () => {
    it('should get all topics successfully', async () => {
      const mockTopics = [
        { id: 1, title: 'Topic 1', content: 'Content 1', notice: false },
        { id: 2, title: 'Topic 2', content: 'Content 2', notice: true }
      ];
      api.get.mockResolvedValue({ data: mockTopics });

      const result = await getTopics();

      expect(api.get).toHaveBeenCalledWith('/api/forum');
      expect(result).toEqual(mockTopics);
    });

    it('should handle get topics error', async () => {
      const mockError = new Error('Topics fetch failed');
      api.get.mockRejectedValue(mockError);

      await expect(getTopics()).rejects.toThrow('Topics fetch failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle empty topics response', async () => {
      api.get.mockResolvedValue({ data: [] });

      const result = await getTopics();

      expect(result).toEqual([]);
    });
  });

  describe('addTopic', () => {
    const mockToken = 'test-token-123';

    it('should add topic with all parameters', async () => {
      const mockResponse = {
        id: 1,
        title: 'New Topic',
        content: 'Topic content',
        notice: true,
        userId: 1
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const topicData = {
        title: 'New Topic',
        content: 'Topic content',
        recaptchaToken: 'recaptcha-123',
        notice: true
      };

      const result = await addTopic(topicData, mockToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/forum/add',
        {
          title: 'New Topic',
          content: 'Topic content',
          recaptchaToken: 'recaptcha-123',
          notice: true
        },
        {
          headers: {
            Authorization: 'Bearer test-token-123'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should add topic without notice', async () => {
      const mockResponse = { id: 1, title: 'Topic', notice: false };
      api.post.mockResolvedValue({ data: mockResponse });

      const topicData = {
        title: 'Simple Topic',
        content: 'Simple content',
        recaptchaToken: 'recaptcha-456'
      };

      await addTopic(topicData, mockToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/forum/add',
        {
          title: 'Simple Topic',
          content: 'Simple content',
          recaptchaToken: 'recaptcha-456',
          notice: undefined
        },
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token-123' }
        })
      );
    });

    it('should handle add topic error', async () => {
      const mockError = new Error('Add topic failed');
      api.post.mockRejectedValue(mockError);

      const topicData = {
        title: 'Test Topic',
        content: 'Test content',
        recaptchaToken: 'token'
      };

      await expect(addTopic(topicData, mockToken)).rejects.toThrow('Add topic failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different tokens', async () => {
      const mockResponse = { id: 1 };
      api.post.mockResolvedValue({ data: mockResponse });

      const topicData = {
        title: 'Topic',
        content: 'Content',
        recaptchaToken: 'token'
      };
      const differentToken = 'admin-token-456';

      await addTopic(topicData, differentToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/forum/add',
        expect.anything(),
        {
          headers: {
            Authorization: 'Bearer admin-token-456'
          }
        }
      );
    });

    it('should handle long content', async () => {
      const mockResponse = { id: 1 };
      api.post.mockResolvedValue({ data: mockResponse });

      const longContent = 'A'.repeat(2000);
      const topicData = {
        title: 'Long Topic',
        content: longContent,
        recaptchaToken: 'token'
      };

      await addTopic(topicData, mockToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/forum/add',
        expect.objectContaining({
          content: longContent
        }),
        expect.anything()
      );
    });
  });

  describe('getTopicById', () => {
    it('should get topic by ID successfully', async () => {
      const mockTopic = {
        id: 123,
        title: 'Topic Title',
        content: 'Topic content',
        posts: []
      };
      api.get.mockResolvedValue({ data: mockTopic });

      const result = await getTopicById(123);

      expect(api.get).toHaveBeenCalledWith('/api/forum/123');
      expect(result).toEqual(mockTopic);
    });

    it('should handle get topic by ID error', async () => {
      const mockError = new Error('Topic not found');
      api.get.mockRejectedValue(mockError);

      await expect(getTopicById(999)).rejects.toThrow('Topic not found');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different topic IDs', async () => {
      const mockTopic = { id: 456, title: 'Another Topic' };
      api.get.mockResolvedValue({ data: mockTopic });

      await getTopicById(456);

      expect(api.get).toHaveBeenCalledWith('/api/forum/456');
    });

    it('should handle string topic ID', async () => {
      const mockTopic = { id: '789', title: 'String ID Topic' };
      api.get.mockResolvedValue({ data: mockTopic });

      await getTopicById('789');

      expect(api.get).toHaveBeenCalledWith('/api/forum/789');
    });
  });

  describe('updateTopicNotice', () => {
    const mockToken = 'test-token-123';

    it('should update topic notice successfully', async () => {
      const mockResponse = { id: 123, notice: true, message: 'Notice updated' };
      api.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateTopicNotice(123, mockToken);

      expect(api.patch).toHaveBeenCalledWith(
        '/api/forum/123/notice',
        {},
        {
          headers: {
            Authorization: 'Bearer test-token-123'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle update notice error', async () => {
      const mockError = new Error('Update notice failed');
      api.patch.mockRejectedValue(mockError);

      await expect(updateTopicNotice(123, mockToken)).rejects.toThrow('Update notice failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different topic IDs for notice update', async () => {
      const mockResponse = { id: 456, notice: false };
      api.patch.mockResolvedValue({ data: mockResponse });

      await updateTopicNotice(456, mockToken);

      expect(api.patch).toHaveBeenCalledWith('/api/forum/456/notice', {}, expect.anything());
    });

    it('should handle different tokens for notice update', async () => {
      const mockResponse = { success: true };
      api.patch.mockResolvedValue({ data: mockResponse });

      const adminToken = 'admin-token-789';
      await updateTopicNotice(123, adminToken);

      expect(api.patch).toHaveBeenCalledWith(
        '/api/forum/123/notice',
        {},
        {
          headers: {
            Authorization: 'Bearer admin-token-789'
          }
        }
      );
    });
  });

  describe('deleteTopic', () => {
    const mockToken = 'test-token-123';

    it('should delete topic successfully', async () => {
      const mockResponse = { success: true, message: 'Topic deleted' };
      api.delete.mockResolvedValue({ data: mockResponse });

      const result = await deleteTopic(123, mockToken);

      expect(api.delete).toHaveBeenCalledWith('/api/forum/123', {
        headers: {
          Authorization: 'Bearer test-token-123'
        }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle delete topic error', async () => {
      const mockError = new Error('Delete failed');
      api.delete.mockRejectedValue(mockError);

      await expect(deleteTopic(123, mockToken)).rejects.toThrow('Delete failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different topic IDs for deletion', async () => {
      const mockResponse = { success: true };
      api.delete.mockResolvedValue({ data: mockResponse });

      await deleteTopic(789, mockToken);

      expect(api.delete).toHaveBeenCalledWith('/api/forum/789', {
        headers: { Authorization: 'Bearer test-token-123' }
      });
    });

    it('should handle different tokens for deletion', async () => {
      const mockResponse = { success: true };
      api.delete.mockResolvedValue({ data: mockResponse });

      const moderatorToken = 'mod-token-456';
      await deleteTopic(123, moderatorToken);

      expect(api.delete).toHaveBeenCalledWith('/api/forum/123', {
        headers: { Authorization: 'Bearer mod-token-456' }
      });
    });
  });

  describe('toggleTopicLock', () => {
    const mockToken = 'test-token-123';

    it('should toggle topic lock successfully', async () => {
      const mockResponse = { id: 123, locked: true, message: 'Topic locked' };
      api.patch.mockResolvedValue({ data: mockResponse });

      const result = await toggleTopicLock(123, mockToken);

      expect(api.patch).toHaveBeenCalledWith(
        '/api/forum/123/lock',
        {},
        {
          headers: {
            Authorization: 'Bearer test-token-123'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle toggle lock error', async () => {
      const mockError = new Error('Toggle lock failed');
      api.patch.mockRejectedValue(mockError);

      await expect(toggleTopicLock(123, mockToken)).rejects.toThrow('Toggle lock failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle different topic IDs for lock toggle', async () => {
      const mockResponse = { id: 456, locked: false };
      api.patch.mockResolvedValue({ data: mockResponse });

      await toggleTopicLock(456, mockToken);

      expect(api.patch).toHaveBeenCalledWith('/api/forum/456/lock', {}, expect.anything());
    });

    it('should handle different tokens for lock toggle', async () => {
      const mockResponse = { success: true };
      api.patch.mockResolvedValue({ data: mockResponse });

      const adminToken = 'admin-token-999';
      await toggleTopicLock(123, adminToken);

      expect(api.patch).toHaveBeenCalledWith(
        '/api/forum/123/lock',
        {},
        {
          headers: {
            Authorization: 'Bearer admin-token-999'
          }
        }
      );
    });
  });

  describe('Integration tests', () => {
    it('should handle complete topic management workflow', async () => {
      const mockToken = 'workflow-token';
      
      // Mock responses for all operations
      const getTopicsResponse = { data: [] };
      const addTopicResponse = { 
        data: { id: 1, title: 'New Topic', notice: false, locked: false } 
      };
      const getTopicResponse = { 
        data: { id: 1, title: 'New Topic', posts: [] } 
      };
      const updateNoticeResponse = { data: { id: 1, notice: true } };
      const toggleLockResponse = { data: { id: 1, locked: true } };
      const deleteResponse = { data: { success: true } };

      api.get.mockResolvedValueOnce(getTopicsResponse);
      api.post.mockResolvedValueOnce(addTopicResponse);
      api.get.mockResolvedValueOnce(getTopicResponse);
      api.patch.mockResolvedValueOnce(updateNoticeResponse);
      api.patch.mockResolvedValueOnce(toggleLockResponse);
      api.delete.mockResolvedValueOnce(deleteResponse);

      // Test workflow
      const topics = await getTopics();
      const newTopic = await addTopic({
        title: 'New Topic',
        content: 'Topic content',
        recaptchaToken: 'token'
      }, mockToken);
      const topicDetails = await getTopicById(1);
      const noticeUpdate = await updateTopicNotice(1, mockToken);
      const lockToggle = await toggleTopicLock(1, mockToken);
      const deleteResult = await deleteTopic(1, mockToken);

      expect(topics).toEqual([]);
      expect(newTopic.id).toBe(1);
      expect(topicDetails.id).toBe(1);
      expect(noticeUpdate.notice).toBe(true);
      expect(lockToggle.locked).toBe(true);
      expect(deleteResult.success).toBe(true);
    });

    it('should handle topic with special characters', async () => {
      const mockToken = 'test-token';
      const mockResponse = { data: { id: 1 } };
      api.post.mockResolvedValue(mockResponse);

      const specialTitle = 'Tópic with émojis 🎉 and "quotes"!';
      const specialContent = 'Content with <HTML> & symbols';
      
      const topicData = {
        title: specialTitle,
        content: specialContent,
        recaptchaToken: 'token'
      };

      await addTopic(topicData, mockToken);

      expect(api.post).toHaveBeenCalledWith(
        '/api/forum/add',
        expect.objectContaining({
          title: specialTitle,
          content: specialContent
        }),
        expect.anything()
      );
    });
  });
});