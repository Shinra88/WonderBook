// 📁 __tests__/hooks/useYears.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock de fetch
globalThis.fetch = vi.fn();
import { useYears } from './useYears';

describe('useYears', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default minYear', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ minYear: 1950 }),
    });

    const { result } = renderHook(() => useYears());

    expect(result.current.minYear).toBe(1900);
  });

  it('should fetch and update minYear successfully', async () => {
    const mockResponse = { minYear: 1950 };

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useYears());

    await waitFor(() => {
      expect(result.current.minYear).toBe(1950);
    });

    expect(fetch).toHaveBeenCalledWith('/api/books/minyear');
  });

  it('should keep default value when API returns no minYear', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useYears());

    // Attendre un délai pour s'assurer que l'appel s'est terminé
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.minYear).toBe(1900);
    expect(fetch).toHaveBeenCalledWith('/api/books/minyear');
  });

  it('should handle fetch error', async () => {
    fetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useYears());

    // Attendre un délai pour s'assurer que l'appel s'est terminé
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.minYear).toBe(1900);
    expect(console.error).toHaveBeenCalledWith('Erreur minYear :', expect.any(Error));
  });

  it('should handle invalid JSON response', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    const { result } = renderHook(() => useYears());

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.minYear).toBe(1900);
    expect(console.error).toHaveBeenCalledWith('Erreur minYear :', expect.any(Error));
  });

  it('should handle response with null minYear', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ minYear: null }),
    });

    const { result } = renderHook(() => useYears());

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.minYear).toBe(1900);
  });

  it('should handle response with zero minYear', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ minYear: 0 }),
    });

    const { result } = renderHook(() => useYears());

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.minYear).toBe(1900);
  });
});
