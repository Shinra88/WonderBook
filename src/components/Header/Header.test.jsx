// src/components/Header/Header.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import Header from './Header';

const mockNavigate = vi.fn();

let mockUseAuth = {
  user: null,
  isAuthenticated: false,
  logout: vi.fn(),
};

const mockUseFilters = {
  setSearchQuery: vi.fn(),
  setSelectedCategories: vi.fn(),
  setSelectedYear: vi.fn(),
  selectedCategories: [],
  selectedYear: '',
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}));

vi.mock('../../hooks/filterContext', () => ({
  useFilters: () => mockUseFilters,
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  </BrowserRouter>
);

const renderHeader = () => render(<Header />, { wrapper: TestWrapper });

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('fr');

    mockUseAuth = {
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers(); // assure que tous les timers sont restaurés
    vi.clearAllTimers(); // évite les setTimeout encore en attente
  });

  describe('Rendering', () => {
    it('should render logo and navigation links', () => {
      renderHeader();

      expect(screen.getByAltText(/logo wonderbook/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /accueil|home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /forum/i })).toBeInTheDocument();
    });

    it('should show search bar on home page', () => {
      renderHeader();
      expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
    });

    it('should show login and register buttons when not authenticated', () => {
      renderHeader();

      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /inscription|register/i })).toBeInTheDocument();
    });

    it('should show user menu when authenticated', async () => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { name: 'John Doe', avatar: 'avatar.png' };

      renderHeader();

      expect(await screen.findByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByAltText(/avatar utilisateur/i)).toBeInTheDocument();
    });

    it('should show admin link for admin users', async () => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { name: 'Admin', role: 'admin' };

      renderHeader();

      expect(await screen.findByRole('link', { name: /admin/i })).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should update search query on input change', () => {
      renderHeader();

      const input = screen.getByPlaceholderText(/rechercher/i);
      fireEvent.change(input, { target: { value: 'test book' } });

      expect(input.value).toBe('test book');
    });

    it('should trigger search on enter key press', async () => {
      renderHeader();

      const input = screen.getByPlaceholderText(/rechercher/i);
      fireEvent.change(input, { target: { value: 'search term' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockUseFilters.setSearchQuery).toHaveBeenCalledWith('search term');
      });
    });

    it('should trigger search on button click', async () => {
      renderHeader();

      const input = screen.getByPlaceholderText(/rechercher/i);
      fireEvent.change(input, { target: { value: 'click search' } });

      const button = screen.getByRole('button', { name: /rechercher|search/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockUseFilters.setSearchQuery).toHaveBeenCalledWith('click search');
      });
    });
  });

  describe('User interactions', () => {
    beforeEach(() => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { name: 'Test User', avatar: 'test.jpg' };
    });

    it('should show dropdown on hover', async () => {
      renderHeader();

      const userCircle = screen.getByAltText(/avatar utilisateur/i).parentElement;
      fireEvent.mouseEnter(userCircle);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /profil/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /déconnexion/i })).toBeInTheDocument();
      });
    });

    it('should navigate to account page on profile click', async () => {
      renderHeader();

      const userCircle = screen.getByAltText(/avatar utilisateur/i).parentElement;
      fireEvent.mouseEnter(userCircle);

      const profilButton = await screen.findByRole('button', { name: /profil/i });
      fireEvent.click(profilButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/Account');
      });
    });

    it('should logout user', async () => {
      renderHeader();

      const userCircle = screen.getByAltText(/avatar utilisateur/i).parentElement;
      fireEvent.mouseEnter(userCircle);

      const logoutButton = await screen.findByRole('button', { name: /déconnexion/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockUseAuth.logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });
});
