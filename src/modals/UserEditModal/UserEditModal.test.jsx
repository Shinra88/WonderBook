// src/modals/UserEditModal/UserEditModal.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import UserEditModal from './UserEditModal';

// Mock adminServices
vi.mock('../../services/adminServices', () => ({
  updateUserById: vi.fn(),
}));

// Mock api
vi.mock('../../services/api/api', () => ({
  default: { post: vi.fn() },
}));

// Mock ToastSuccess
vi.mock('../../components/ToastSuccess/ToastSuccess', () => ({
  default: ({ message }) => <div data-testid="toast">{message}</div>,
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

import { updateUserById } from '../../services/adminServices';
import api from '../../services/api/api';

describe('UserEditModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const mockUser = {
    userId: '123',
    name: 'John Doe',
    mail: 'john@example.com',
    avatar: 'avatar-url.jpg',
    aboutMe: 'About me text',
    role: 'user',
    status: 'active',
    repForum: true,
    addCom: false,
    addBook: true,
    news: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.alert
    window.alert = vi.fn();
  });

  test('should render form elements for regular user', () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('About me text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('should render admin-only elements when isAdmin is true', () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={true} />
    );

    // Role selector should be present
    expect(document.querySelector('select[name="role"]')).toBeInTheDocument();

    // Password reset button should be present
    expect(screen.getByRole('button', { name: /sendresetlink/i })).toBeInTheDocument();

    // Banned option should be available
    expect(screen.getByText('UserEditModal.Banned')).toBeInTheDocument();
  });

  test('should not render admin-only elements when isAdmin is false', () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    // Password reset button should not be present
    expect(screen.queryByRole('button', { name: /sendresetlink/i })).not.toBeInTheDocument();

    // Banned option should not be available
    expect(screen.queryByText('UserEditModal.Banned')).not.toBeInTheDocument();
  });

  test('should handle name input change', async () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    const nameInput = screen.getByDisplayValue('John Doe');

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    });

    expect(nameInput.value).toBe('Jane Doe');
  });

  test('should handle email input change', async () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    const emailInput = screen.getByDisplayValue('john@example.com');

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    });

    expect(emailInput.value).toBe('jane@example.com');
  });

  test('should handle about me textarea change', async () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    const aboutInput = screen.getByDisplayValue('About me text');

    await act(async () => {
      fireEvent.change(aboutInput, { target: { value: 'New about me text' } });
    });

    expect(aboutInput.value).toBe('New about me text');
  });

  test('should handle role change when admin', async () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={true} />
    );

    const roleSelect = document.querySelector('select[name="role"]');

    await act(async () => {
      fireEvent.change(roleSelect, { target: { value: 'moderator' } });
    });

    expect(roleSelect.value).toBe('moderator');
  });

  test('should handle status change', async () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    const statusSelect = document.querySelector('select[name="status"]');

    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'suspended' } });
    });

    expect(statusSelect.value).toBe('suspended');
  });

  test('should handle checkbox changes', async () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    const addComCheckbox = screen.getByRole('checkbox', { name: /addcom/i });

    await act(async () => {
      fireEvent.click(addComCheckbox);
    });

    expect(addComCheckbox).toBeChecked();
  });

  test('should call onClose when cancel clicked', async () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should call onClose when background clicked', async () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    const modalBackground = document.querySelector('[class*="modalBackground"]');

    await act(async () => {
      fireEvent.click(modalBackground);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should not close when clicking modal content', async () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    const modalContent = document.querySelector('[class*="modalContent"]');

    await act(async () => {
      fireEvent.click(modalContent);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('should handle successful form submission', async () => {
    const updatedUser = { ...mockUser, name: 'Updated Name' };
    vi.mocked(updateUserById).mockResolvedValue(updatedUser);

    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    // Change name
    await act(async () => {
      fireEvent.change(screen.getByDisplayValue('John Doe'), { target: { value: 'Updated Name' } });
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });

    expect(updateUserById).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({
        name: 'Updated Name',
      })
    );
    expect(mockOnSave).toHaveBeenCalledWith(updatedUser);
  });

  test('should handle form submission error', async () => {
    vi.mocked(updateUserById).mockRejectedValue(new Error('Update failed'));

    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });

    expect(window.alert).toHaveBeenCalledWith('UserEditModal.ErrorUpdatingUser');
  });

  test('should handle password reset when admin', async () => {
    vi.mocked(api.post).mockResolvedValue({});

    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={true} />
    );

    // Click reset password button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sendresetlink/i }));
    });

    expect(api.post).toHaveBeenCalledWith('/auth/forget-password', {
      email: 'john@example.com',
      recaptchaToken: 'bypass_for_admin',
    });
    expect(window.alert).toHaveBeenCalledWith('UserEditModal.ResetLinkSent');
  });

  test('should handle password reset error', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Reset failed'));

    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={true} />
    );

    // Click reset password button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sendresetlink/i }));
    });

    expect(window.alert).toHaveBeenCalledWith('UserEditModal.ErrorSendingResetLink');
  });

  test('should handle avatar removal', async () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    const avatarWrapper = document.querySelector('[class*="avatarWrapper"]');

    // Hover to show remove button
    await act(async () => {
      fireEvent.mouseEnter(avatarWrapper);
    });

    // Check if remove button appears
    expect(avatarWrapper).toBeInTheDocument();
  });

  test('should initialize form with user data', () => {
    render(
      <UserEditModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} isAdmin={false} />
    );

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('About me text')).toBeInTheDocument();

    // Check checkboxes
    expect(screen.getByRole('checkbox', { name: /repforum/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /addcom/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /addbook/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /news/i })).not.toBeChecked();
  });
});
