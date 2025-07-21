// src/components/Header/Header.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import Header from './Header';

const mockNavigate = vi.fn();
const mockUseAuth = {
  user: null,
  isAuthenticated: false,
  logout: vi.fn()
};
const mockUseFilters = {
  setSearchQuery: vi.fn(),
  setSelectedCategories: vi.fn(),
  setSelectedYear: vi.fn(),
  selectedCategories: [],
  selectedYear: ''
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' })
  };
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth
}));

vi.mock('../../hooks/filterContext', () => ({
  useFilters: () => mockUseFilters
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  </BrowserRouter>
);

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render logo and navigation', () => {
      render(<Header />, { wrapper: TestWrapper });
      
      expect(screen.getByAltText(/logo wonderbook/i)).toBeInTheDocument();
      expect(screen.getByText(/accueil/i)).toBeInTheDocument();
      expect(screen.getByText(/forum/i)).toBeInTheDocument();
    });

    it('should show search bar on home page', () => {
      render(<Header />, { wrapper: TestWrapper });
      
      expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
    });

    it('should show login buttons when not authenticated', () => {
      render(<Header />, { wrapper: TestWrapper });
      
      expect(screen.getByRole('button', { name: /connexion/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /inscription/i })).toBeInTheDocument();
    });

    it('should show user menu when authenticated', () => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { name: 'John Doe', avatar: 'avatar.png' };
      
      render(<Header />, { wrapper: TestWrapper });
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByAltText(/avatar utilisateur/i)).toBeInTheDocument();
    });

    it('should show admin link for admin users', () => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { name: 'Admin', role: 'admin' };
      
      render(<Header />, { wrapper: TestWrapper });
      
      expect(screen.getByText(/admin/i)).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should update search query on input change', () => {
      render(<Header />, { wrapper: TestWrapper });
      
      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      fireEvent.change(searchInput, { target: { value: 'test book' } });
      
      expect(searchInput.value).toBe('test book');
    });

    it('should trigger search on enter key press', async () => {
      render(<Header />, { wrapper: TestWrapper });
      
      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(mockUseFilters.setSearchQuery).toHaveBeenCalledWith('test search');
      });
    });

    it('should trigger search on button click', async () => {
      render(<Header />, { wrapper: TestWrapper });
      
      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      const searchButton = searchInput.nextElementSibling;
      
      fireEvent.change(searchInput, { target: { value: 'button search' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(mockUseFilters.setSearchQuery).toHaveBeenCalledWith('button search');
      });
    });
  });

  describe('User interactions', () => {
    beforeEach(() => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { name: 'Test User', avatar: 'test.jpg' };
    });

    it('should show dropdown on hover', async () => {
      render(<Header />, { wrapper: TestWrapper });
      
      const userCircle = screen.getByAltText(/avatar utilisateur/i).parentElement;
      fireEvent.mouseEnter(userCircle);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /profil/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /déconnexion/i })).toBeInTheDocument();
      });
    });

    it('should navigate to account page', async () => {
      render(<Header />, { wrapper: TestWrapper });
      
      const userCircle = screen.getByAltText(/avatar utilisateur/i).parentElement;
      fireEvent.mouseEnter(userCircle);
      
      const profilButton = await screen.findByRole('button', { name: /profil/i });
      fireEvent.click(profilButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/Account');
    });

    it('should logout user', async () => {
      render(<Header />, { wrapper: TestWrapper });
      
      const userCircle = screen.getByAltText(/avatar utilisateur/i).parentElement;
      fireEvent.mouseEnter(userCircle);
      
      const logoutButton = await screen.findByRole('button', { name: /déconnexion/i });
      fireEvent.click(logoutButton);
      
      expect(mockUseAuth.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Modal management', () => {
    it('should open login modal', () => {
      render(<Header />, { wrapper: TestWrapper });
      
      const loginButton = screen.getByRole('button', { name: /connexion/i });
      fireEvent.click(loginButton);    });

    it('should open register modal', () => {
      render(<Header />, { wrapper: TestWrapper });
      
      const registerButton = screen.getByRole('button', { name: /inscription/i });
      fireEvent.click(registerButton);
      
    });

    it('should open add book modal for authenticated users', () => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { name: 'Test User' };
      
      render(<Header />, { wrapper: TestWrapper });
      
      const addBookButton = screen.getByRole('button', { name: /ajouter un livre/i });
      fireEvent.click(addBookButton);

    });
  });
});