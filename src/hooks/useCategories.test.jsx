// 📁 __tests__/hooks/useCategories.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock de l'API
vi.mock('../services/api/api', () => ({
  default: {
    get: vi.fn()
  }
}));

import useCategories from './useCategories';
import api from '../services/api/api';

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    api.get.mockResolvedValue({ data: [] });
    
    const { result } = renderHook(() => useCategories());
    
    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch and format categories successfully', async () => {
    const mockApiResponse = {
      data: [
        { categoryId: 1, name: 'Fiction' },
        { categoryId: 2, name: 'Science' },
        { categoryId: 3, name: 'History' }
      ]
    };
    
    const expectedCategories = [
      { id: 1, name: 'Fiction' },
      { id: 2, name: 'Science' },
      { id: 3, name: 'History' }
    ];
    
    api.get.mockResolvedValue(mockApiResponse);
    
    const { result } = renderHook(() => useCategories());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.categories).toEqual(expectedCategories);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/categories');
  });

  it('should handle empty categories response', async () => {
    api.get.mockResolvedValue({ data: [] });
    
    const { result } = renderHook(() => useCategories());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle API error', async () => {
    const mockError = new Error('Network error');
    api.get.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useCategories());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockError);
    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la récupération des catégories :',
      mockError
    );
  });

  it('should handle malformed API response', async () => {
    const mockApiResponse = {
      data: [
        { categoryId: 1 }, // Missing name
        { name: 'Science' }, // Missing categoryId
        { categoryId: 3, name: 'History' } // Valid
      ]
    };
    
    api.get.mockResolvedValue(mockApiResponse);
    
    const { result } = renderHook(() => useCategories());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Le hook devrait gérer les données malformées
    expect(result.current.categories).toEqual([
      { id: 1, name: undefined },
      { id: undefined, name: 'Science' },
      { id: 3, name: 'History' }
    ]);
  });
});