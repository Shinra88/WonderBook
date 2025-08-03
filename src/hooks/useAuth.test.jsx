import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth';

// Mock de localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Composant de test pour utiliser le hook
function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="user-status">
        {isAuthenticated ? `Logged in: ${user?.name}` : 'Not logged in'}
      </div>
      <div data-testid="user-data">{user ? JSON.stringify(user) : 'No user'}</div>
      <button
        data-testid="login-btn"
        onClick={() => login({ name: 'John Doe', email: 'john@test.com' }, 'test-token')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
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
    // Reset localStorage mocks
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();

    // Mock Date.now pour contrôler le temps
    vi.spyOn(Date, 'now').mockReturnValue(1000000000); // Timestamp fixe
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendu initial', () => {
    test('should render AuthProvider without crashing', () => {
      renderWithAuth(<TestComponent />);

      expect(screen.getByTestId('user-status')).toBeInTheDocument();
    });

    test('should start with no authenticated user', () => {
      renderWithAuth(<TestComponent />);

      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      expect(screen.getByTestId('user-data')).toHaveTextContent('No user');
    });
  });

  describe('Restauration depuis localStorage', () => {
    test('should restore valid user from localStorage', () => {
      const mockUser = { name: 'John Doe', email: 'john@test.com' };
      const validExpiry = (Date.now() + 1000000).toString(); // Future

      mockLocalStorage.getItem.mockImplementation(key => {
        switch (key) {
          case 'token':
            return 'stored-token';
          case 'token_expiry':
            return validExpiry;
          case 'user':
            return JSON.stringify(mockUser);
          default:
            return null;
        }
      });

      renderWithAuth(<TestComponent />);

      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
    });

    test('should logout if token is expired', () => {
      const mockUser = { name: 'John Doe', email: 'john@test.com' };
      const expiredExpiry = (Date.now() - 1000).toString(); // Past

      mockLocalStorage.getItem.mockImplementation(key => {
        switch (key) {
          case 'token':
            return 'expired-token';
          case 'token_expiry':
            return expiredExpiry;
          case 'user':
            return JSON.stringify(mockUser);
          default:
            return null;
        }
      });

      renderWithAuth(<TestComponent />);

      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token_expiry');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('should logout if no token in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      renderWithAuth(<TestComponent />);

      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('Fonction login', () => {
    test('should login user and store in localStorage', () => {
      renderWithAuth(<TestComponent />);

      const loginBtn = screen.getByTestId('login-btn');
      act(() => {
        fireEvent.click(loginBtn);
      });

      // Vérifier que l'utilisateur est connecté
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');

      // Vérifier les appels localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token_expiry', expect.any(String));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          name: 'John Doe',
          email: 'john@test.com',
        })
      );
    });

    test('should set correct token expiry (3 hours)', () => {
      renderWithAuth(<TestComponent />);

      const loginBtn = screen.getByTestId('login-btn');
      act(() => {
        fireEvent.click(loginBtn);
      });

      // Vérifier que l'expiry est 3h dans le futur
      const expectedExpiry = (Date.now() + 3 * 60 * 60 * 1000).toString();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token_expiry', expectedExpiry);
    });

    test('should include token in user object', () => {
      renderWithAuth(<TestComponent />);

      const loginBtn = screen.getByTestId('login-btn');
      act(() => {
        fireEvent.click(loginBtn);
      });

      const userData = screen.getByTestId('user-data').textContent;
      const userObj = JSON.parse(userData);

      expect(userObj).toEqual({
        name: 'John Doe',
        email: 'john@test.com',
        token: 'test-token',
      });
    });
  });

  describe('Fonction logout', () => {
    test('should logout user and clear localStorage', () => {
      // D'abord se connecter
      renderWithAuth(<TestComponent />);

      const loginBtn = screen.getByTestId('login-btn');
      act(() => {
        fireEvent.click(loginBtn);
      });

      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');

      // Puis se déconnecter
      const logoutBtn = screen.getByTestId('logout-btn');
      act(() => {
        fireEvent.click(logoutBtn);
      });

      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      expect(screen.getByTestId('user-data')).toHaveTextContent('No user');

      // Vérifier que localStorage est nettoyé
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token_expiry');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Propriété isAuthenticated', () => {
    test('should return false when not logged in', () => {
      renderWithAuth(<TestComponent />);

      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });

    test('should return true when logged in', () => {
      renderWithAuth(<TestComponent />);

      const loginBtn = screen.getByTestId('login-btn');
      act(() => {
        fireEvent.click(loginBtn);
      });

      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: John Doe');
    });
  });

  describe('Cas limites', () => {
    test('should handle missing user data in localStorage', () => {
      mockLocalStorage.getItem.mockImplementation(key => {
        switch (key) {
          case 'token':
            return 'valid-token';
          case 'token_expiry':
            return (Date.now() + 1000000).toString();
          case 'user':
            return null; // Pas de données user
          default:
            return null;
        }
      });

      renderWithAuth(<TestComponent />);

      // Le composant accepte quand même avec token valide, même si user est null
      // JSON.parse(null) retourne null, et {...null, token} donne {token}
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in: undefined');
    });

    test('should handle invalid expiry format', () => {
      mockLocalStorage.getItem.mockImplementation(key => {
        switch (key) {
          case 'token':
            return 'valid-token';
          case 'token_expiry':
            return 'invalid-number';
          case 'user':
            return JSON.stringify({ name: 'Test' });
          default:
            return null;
        }
      });

      renderWithAuth(<TestComponent />);

      // Devrait se déconnecter car l'expiry est invalide
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });
  });
});
