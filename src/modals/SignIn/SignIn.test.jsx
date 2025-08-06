// src/modals/SignIn/SignIn.test.jsx - VERSION SÉCURISÉE
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import SignIn from './SignIn';

// ✅ CHANGEMENT : Mock useAuth au lieu d'authService
const mockRegister = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

// Mock react-router-dom (inchangé)
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock ToastSuccess (inchangé)
vi.mock('../../components/ToastSuccess/ToastSuccess', () => ({
  default: ({ message }) => <div data-testid="toast">{message}</div>,
}));

// Mock ReCAPTCHA (inchangé)
vi.mock('react-google-recaptcha', () => ({
  default: ({ onChange }) => (
    <div data-testid="recaptcha">
      <button onClick={() => onChange('fake-token')}>Verify</button>
    </div>
  ),
}));

// Mock i18n (inchangé)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

// ✅ SUPPRIMÉ : Plus d'import d'authService
// import { register } from '../../services/authService';

describe('SignIn Component', () => {
  const mockOnClose = vi.fn();
  const mockOpenLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(import.meta, 'env', {
      value: { VITE_RECAPTCHA_SITE_KEY: 'test-key' },
      writable: true,
    });
  });

  test('should render form elements', () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(document.getElementById('username')).toBeInTheDocument();
    expect(document.getElementById('email')).toBeInTheDocument();
    expect(document.getElementById('password')).toBeInTheDocument();
    expect(document.getElementById('confirmPassword')).toBeInTheDocument();
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /validate/i })).toBeInTheDocument();
  });

  test('should handle username input', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    const usernameInput = document.getElementById('username');

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    });

    expect(usernameInput.value).toBe('testuser');
  });

  test('should handle email input', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    const emailInput = document.getElementById('email');

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });

    expect(emailInput.value).toBe('test@example.com');
  });

  test('should handle password input', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    const passwordInput = document.getElementById('password');

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    });

    expect(passwordInput.value).toBe('Password123!');
  });

  test('should handle confirm password input', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    const confirmInput = document.getElementById('confirmPassword');

    await act(async () => {
      fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
    });

    expect(confirmInput.value).toBe('Password123!');
  });

  test('should toggle password visibility', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    const passwordInput = document.getElementById('password');
    const toggleButton = screen.getByRole('button', { name: /👁️/ });

    expect(passwordInput.type).toBe('password');

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(passwordInput.type).toBe('text');
  });

  test('should call onClose when cancel clicked', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should call openLogin when already have account clicked', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /alreadyhaveaccount/i }));
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOpenLogin).toHaveBeenCalled();
  });

  test('should close on Escape key', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should disable inputs when no captcha token', () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    expect(document.getElementById('username')).toBeDisabled();
    expect(document.getElementById('email')).toBeDisabled();
    expect(document.getElementById('password')).toBeDisabled();
    expect(document.getElementById('confirmPassword')).toBeDisabled();
  });

  test('should enable inputs after captcha verification', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    expect(document.getElementById('username')).not.toBeDisabled();
    expect(document.getElementById('email')).not.toBeDisabled();
    expect(document.getElementById('password')).not.toBeDisabled();
    expect(document.getElementById('confirmPassword')).not.toBeDisabled();
  });

  test('should disable submit button when form invalid', () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    const submitButton = screen.getByRole('button', { name: /validate/i });
    expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when form valid', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    // Complete captcha first
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    // Fill form with valid data
    await act(async () => {
      fireEvent.change(document.getElementById('username'), { target: { value: 'testuser' } });
      fireEvent.change(document.getElementById('email'), { target: { value: 'test@example.com' } });
      fireEvent.change(document.getElementById('password'), { target: { value: 'Password123!' } });
      fireEvent.change(document.getElementById('confirmPassword'), {
        target: { value: 'Password123!' },
      });
    });

    const submitButton = screen.getByRole('button', { name: /validate/i });
    expect(submitButton).not.toBeDisabled();
  });

  test('should handle successful registration', async () => {
    // ✅ CHANGEMENT : Utilise mockRegister au lieu de vi.mocked(register)
    mockRegister.mockResolvedValue({ success: true });

    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    // Complete captcha and fill form
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
      fireEvent.change(document.getElementById('username'), { target: { value: 'testuser' } });
      fireEvent.change(document.getElementById('email'), { target: { value: 'test@example.com' } });
      fireEvent.change(document.getElementById('password'), { target: { value: 'Password123!' } });
      fireEvent.change(document.getElementById('confirmPassword'), {
        target: { value: 'Password123!' },
      });
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /validate/i }));
    });

    // ✅ CHANGEMENT : Vérifie mockRegister au lieu de register
    expect(mockRegister).toHaveBeenCalledWith(
      'testuser',
      'test@example.com',
      'Password123!',
      'fake-token'
    );
  });

  test('should handle registration error', async () => {
    // ✅ CHANGEMENT : Utilise mockRegister au lieu de vi.mocked(register)
    mockRegister.mockResolvedValue({ success: false, error: 'Registration failed' });

    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    // Complete captcha and fill form
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
      fireEvent.change(document.getElementById('username'), { target: { value: 'testuser' } });
      fireEvent.change(document.getElementById('email'), { target: { value: 'test@example.com' } });
      fireEvent.change(document.getElementById('password'), { target: { value: 'Password123!' } });
      fireEvent.change(document.getElementById('confirmPassword'), {
        target: { value: 'Password123!' },
      });
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /validate/i }));
    });

    // Check that error notification appears
    expect(document.querySelector('[class*="errorMessage"]')).toBeInTheDocument();
  });

  test('should show loading state during registration', async () => {
    // ✅ CHANGEMENT : Utilise mockRegister au lieu de vi.mocked(register)
    mockRegister.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    // Complete captcha and fill form
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
      fireEvent.change(document.getElementById('username'), { target: { value: 'testuser' } });
      fireEvent.change(document.getElementById('email'), { target: { value: 'test@example.com' } });
      fireEvent.change(document.getElementById('password'), { target: { value: 'Password123!' } });
      fireEvent.change(document.getElementById('confirmPassword'), {
        target: { value: 'Password123!' },
      });
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /validate/i }));
    });

    const submitButton = screen.getByRole('button', { name: /loading/i });
    expect(submitButton).toBeDisabled();
  });

  test('should validate username input', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    // Complete captcha first
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    const usernameInput = document.getElementById('username');

    // Test username input
    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'ab' } });
    });

    expect(usernameInput.value).toBe('ab');
  });

  test('should validate email input', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    // Complete captcha first
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    const emailInput = document.getElementById('email');

    // Test email input
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    });

    expect(emailInput.value).toBe('invalid-email');
  });

  test('should validate password input', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    // Complete captcha first
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    const passwordInput = document.getElementById('password');

    // Test password input
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
    });

    expect(passwordInput.value).toBe('weak');
  });

  test('should validate confirm password input', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    // Complete captcha first
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');

    // Test mismatched passwords
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmInput, { target: { value: 'Different123!' } });
    });

    expect(confirmInput.value).toBe('Different123!');
  });

  test('should close on background click', async () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    const modalBackground = document.querySelector('[class*="modalBackground"]');

    await act(async () => {
      fireEvent.click(modalBackground);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should render captcha component', () => {
    render(<SignIn onClose={mockOnClose} openLogin={mockOpenLogin} />);

    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
  });
});
