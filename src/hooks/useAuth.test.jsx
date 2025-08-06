// src/hooks/useAuth.test.jsx - VERSION SÉCURISÉE ET CORRECTE

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useAuth, AuthProvider } from './useAuth';

// ✅ Mock fetch global
global.fetch = vi.fn();

// ✅ Composant de test simple
function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="user-status">
        {isAuthenticated ? `Logged in: ${user?.name}` : 'Not logged in'}
      </div>
      <div data-testid="user-data">{user ? JSON.stringify(user) : 'No user'}</div>
      <button data-testid="login-btn" onClick={() => login({ name: 'John Doe' }, 'test-token')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

function renderWithAuth(component) {
  return render(<AuthProvider>{component}</AuthProvider>);
}

describe('useAuth Hook - VERSION SÉCURISÉE', () => {
  beforeEach(() => {
    fetch.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    fetch.mockRestore?.();
  });

  describe('Initialisation sécurisée', () => {
    it('should check auth status via API on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'John Doe', userId: 1, mail: 'john@test.com' }),
      });

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
      });
    });

    it('should handle failed auth check', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 401 });

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });

    it('should handle API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });
  });

  describe('Fonction login locale (sans fetch)', () => {
    it('should login user without API call', async () => {
      fetch.mockResolvedValueOnce({ ok: false }); // Auth check échoue

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });

      screen.getByTestId('login-btn').click();

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
      });

      // ✅ fetch n’est pas appelé pour le login
      expect(fetch).not.toHaveBeenCalledWith('/api/auth/login', expect.anything());
    });
  });

  describe('Fonction logout sécurisée', () => {
    it('should logout user and call API', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ name: 'John Doe' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Déconnexion réussie' }),
        });

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
      });

      screen.getByTestId('logout-btn').click();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });
  });

  describe('Register function', () => {
    it('should register user via API', async () => {
      fetch
        .mockResolvedValueOnce({ ok: false }) // Initial auth check
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            user: { name: 'New User', userId: 3 },
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const registerResult = await result.current.register(
        'newuser',
        'new@test.com',
        'Password123!',
        'captcha-token'
      );

      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: 'newuser',
          mail: 'new@test.com',
          password: 'Password123!',
          recaptchaToken: 'captcha-token',
          website: '',
        }),
      });

      expect(registerResult.success).toBe(true);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile via API', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ name: 'John Doe' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { name: 'John Updated', userId: 1 },
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
      });

      const updateResult = await result.current.updateUserProfile({
        name: 'John Updated',
        mail: 'john@test.com',
      });

      expect(fetch).toHaveBeenCalledWith('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: 'John Updated',
          mail: 'john@test.com',
          repForum: 0,
          addCom: 0,
          addBook: 0,
          news: 0,
        }),
      });

      expect(updateResult.success).toBe(true);
    });
  });

  describe('changePassword', () => {
    it('should change password via API', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ name: 'John Doe' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Password changed' }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
      });

      const resultChange = await result.current.changePassword('oldPass', 'newPass');

      expect(fetch).toHaveBeenCalledWith('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          oldPassword: 'oldPass',
          newPassword: 'newPass',
        }),
      });

      expect(resultChange.success).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle malformed API response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });

    it('should handle timeout/network errors', async () => {
      fetch.mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 50))
      );

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });

    it('should handle server error (500)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      });

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });
  });
});
