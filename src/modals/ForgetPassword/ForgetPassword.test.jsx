// src/modals/ForgetPassword/ForgetPassword.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import ForgetPassword from './ForgetPassword'

// Mock API
vi.mock('../../services/api/api', () => ({
  default: { post: vi.fn() }
}))

// Mock ToastSuccess
vi.mock('../../components/ToastSuccess/ToastSuccess', () => ({
  default: ({ message }) => <div data-testid="toast">{message}</div>
}))

// Mock ReCAPTCHA
vi.mock('react-google-recaptcha', () => ({
  default: ({ onChange }) => (
    <div data-testid="recaptcha">
      <button onClick={() => onChange('fake-token')}>Verify</button>
    </div>
  )
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'ForgetPassword.ResetTitle': 'Reset Password',
        'ForgetPassword.NewPasswordLabel': 'New Password',
        'ForgetPassword.ConfirmPasswordLabel': 'Confirm Password',
        'ForgetPassword.Validate': 'Reset Password',
        'ForgetPassword.Loading': 'Loading...',
        'ForgetPassword.PasswordMismatch': 'Passwords do not match',
        'ForgetPassword.PasswordTooShort': 'Password must be at least 8 characters',
        'ForgetPassword.CaptchaRequired': 'Please complete the captcha',
        'ForgetPassword.SuccessMessage': 'Password reset successfully',
        'ForgetPassword.UnknownError': 'Unknown error',
        'ForgetPassword.ServerError': 'Server error'
      }
      return translations[key] || key
    }
  })
}))

import api from '../../services/api/api'

describe('ForgetPassword Component', () => {
  const mockToken = 'test-reset-token-123'

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(import.meta, 'env', {
      value: { VITE_RECAPTCHA_SITE_KEY: 'test-key' },
      writable: true
    })
    // Mock window.location
    delete window.location
    window.location = { href: '' }
  })

  test('should render form elements', () => {
    render(<ForgetPassword token={mockToken} />)
    
    expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument()
    expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument()
  })

  test('should handle new password input', async () => {
    render(<ForgetPassword token={mockToken} />)
    
    const newPasswordInput = screen.getByLabelText('New Password')
    
    await act(async () => {
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } })
    })
    
    expect(newPasswordInput.value).toBe('newpassword123')
  })

  test('should handle confirm password input', async () => {
    render(<ForgetPassword token={mockToken} />)
    
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    
    await act(async () => {
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } })
    })
    
    expect(confirmPasswordInput.value).toBe('newpassword123')
  })

  test('should show error when passwords do not match', async () => {
    render(<ForgetPassword token={mockToken} />)
    
    // Fill different passwords
    await act(async () => {
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'different123' } })
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    })
    
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  test('should show error when password is too short', async () => {
    render(<ForgetPassword token={mockToken} />)
    
    // Fill short passwords
    await act(async () => {
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: '123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '123' } })
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    })
    
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
  })

  test('should show error when captcha is missing', async () => {
    render(<ForgetPassword token={mockToken} />)
    
    // Fill valid passwords but no captcha
    await act(async () => {
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    })
    
    expect(screen.getByText('Please complete the captcha')).toBeInTheDocument()
  })

  test('should handle successful password reset', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true }
    })
    
    render(<ForgetPassword token={mockToken} />)
    
    // Fill valid passwords
    await act(async () => {
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
    })
    
    // Complete captcha
    await act(async () => {
      fireEvent.click(screen.getByText('Verify'))
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    })
    
    expect(api.post).toHaveBeenCalledWith(`/auth/reset-password/${mockToken}`, {
      newPassword: 'password123',
      recaptchaToken: 'fake-token'
    })
  })

  test('should handle API error with custom message', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { message: 'Token expired' } }
    })
    
    render(<ForgetPassword token={mockToken} />)
    
    // Fill valid form
    await act(async () => {
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByText('Verify'))
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    })
    
    expect(screen.getByText('Token expired')).toBeInTheDocument()
  })

  test('should handle API error without custom message', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Network error'))
    
    render(<ForgetPassword token={mockToken} />)
    
    // Fill valid form
    await act(async () => {
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByText('Verify'))
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    })
    
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  test('should handle API response with success false', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: false, message: 'Reset failed' }
    })
    
    render(<ForgetPassword token={mockToken} />)
    
    // Fill valid form
    await act(async () => {
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByText('Verify'))
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    })
    
    expect(screen.getByText('Reset failed')).toBeInTheDocument()
  })

  test('should disable button during loading', async () => {
    // Mock delayed response
    vi.mocked(api.post).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { success: true } }), 100))
    )
    
    render(<ForgetPassword token={mockToken} />)
    
    // Fill valid form
    await act(async () => {
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByText('Verify'))
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    })
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled()
  })

  test('should redirect after successful reset', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true }
    })
    
    render(<ForgetPassword token={mockToken} />)
    
    // Fill valid form
    await act(async () => {
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByText('Verify'))
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    })
    
    // Check that API was called successfully
    expect(api.post).toHaveBeenCalled()
  })

  test('should render captcha component', () => {
    render(<ForgetPassword token={mockToken} />)
    
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument()
    expect(screen.getByText('Verify')).toBeInTheDocument()
  })
})