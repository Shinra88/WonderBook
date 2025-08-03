// src/modals/PostModal/PostModal.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import PostModal from './PostModal'

// Mock postsService
vi.mock('../../services/postsService', () => ({
  addPost: vi.fn()
}))

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { token: 'fake-user-token', id: 1 }
  })
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
    t: (key) => key
  })
}))

import { addPost } from '../../services/postsService'

describe('PostModal Component', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()
  const mockTopicId = 'topic-123'

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(import.meta, 'env', {
      value: { VITE_RECAPTCHA_SITE_KEY: 'test-key' },
      writable: true
    })
  })

  test('should render form elements', () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  test('should handle content input', async () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const textarea = screen.getByRole('textbox')
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test content' } })
    })
    
    expect(textarea.value).toBe('Test content')
  })

  test('should call onClose when cancel clicked', async () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('should close on Escape key', async () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('should disable submit button when form invalid', () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /send/i })
    expect(submitButton).toBeDisabled()
  })

  test('should enable submit button when form valid', async () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    // Fill content and complete captcha
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test content' } })
      fireEvent.click(screen.getByText('Verify'))
    })
    
    const submitButton = screen.getByRole('button', { name: /send/i })
    expect(submitButton).not.toBeDisabled()
  })

  test('should handle successful post submission', async () => {
    vi.mocked(addPost).mockResolvedValue({})
    
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    // Fill form
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test content' } })
      fireEvent.click(screen.getByText('Verify'))
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }))
    })
    
    expect(addPost).toHaveBeenCalledWith(
      {
        topicId: mockTopicId,
        content: 'Test content',
        recaptchaToken: 'fake-token'
      },
      'fake-user-token'
    )
    expect(mockOnSuccess).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('should show loading state during submission', async () => {
    vi.mocked(addPost).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({}), 100))
    )
    
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    // Fill form
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test content' } })
      fireEvent.click(screen.getByText('Verify'))
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }))
    })
    
    const submitButton = screen.getByRole('button', { name: /sending/i })
    expect(submitButton).toBeDisabled()
  })

  test('should insert spoiler tag', async () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const textarea = screen.getByRole('textbox')
    const spoilerButton = screen.getByRole('button', { name: /spoiler/i })
    
    await act(async () => {
      fireEvent.click(spoilerButton)
    })
    
    expect(textarea.value).toContain('[spoiler]')
    expect(textarea.value).toContain('[/spoiler]')
  })

  test('should insert bold tag', async () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const textarea = screen.getByRole('textbox')
    const boldButton = screen.getByRole('button', { name: /bold/i })
    
    await act(async () => {
      fireEvent.click(boldButton)
    })
    
    expect(textarea.value).toContain('[b]')
    expect(textarea.value).toContain('[/b]')
  })

  test('should insert italic tag', async () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const textarea = screen.getByRole('textbox')
    const italicButton = screen.getByRole('button', { name: /italic/i })
    
    await act(async () => {
      fireEvent.click(italicButton)
    })
    
    expect(textarea.value).toContain('[i]')
    expect(textarea.value).toContain('[/i]')
  })

  test('should insert underline tag', async () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const textarea = screen.getByRole('textbox')
    const underlineButton = screen.getByRole('button', { name: /underline/i })
    
    await act(async () => {
      fireEvent.click(underlineButton)
    })
    
    expect(textarea.value).toContain('[u]')
    expect(textarea.value).toContain('[/u]')
  })

  test('should insert strikethrough tag', async () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const textarea = screen.getByRole('textbox')
    const strikeButton = screen.getByRole('button', { name: /strikethrough/i })
    
    await act(async () => {
      fireEvent.click(strikeButton)
    })
    
    expect(textarea.value).toContain('[s]')
    expect(textarea.value).toContain('[/s]')
  })

  test('should wrap selected text with tag', async () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const textarea = screen.getByRole('textbox')
    
    // Set content and select part of it
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Hello world' } })
    })
    
    // Mock selection
    textarea.selectionStart = 0
    textarea.selectionEnd = 5
    
    const boldButton = screen.getByRole('button', { name: /bold/i })
    
    await act(async () => {
      fireEvent.click(boldButton)
    })
    
    expect(textarea.value).toBe('[b]Hello[/b] world')
  })

  test('should render captcha component', () => {
    render(
      <PostModal 
        topicId={mockTopicId}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument()
    expect(screen.getByText('Verify')).toBeInTheDocument()
  })
})