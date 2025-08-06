import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth';

// Mock du module authService
vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  fetchAuthenticatedUser: vi.fn(),
}));

// Import des fonctions mockées
import { loginUser, logoutUser, fetchAuthenticatedUser } from '../services/authService';

// Mock de fetch global pour les autres endpoints
global.fetch = vi.fn();

// Composant de test pour utiliser le hook
function TestComponent() {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    updateUserProfile,
    changePassword,
    getAuthenticatedUser,
  } = useAuth();

  return (
    <div>
      <div data-testid="user-status">
        {isAuthenticated ? `Logged in: ${user?.name}` : 'Not logged in'}
      </div>
      <div data-testid="user-data">{user ? JSON.stringify(user) : 'No user'}</div>
      <button
        data-testid="login-btn"
        onClick={async () => {
          const result = await login('john@test.com', 'password123');
          if (!result.success) {
            console.error(result.error);
          }
        }}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button
        data-testid="register-btn"
        onClick={async () => {
          await register('Jane Doe', 'jane@test.com', 'password123', 'recaptcha-token');
        }}>
        Register
      </button>
      <button
        data-testid="update-profile-btn"
        onClick={async () => {
          await updateUserProfile({
            name: 'Updated Name',
            avatar: 'avatar.jpg',
            repForum: true,
            addCom: false,
            addBook: true,
            news: true,
          });
        }}>
        Update Profile
      </button>
      <button
        data-testid="change-password-btn"
        onClick={async () => {
          await changePassword('oldpass', 'newpass');
        }}>
        Change Password
      </button>
      <button
        data-testid="get-auth-user-btn"
        onClick={async () => {
          await getAuthenticatedUser();
        }}>
        Get Auth User
      </button>
    </div>
  );
}

// Helper pour render avec le provider
const renderWithAuth = component => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset des mocks
    fetchAuthenticatedUser.mockRejectedValue(new Error('Not authenticated'));
    global.fetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendu initial', () => {
    test('should render AuthProvider without crashing', async () => {
      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toBeInTheDocument();
      });
    });

    test('should start with no authenticated user', async () => {
      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
        expect(screen.getByTestId('user-data')).toHaveTextContent('No user');
      });
    });
  });

  describe("Vérification automatique de l'authentification", () => {
    test('should fetch authenticated user on mount when authenticated', async () => {
      const mockUser = { id: 1, name: 'John Doe', mail: 'john@test.com' };
      fetchAuthenticatedUser.mockResolvedValueOnce(mockUser);

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(fetchAuthenticatedUser).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
      });
    });

    test('should handle auth check failure gracefully', async () => {
      fetchAuthenticatedUser.mockRejectedValueOnce(new Error('Auth failed'));

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(fetchAuthenticatedUser).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });
  });

  describe('Fonction login', () => {
    test('should login user successfully', async () => {
      const mockUser = { id: 1, name: 'John Doe', mail: 'john@test.com' };
      loginUser.mockResolvedValueOnce({ user: mockUser });

      renderWithAuth(<TestComponent />);

      const loginBtn = screen.getByTestId('login-btn');

      await act(async () => {
        fireEvent.click(loginBtn);
      });

      await waitFor(() => {
        expect(loginUser).toHaveBeenCalledWith('john@test.com', 'password123');
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
      });
    });

    test('should handle login failure', async () => {
      loginUser.mockRejectedValueOnce(new Error('Invalid credentials'));

      renderWithAuth(<TestComponent />);

      const loginBtn = screen.getByTestId('login-btn');

      await act(async () => {
        fireEvent.click(loginBtn);
      });

      await waitFor(() => {
        expect(loginUser).toHaveBeenCalledWith('john@test.com', 'password123');
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });
  });

  describe('Fonction logout', () => {
    test('should logout user successfully', async () => {
      // D'abord se connecter
      const mockUser = { id: 1, name: 'John Doe', mail: 'john@test.com' };
      loginUser.mockResolvedValueOnce({ user: mockUser });
      logoutUser.mockResolvedValueOnce();

      renderWithAuth(<TestComponent />);

      // Login
      const loginBtn = screen.getByTestId('login-btn');
      await act(async () => {
        fireEvent.click(loginBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
      });

      // Logout
      const logoutBtn = screen.getByTestId('logout-btn');
      await act(async () => {
        fireEvent.click(logoutBtn);
      });

      await waitFor(() => {
        expect(logoutUser).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });

    test('should handle logout error gracefully', async () => {
      const mockUser = { id: 1, name: 'John Doe', mail: 'john@test.com' };
      loginUser.mockResolvedValueOnce({ user: mockUser });
      logoutUser.mockRejectedValueOnce(new Error('Logout failed'));

      renderWithAuth(<TestComponent />);

      // Login first
      const loginBtn = screen.getByTestId('login-btn');
      await act(async () => {
        fireEvent.click(loginBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
      });

      // Logout with error
      const logoutBtn = screen.getByTestId('logout-btn');
      await act(async () => {
        fireEvent.click(logoutBtn);
      });

      await waitFor(() => {
        expect(logoutUser).toHaveBeenCalledTimes(1);
        // User should still be cleared even if logout fails
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });
  });

  describe('Fonction register', () => {
    test('should register user successfully', async () => {
      const mockUser = { id: 2, name: 'Jane Doe', mail: 'jane@test.com' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      renderWithAuth(<TestComponent />);

      const registerBtn = screen.getByTestId('register-btn');

      await act(async () => {
        fireEvent.click(registerBtn);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: 'Jane Doe',
            mail: 'jane@test.com',
            password: 'password123',
            recaptchaToken: 'recaptcha-token',
            website: '',
          }),
        });
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: Jane Doe');
      });
    });

    test('should handle register failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      });

      renderWithAuth(<TestComponent />);

      const registerBtn = screen.getByTestId('register-btn');

      await act(async () => {
        fireEvent.click(registerBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });
  });

  describe('Fonction updateUserProfile', () => {
    test('should update user profile successfully', async () => {
      // Login first
      const mockUser = { id: 1, name: 'John Doe', mail: 'john@test.com' };
      loginUser.mockResolvedValueOnce({ user: mockUser });

      const updatedUser = { ...mockUser, name: 'Updated Name', avatar: 'avatar.jpg' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: updatedUser }),
      });

      renderWithAuth(<TestComponent />);

      // Login
      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
      });

      // Update profile
      await act(async () => {
        fireEvent.click(screen.getByTestId('update-profile-btn'));
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: 'Updated Name',
            avatar: 'avatar.jpg',
            repForum: 1,
            addCom: 0,
            addBook: 1,
            news: 1,
          }),
        });
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: Updated Name');
      });
    });
  });

  describe('Fonction changePassword', () => {
    test('should change password successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password changed successfully' }),
      });

      renderWithAuth(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('change-password-btn'));
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            oldPassword: 'oldpass',
            newPassword: 'newpass',
          }),
        });
      });
    });
  });

  describe('Fonction getAuthenticatedUser', () => {
    test('should get authenticated user successfully', async () => {
      const mockUser = { id: 1, name: 'John Doe', mail: 'john@test.com' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      renderWithAuth(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('get-auth-user-btn'));
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
      });
    });
  });

  describe('Propriété isAuthenticated', () => {
    test('should return false when not logged in', async () => {
      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });

    test('should return true when logged in', async () => {
      const mockUser = { id: 1, name: 'John Doe', mail: 'john@test.com' };
      loginUser.mockResolvedValueOnce({ user: mockUser });

      renderWithAuth(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
      });
    });
  });
});
