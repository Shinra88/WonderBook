// src/modals/Login/Login.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import LoginModal from '../../modals/Login/Login_modal';

// Mock API
vi.mock('../../services/api/api', () => ({
  default: { post: vi.fn() },
}));

// Mock useAuth
const mockLogin = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock ReCAPTCHA
vi.mock('react-google-recaptcha', () => ({
  default: ({ onChange }) => (
    <div data-testid="recaptcha">
      <button onClick={() => onChange('fake-token')}>Verify</button>
    </div>
  ),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'Login.Login': 'Login',
        'Login.Email': 'Email',
        'Login.Password': 'Password',
        'Login.Cancel': 'Cancel',
        'Login.Validate': 'Login',
        'Login.Loading': 'Loading...',
        'Login.CaptchaRequired': 'Please complete the captcha',
        'Login.ForgotPassword': 'Forgot Password',
        'Login.Or': 'Or',
        'Login.CreateAccount': 'Create Account',
      };
      return translations[key] || key;
    },
  }),
}));

import api from '../../services/api/api';

describe('LoginModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOpenRegister = vi.fn();
  const mockOpenForgetPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(import.meta, 'env', {
      value: { VITE_RECAPTCHA_SITE_KEY: 'test-key' },
      writable: true,
    });
    mockLogin.mockClear();
  });

  test('should render form elements', () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('should handle email input', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    const emailInput = screen.getByLabelText('Email');

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });

    expect(emailInput.value).toBe('test@example.com');
  });

  test('should handle password input', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    const passwordInput = screen.getByLabelText('Password');

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    expect(passwordInput.value).toBe('password123');
  });

  test('should call onClose when cancel clicked', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should call openRegister when create account clicked', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Create Account'));
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOpenRegister).toHaveBeenCalled();
  });

  test('should call openForgetPassword when forgot password clicked', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Forgot Password'));
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOpenForgetPassword).toHaveBeenCalled();
  });

  test('should close on Escape key', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should close on background click', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    const modalBackground = document.querySelector('[role="presentation"]');

    await act(async () => {
      fireEvent.click(modalBackground);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should not close when clicking modal content', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    const emailInput = screen.getByLabelText('Email');

    await act(async () => {
      fireEvent.click(emailInput);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('should show captcha required message when no captcha', () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    expect(screen.getByText('Please complete the captcha')).toBeInTheDocument();
  });

  test('should disable inputs when no captcha token', () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  test('should enable inputs after captcha verification', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    expect(screen.getByLabelText('Email')).not.toBeDisabled();
    expect(screen.getByLabelText('Password')).not.toBeDisabled();
  });

  test('should disable login button when form invalid', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Login' });
    expect(submitButton).toBeDisabled();
  });

  test('should enable login button when form valid', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    // Complete captcha first
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    // Fill form
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    });

    const submitButton = screen.getByRole('button', { name: 'Login' });
    expect(submitButton).not.toBeDisabled();
  });

  test('should handle successful login', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        token: 'fake-jwt-token',
        user: { id: 1, email: 'test@example.com' },
      },
    });

    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    // Complete captcha
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    // Fill form
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    });

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Login' });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      mail: 'test@example.com',
      password: 'password123',
      recaptchaToken: 'fake-token',
    });

    expect(mockLogin).toHaveBeenCalledWith({ id: 1, email: 'test@example.com' }, 'fake-jwt-token');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should handle login without captcha token', async () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    // Try to login without captcha - button should be disabled
    const submitButton = screen.getByRole('button', { name: 'Login' });
    expect(submitButton).toBeDisabled();
  });

  test('should handle API error during login', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    vi.mocked(api.post).mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });

    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    // Complete captcha
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    // Fill form
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-password' } });
    });

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Login' });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(alertSpy).toHaveBeenCalledWith('Invalid credentials');

    alertSpy.mockRestore();
  });

  test('should show loading state during login', async () => {
    // Mock a delayed API response
    vi.mocked(api.post).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                data: { token: 'fake-token', user: { id: 1 } },
              }),
            100
          )
        )
    );

    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    // Complete captcha
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    // Fill form
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    });

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Login' });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should render captcha component', () => {
    render(
      <LoginModal
        onClose={mockOnClose}
        openRegister={mockOpenRegister}
        openForgetPassword={mockOpenForgetPassword}
      />
    );

    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
  });
});
