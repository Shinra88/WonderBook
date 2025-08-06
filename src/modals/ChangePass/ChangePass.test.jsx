// src/components/ChangePass/ChangePass.test.jsx - VERSION SÉCURISÉE
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act as reactAct } from 'react';
import ChangePass from './ChangePass';

// ✅ CHANGEMENT : Mock useAuth au lieu d'authService
const mockChangePassword = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    changePassword: mockChangePassword,
  }),
}));

// Mock react-i18next (inchangé)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'ChangePass.Title': 'Change Password',
        'ChangePass.OldPassword': 'Old Password',
        'ChangePass.NewPassword': 'New Password',
        'ChangePass.ConfirmNewPassword': 'Confirm New Password',
        'ChangePass.Cancel': 'Cancel',
        'ChangePass.Validate': 'Validate',
        'ChangePass.Loading': 'Loading',
        'ChangePass.PasswordRequirements':
          'Password must contain at least 8 characters, uppercase, lowercase, number and special character',
        'ChangePass.PasswordsDoNotMatch': 'Passwords do not match',
        'ChangePass.PasswordStrength': 'Password strength',
        'ChangePass.PasswordStrengthWeak': 'Weak',
        'ChangePass.PasswordStrengthMedium': 'Medium',
        'ChangePass.PasswordStrengthStrong': 'Strong',
      };
      return translations[key] || key;
    },
  }),
}));

// ✅ SUPPRIMÉ : Plus d'import d'authService
// import { changePassword } from '../../services/authService';

describe('ChangePass Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // Tests de base
  test('should render with correct title and fields', () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Old Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Validate')).toBeInTheDocument();
  });

  test('should have correct input types', () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText('Old Password')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('New Password')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Confirm New Password')).toHaveAttribute('type', 'password');
  });

  // Tests des interactions de base
  test('should handle input changes', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const oldPasswordInput = screen.getByLabelText('Old Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    await reactAct(async () => {
      fireEvent.change(oldPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
    });

    expect(oldPasswordInput.value).toBe('oldpassword');
    expect(newPasswordInput.value).toBe('NewPassword123!');
    expect(confirmPasswordInput.value).toBe('NewPassword123!');
  });

  test('should call onClose when cancel button is clicked', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const cancelButton = screen.getByText('Cancel');

    await reactAct(async () => {
      fireEvent.click(cancelButton);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  // Tests de validation des mots de passe
  test('should show password requirements error for invalid password', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const newPasswordInput = screen.getByLabelText('New Password');

    await reactAct(async () => {
      fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          'Password must contain at least 8 characters, uppercase, lowercase, number and special character'
        )
      ).toBeInTheDocument();
    });
  });

  test('should show password mismatch error', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    await reactAct(async () => {
      fireEvent.change(newPasswordInput, { target: { value: 'ValidPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('should not show errors for valid matching passwords', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    await reactAct(async () => {
      fireEvent.change(newPasswordInput, { target: { value: 'ValidPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPassword123!' } });
    });

    await waitFor(() => {
      expect(
        screen.queryByText(
          'Password must contain at least 8 characters, uppercase, lowercase, number and special character'
        )
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });
  });

  // Tests de la force du mot de passe
  test('should show weak password strength', async () => {
    render(<ChangePass onClose={mockOnSuccess} onSuccess={mockOnSuccess} />);

    const newPasswordInput = screen.getByLabelText('New Password');

    await reactAct(async () => {
      fireEvent.change(newPasswordInput, { target: { value: 'password' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Password strength : Weak')).toBeInTheDocument();
    });
  });

  test('should show medium password strength', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const newPasswordInput = screen.getByLabelText('New Password');

    await reactAct(async () => {
      fireEvent.change(newPasswordInput, { target: { value: 'Password123' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Password strength : Medium')).toBeInTheDocument();
    });
  });

  test('should show strong password strength', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const newPasswordInput = screen.getByLabelText('New Password');

    await reactAct(async () => {
      fireEvent.change(newPasswordInput, { target: { value: 'Password123!' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Password strength : Strong')).toBeInTheDocument();
    });
  });

  test('should not show password strength for empty password', () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.queryByText(/Password strength/)).not.toBeInTheDocument();
  });

  // Tests du toggle de visibilité du mot de passe
  test('should toggle password visibility', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const newPasswordInput = screen.getByLabelText('New Password');
    const toggleButton = screen.getByText('👁️');

    // Initially password type
    expect(newPasswordInput).toHaveAttribute('type', 'password');

    // Click to show
    await reactAct(async () => {
      fireEvent.click(toggleButton);
    });

    expect(newPasswordInput).toHaveAttribute('type', 'text');
    expect(screen.getByText('🙈')).toBeInTheDocument();

    // Click to hide
    await reactAct(async () => {
      fireEvent.click(screen.getByText('🙈'));
    });

    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(screen.getByText('👁️')).toBeInTheDocument();
  });

  // Tests de l'état du bouton submit
  test('should disable submit button when form is invalid', () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByText('Validate');
    expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when form is valid', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const oldPasswordInput = screen.getByLabelText('Old Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    await reactAct(async () => {
      fireEvent.change(oldPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'ValidPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPassword123!' } });
    });

    await waitFor(() => {
      const submitButton = screen.getByText('Validate');
      expect(submitButton).not.toBeDisabled();
    });
  });

  // Tests de soumission du formulaire
  test('should handle successful password change', async () => {
    // ✅ CHANGEMENT : Utilise mockChangePassword au lieu de vi.mocked(changePassword)
    mockChangePassword.mockResolvedValue({
      success: true,
      message: 'Password changed successfully',
    });

    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill form
    await reactAct(async () => {
      fireEvent.change(screen.getByLabelText('Old Password'), { target: { value: 'oldpassword' } });
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: 'ValidPassword123!' },
      });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'ValidPassword123!' },
      });
    });

    // Submit
    await reactAct(async () => {
      fireEvent.click(screen.getByText('Validate'));
    });

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
    });

    // ✅ CHANGEMENT : Vérifie mockChangePassword au lieu de changePassword
    expect(mockChangePassword).toHaveBeenCalledWith('oldpassword', 'ValidPassword123!');

    // Wait for auto close
    await reactAct(async () => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('should handle failed password change', async () => {
    // ✅ CHANGEMENT : Utilise mockChangePassword au lieu de vi.mocked(changePassword)
    mockChangePassword.mockResolvedValue({
      success: false,
      message: 'Old password is incorrect',
    });

    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill and submit form
    await reactAct(async () => {
      fireEvent.change(screen.getByLabelText('Old Password'), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: 'ValidPassword123!' },
      });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'ValidPassword123!' },
      });
    });

    await reactAct(async () => {
      fireEvent.click(screen.getByText('Validate'));
    });

    await waitFor(() => {
      expect(screen.getByText('Old password is incorrect')).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // Tests des événements clavier et clics
  test('should close modal on Escape key', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    await reactAct(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should close modal when clicking outside', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const modalBackground = document.querySelector('[role="presentation"]');

    await reactAct(async () => {
      fireEvent.click(modalBackground);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should not close modal when clicking inside content', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const title = screen.getByText('Change Password');

    await reactAct(async () => {
      fireEvent.click(title);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // Tests des styles conditionnels
  test('should show validation errors', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    await reactAct(async () => {
      fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          'Password must contain at least 8 characters, uppercase, lowercase, number and special character'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('should show password strength indicators', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const newPasswordInput = screen.getByLabelText('New Password');

    // Test weak password
    await reactAct(async () => {
      fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Password strength : Weak')).toBeInTheDocument();
    });

    // Test strong password
    await reactAct(async () => {
      fireEvent.change(newPasswordInput, { target: { value: 'StrongPassword123!' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Password strength : Strong')).toBeInTheDocument();
    });
  });

  // Tests des cas limites
  test('should not submit when form is invalid', async () => {
    render(<ChangePass onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill only partial form
    await reactAct(async () => {
      fireEvent.change(screen.getByLabelText('Old Password'), { target: { value: 'oldpassword' } });
    });

    const submitButton = screen.getByText('Validate');
    expect(submitButton).toBeDisabled();

    // Try to click disabled button
    await reactAct(async () => {
      fireEvent.click(submitButton);
    });

    // ✅ CHANGEMENT : Vérifie mockChangePassword au lieu de changePassword
    expect(mockChangePassword).not.toHaveBeenCalled();
  });
});
