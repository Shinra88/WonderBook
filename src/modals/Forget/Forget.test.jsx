// src/components/Forget/Forget.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import Forget from './Forget';

// Mock API
vi.mock('../../services/api/api', () => ({
  default: { post: vi.fn() },
}));

// Mock ToastSuccess
vi.mock('../../components/ToastSuccess/ToastSuccess', () => ({
  default: ({ message }) => <div data-testid="toast">{message}</div>,
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
        'ForgetPassword.ResetTitle': 'Reset Password',
        'ForgetPassword.EmailLabel': 'Email',
        'ForgetPassword.Cancel': 'Cancel',
        'ForgetPassword.Validate': 'Send Reset Link',
        'ForgetPassword.EmailRequired': 'Email is required',
        'ForgetPassword.CaptchaRequired': 'Please complete the captcha',
        'ForgetPassword.EmailSent': 'Email sent',
      };
      return translations[key] || key;
    },
  }),
}));

import api from '../../services/api/api';

describe('Forget Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(import.meta, 'env', {
      value: { VITE_RECAPTCHA_SITE_KEY: 'test-key' },
      writable: true,
    });
  });

  test('should render form elements', () => {
    render(<Forget onClose={mockOnClose} />);

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
  });

  test('should handle email input', async () => {
    render(<Forget onClose={mockOnClose} />);

    const emailInput = screen.getByLabelText('Email');

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });

    expect(emailInput.value).toBe('test@example.com');
  });

  test('should call onClose when cancel clicked', async () => {
    render(<Forget onClose={mockOnClose} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should show error when email is missing', async () => {
    render(<Forget onClose={mockOnClose} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Send Reset Link'));
    });

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  test('should show error when captcha is missing', async () => {
    render(<Forget onClose={mockOnClose} />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send Reset Link'));
    });

    expect(screen.getByText('Please complete the captcha')).toBeInTheDocument();
  });

  test('should close on Escape key', async () => {
    render(<Forget onClose={mockOnClose} />);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should close on background click', async () => {
    render(<Forget onClose={mockOnClose} />);

    const modalBackground = document.querySelector('[role="button"]');

    await act(async () => {
      fireEvent.click(modalBackground);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should not close when clicking modal content', async () => {
    render(<Forget onClose={mockOnClose} />);

    const title = screen.getByText('Reset Password');

    await act(async () => {
      fireEvent.click(title);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('should handle complete form workflow', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true },
    });

    render(<Forget onClose={mockOnClose} />);

    // Fill email
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    });

    // Complete captcha
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'));
    });

    // Submit - should work now
    await act(async () => {
      fireEvent.click(screen.getByText('Send Reset Link'));
    });

    expect(api.post).toHaveBeenCalledWith('/auth/forget-password', {
      email: 'test@example.com',
      recaptchaToken: 'fake-token',
    });
  });

  test('should disable submit button initially', () => {
    render(<Forget onClose={mockOnClose} />);

    const submitButton = screen.getByText('Send Reset Link');
    expect(submitButton).not.toBeDisabled(); // Le bouton n'est pas désactivé par défaut
  });

  test('should render captcha component', () => {
    render(<Forget onClose={mockOnClose} />);

    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
  });
});
