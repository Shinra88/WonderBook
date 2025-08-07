import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import LoginModal from './Login_modal';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

// Mock du hook useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock de useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

// Mock de react-google-recaptcha
vi.mock('react-google-recaptcha', () => ({
  default: ({ onChange }) => (
    <div data-testid="recaptcha" onClick={() => onChange('mock-recaptcha-token')}>
      Mock ReCAPTCHA
    </div>
  ),
}));

// Mock des variables d'environnement
vi.mock(
  'import.meta',
  () => ({
    env: {
      VITE_RECAPTCHA_SITE_KEY: 'mock-site-key',
    },
  }),
  { virtual: true }
);

describe('LoginModal Component', () => {
  const mockLogin = vi.fn();
  const mockOnClose = vi.fn();
  const mockOpenRegister = vi.fn();
  const mockOpenForgetPassword = vi.fn();
  const mockT = vi.fn(key => key);

  const defaultProps = {
    onClose: mockOnClose,
    openRegister: mockOpenRegister,
    openForgetPassword: mockOpenForgetPassword,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers(); // S'assurer qu'on utilise les vrais timers par défaut

    // Configuration par défaut du mock useAuth
    useAuth.mockReturnValue({
      login: mockLogin,
    });

    // Configuration par défaut du mock useTranslation
    useTranslation.mockReturnValue({
      t: mockT,
    });
  });

  afterEach(async () => {
    // Attendre que tous les micro-tasks se terminent
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    cleanup();
    vi.restoreAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Rendu initial', () => {
    test('should render login modal correctly', () => {
      render(<LoginModal {...defaultProps} />);

      expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    test('should disable form inputs when recaptcha is not validated', () => {
      render(<LoginModal {...defaultProps} />);

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    test('should show captcha required message when recaptcha is not validated', () => {
      render(<LoginModal {...defaultProps} />);

      expect(screen.getByText('Login.CaptchaRequired')).toBeInTheDocument();
    });
  });

  describe('Validation ReCAPTCHA', () => {
    test('should enable form inputs after recaptcha validation', async () => {
      render(<LoginModal {...defaultProps} />);

      const recaptcha = screen.getByTestId('recaptcha');
      fireEvent.click(recaptcha);

      await waitFor(() => {
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText(/password/i);

        expect(emailInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
      });
    });

    test('should hide captcha required message after validation', async () => {
      render(<LoginModal {...defaultProps} />);

      const recaptcha = screen.getByTestId('recaptcha');
      fireEvent.click(recaptcha);

      await waitFor(() => {
        expect(screen.queryByText('Login.CaptchaRequired')).not.toBeInTheDocument();
      });
    });
  });

  describe('Gestion des formulaires', () => {
    test('should update email and password fields', async () => {
      render(<LoginModal {...defaultProps} />);

      // Valider le recaptcha d'abord
      const recaptcha = screen.getByTestId('recaptcha');
      fireEvent.click(recaptcha);

      await waitFor(() => {
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
      });
    });

    test('should disable login button when form is invalid', async () => {
      render(<LoginModal {...defaultProps} />);

      const loginButton = screen.getByRole('button', { name: /Login.Validate/i });
      expect(loginButton).toBeDisabled();
    });

    test('should enable login button when form is valid', async () => {
      render(<LoginModal {...defaultProps} />);

      // Valider le recaptcha
      const recaptcha = screen.getByTestId('recaptcha');
      fireEvent.click(recaptcha);

      await waitFor(() => {
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /Login.Validate/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(loginButton).not.toBeDisabled();
      });
    });
  });

  describe('Protection anti-bot (Honeypot)', () => {
    test('should prevent login when honeypot is filled', async () => {
      const { container } = render(<LoginModal {...defaultProps} />);

      // Valider le recaptcha
      const recaptcha = screen.getByTestId('recaptcha');
      fireEvent.click(recaptcha);

      await waitFor(() => {
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText(/password/i);
        // Utiliser querySelector pour trouver le champ honeypot par son name
        const honeypotInput = container.querySelector('input[name="website"]');
        const loginButton = screen.getByRole('button', { name: /Login.Validate/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(honeypotInput, { target: { value: 'bot-content' } });

        // Le bouton devrait être désactivé quand le honeypot est rempli
        expect(loginButton).toBeDisabled();
      });
    });
  });

  describe('Processus de connexion', () => {
    test('should handle successful login', async () => {
      mockLogin.mockResolvedValueOnce({ success: true, user: { name: 'John Doe' } });

      render(<LoginModal {...defaultProps} />);

      // Valider le recaptcha
      const recaptcha = screen.getByTestId('recaptcha');
      await act(async () => {
        fireEvent.click(recaptcha);
      });

      // Remplir le formulaire et soumettre
      await act(async () => {
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /Login.Validate/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        fireEvent.click(loginButton);
      });

      // Attendre que toutes les promesses se résolvent
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          'mock-recaptcha-token'
        );
      });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('should handle login failure', async () => {
      mockLogin.mockResolvedValueOnce({ success: false, error: 'Invalid credentials' });

      // Mock alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<LoginModal {...defaultProps} />);

      // Valider le recaptcha
      const recaptcha = screen.getByTestId('recaptcha');
      await act(async () => {
        fireEvent.click(recaptcha);
      });

      // Remplir et soumettre le formulaire
      await act(async () => {
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /Login.Validate/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        fireEvent.click(loginButton);
      });

      // Attendre que toutes les promesses se résolvent
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          'mock-recaptcha-token'
        );
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Invalid credentials');
        expect(mockOnClose).not.toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });

    test('should show loading state during login', async () => {
      // Utiliser les vrais timers pour cette promesse spécifique
      let resolveLogin;
      mockLogin.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveLogin = () => resolve({ success: true });
          })
      );

      render(<LoginModal {...defaultProps} />);

      // Valider le recaptcha
      const recaptcha = screen.getByTestId('recaptcha');
      await act(async () => {
        fireEvent.click(recaptcha);
      });

      // Remplir et soumettre le formulaire
      await act(async () => {
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /Login.Validate/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        fireEvent.click(loginButton);
      });

      // Vérifier l'état de chargement
      await waitFor(() => {
        expect(screen.getByText('Login.Loading')).toBeInTheDocument();
      });

      // Résoudre la promesse et attendre la fin
      await act(async () => {
        resolveLogin();
      });

      // Attendre que le loading disparaisse
      await waitFor(() => {
        expect(screen.queryByText('Login.Loading')).not.toBeInTheDocument();
      });
    });

    test('should prevent login without recaptcha', () => {
      render(<LoginModal {...defaultProps} />);

      // Essayer de se connecter sans valider le recaptcha
      const loginButton = screen.getByRole('button', { name: /Login.Validate/i });

      // Le bouton doit être désactivé si pas de recaptcha
      expect(loginButton).toBeDisabled();

      // Si on force le clic, ça devrait afficher l'alerte
      fireEvent.click(loginButton);

      // Dans ce cas, l'alerte ne sera pas appelée car le bouton est disabled
      // mais on peut tester que le login n'est pas appelé
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('Navigation entre modales', () => {
    test('should open register modal', () => {
      render(<LoginModal {...defaultProps} />);

      const registerButton = screen.getByRole('button', { name: /Login.CreateAccount/i });
      fireEvent.click(registerButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOpenRegister).toHaveBeenCalled();
    });

    test('should open forgot password modal', () => {
      render(<LoginModal {...defaultProps} />);

      const forgotButton = screen.getByRole('button', { name: /Login.ForgotPassword/i });
      fireEvent.click(forgotButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOpenForgetPassword).toHaveBeenCalled();
    });

    test('should close modal when cancel is clicked', () => {
      render(<LoginModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Login.Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('should close modal when clicking outside', () => {
      render(<LoginModal {...defaultProps} />);

      const modalBackground = screen.getByRole('presentation');
      fireEvent.click(modalBackground);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Gestion clavier', () => {
    test('should close modal on Escape key', () => {
      render(<LoginModal {...defaultProps} />);

      // Simuler la pression de la touche Escape
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
