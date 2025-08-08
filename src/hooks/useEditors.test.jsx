// 📁 __tests__/hooks/useEditors.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock de l'API
vi.mock('../services/api/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import useEditors from './useEditors';
import api from '../services/api/api';

describe('useEditors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    api.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useEditors());

    expect(result.current.editors).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch and format editors successfully', async () => {
    const mockApiResponse = {
      data: [
        { publisherId: 1, name: 'Penguin Books' },
        { publisherId: 2, name: 'Random House' },
        { publisherId: 3, name: 'HarperCollins' },
      ],
    };

    const expectedEditors = [
      { id: 1, name: 'Penguin Books' },
      { id: 2, name: 'Random House' },
      { id: 3, name: 'HarperCollins' },
    ];

    api.get.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useEditors());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.editors).toEqual(expectedEditors);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/api/publishers');
  });

  it('should handle empty editors response', async () => {
    api.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useEditors());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.editors).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle API error', async () => {
    const mockError = new Error('Network error');
    api.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useEditors());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.editors).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockError);
    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la récupération des éditeurs :',
      mockError
    );
  });

  it('should handle malformed API response', async () => {
    const mockApiResponse = {
      data: [
        { publisherId: 1 }, // Missing name
        { name: 'Random House' }, // Missing publisherId
        { publisherId: 3, name: 'HarperCollins' }, // Valid
      ],
    };

    api.get.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useEditors());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.editors).toEqual([
      { id: 1, name: undefined },
      { id: undefined, name: 'Random House' },
      { id: 3, name: 'HarperCollins' },
    ]);
  });
});
