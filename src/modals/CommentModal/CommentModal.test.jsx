// src/components/CommentModal/CommentModal.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import CommentModal from './CommentModal'

// Mock services
vi.mock('../../services/commentService', () => ({
  addOrUpdateComment: vi.fn()
}))

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ ...props }) => <span data-testid="star-icon" {...props} />
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faStar: 'star'
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, params) => {
      const translations = {
        'CommentModal.Title': `Comment on ${params?.title || 'Book'}`,
        'CommentModal.ContentPlaceholder': 'Write your comment...',
        'CommentModal.Cancel': 'Cancel',
        'CommentModal.Submit': 'Submit',
        'CommentModal.SubmitLoading': 'Submitting',
        'CommentModal.EmptyComment': 'Comment cannot be empty',
        'CommentModal.ErrorSubmittingComment': 'Error submitting comment'
      }
      return translations[key] || key
    }
  })
}))

// Mock alert
globalThis.alert = vi.fn()

import { addOrUpdateComment } from '../../services/commentService'

describe('CommentModal Component', () => {
  const mockOnClose = vi.fn()
  const mockBook = {
    bookId: 1,
    title: 'Test Book',
    cover_url: 'https://example.com/cover.jpg'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should render with book info', () => {
    render(<CommentModal book={mockBook} onClose={mockOnClose} />)
    
    expect(screen.getByText('Comment on Test Book')).toBeInTheDocument()
    expect(screen.getByAltText('Test Book')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Write your comment...')).toBeInTheDocument()
  })

  test('should render 5 stars', () => {
    render(<CommentModal book={mockBook} onClose={mockOnClose} />)
    
    const stars = screen.getAllByTestId('star-icon')
    expect(stars).toHaveLength(5)
  })

  test('should handle text input', async () => {
    render(<CommentModal book={mockBook} onClose={mockOnClose} />)
    
    const textarea = screen.getByPlaceholderText('Write your comment...')
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Great book!' } })
    })
    
    expect(textarea.value).toBe('Great book!')
  })

  test('should handle star rating', async () => {
    render(<CommentModal book={mockBook} onClose={mockOnClose} />)
    
    const stars = screen.getAllByTestId('star-icon')
    
    await act(async () => {
      fireEvent.click(stars[2]) // 3rd star = rating 3
    })
    
    expect(stars[2].parentElement.className).toMatch(/filledStar/)
  })

  test('should handle star hover', async () => {
    render(<CommentModal book={mockBook} onClose={mockOnClose} />)
    
    const stars = screen.getAllByTestId('star-icon')
    
    await act(async () => {
      fireEvent.mouseEnter(stars[3]) // 4th star
    })
    
    expect(stars[3].parentElement.className).toMatch(/filledStar/)
    
    await act(async () => {
      fireEvent.mouseLeave(stars[3])
    })
    
    expect(stars[3].parentElement.className).toMatch(/emptyStar/)
  })

  test('should call onClose when cancel clicked', async () => {
    render(<CommentModal book={mockBook} onClose={mockOnClose} />)
    
    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'))
    })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('should show alert for empty comment', async () => {
    render(<CommentModal book={mockBook} onClose={mockOnClose} />)
    
    await act(async () => {
      fireEvent.click(screen.getByText('Submit'))
    })
    
    expect(globalThis.alert).toHaveBeenCalledWith('Comment cannot be empty')
  })

  test('should submit valid comment', async () => {
    vi.mocked(addOrUpdateComment).mockResolvedValue({})
    
    render(<CommentModal book={mockBook} onClose={mockOnClose} />)
    
    // Fill form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Write your comment...'), { 
        target: { value: 'Great book!' } 
      })
      fireEvent.click(screen.getAllByTestId('star-icon')[3]) // 4 stars
    })
    
    // Submit
    await act(async () => {
      fireEvent.click(screen.getByText('Submit'))
    })
    
    expect(addOrUpdateComment).toHaveBeenCalledWith(1, {
      content: 'Great book!',
      rating: 4
    })
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  test('should populate existing comment', () => {
    const bookWithComment = {
      ...mockBook,
      existingComment: {
        content: 'Existing comment',
        rating: 3
      }
    }
    
    render(<CommentModal book={bookWithComment} onClose={mockOnClose} />)
    
    expect(screen.getByDisplayValue('Existing comment')).toBeInTheDocument()
    
    const stars = screen.getAllByTestId('star-icon')
    expect(stars[2].parentElement.className).toMatch(/filledStar/) // 3rd star
    expect(stars[3].parentElement.className).toMatch(/emptyStar/) // 4th star
  })

  test('should handle API error', async () => {
    vi.mocked(addOrUpdateComment).mockRejectedValue(new Error('API Error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<CommentModal book={mockBook} onClose={mockOnClose} />)
    
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Write your comment...'), { 
        target: { value: 'Test comment' } 
      })
      fireEvent.click(screen.getByText('Submit'))
    })
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
    
    consoleSpy.mockRestore()
  })

  test('should disable button during loading', async () => {
    vi.mocked(addOrUpdateComment).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<CommentModal book={mockBook} onClose={mockOnClose} />)
    
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Write your comment...'), { 
        target: { value: 'Test' } 
      })
      fireEvent.click(screen.getByText('Submit'))
    })
    
    expect(screen.getByText('Submitting')).toBeDisabled()
  })
})