// src/modals/TopicModal/TopicModal.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import TopicModal from './TopicModal';

// Mock topicsService
vi.mock('../../services/topicsService', () => ({
  addTopic: vi.fn(),
}));

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { token: 'fake-user-token', id: 1, role: 'user' },
  }),
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
    t: key => key,
  }),
}));

import { addTopic } from '../../services/topicsService';

describe('TopicModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(import.meta, 'env', {
      value: { VITE_RECAPTCHA_SITE_KEY: 'test-key' },
      writable: true,
    });
  });

  test('should render form elements', () => {
    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('TopicModal.Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('TopicModal.Content')).toBeInTheDocument();
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('should handle title input', async () => {
    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByPlaceholderText('TopicModal.Title');

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Test Topic' } });
    });

    expect(titleInput.value).toBe('Test Topic');
  });

  test('should handle content input', async () => {
    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const contentTextarea = screen.getByPlaceholderText('TopicModal.Content');

    await act(async () => {
      fireEvent.change(contentTextarea, { target: { value: 'Test content' } });
    });

    expect(contentTextarea.value).toBe('Test content');
  });

  test('should call onClose when cancel clicked', async () => {
    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should close on Escape key', async () => {
    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should close on background click', async () => {
    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const modalBackground = document.querySelector('[class*="modalBackground"]');

    await act(async () => {
      fireEvent.click(modalBackground);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should not close when clicking modal content', async () => {
    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const modalContent = document.querySelector('[class*="modalContent"]');

    await act(async () => {
      fireEvent.click(modalContent);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('should disable submit button when form invalid', () => {
    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when form valid', async () => {
    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill form and complete captcha
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('TopicModal.Title'), {
        target: { value: 'Test Topic' },
      });
      fireEvent.change(screen.getByPlaceholderText('TopicModal.Content'), {
        target: { value: 'Test content' },
      });
      fireEvent.click(screen.getByText('Verify'));
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).not.toBeDisabled();
  });

  test('should handle successful topic submission', async () => {
    vi.mocked(addTopic).mockResolvedValue({});

    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('TopicModal.Title'), {
        target: { value: 'Test Topic' },
      });
      fireEvent.change(screen.getByPlaceholderText('TopicModal.Content'), {
        target: { value: 'Test content' },
      });
      fireEvent.click(screen.getByText('Verify'));
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    expect(addTopic).toHaveBeenCalledWith(
      {
        title: 'Test Topic',
        content: 'Test content',
        recaptchaToken: 'fake-token',
        notice: false,
      },
      'fake-user-token'
    );
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  test('should show loading state during submission', async () => {
    vi.mocked(addTopic).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 100))
    );

    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('TopicModal.Title'), {
        target: { value: 'Test Topic' },
      });
      fireEvent.change(screen.getByPlaceholderText('TopicModal.Content'), {
        target: { value: 'Test content' },
      });
      fireEvent.click(screen.getByText('Verify'));
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    const submitButton = screen.getByRole('button', { name: /sending/i });
    expect(submitButton).toBeDisabled();
  });

  test('should render captcha component', () => {
    render(<TopicModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
  });
});
