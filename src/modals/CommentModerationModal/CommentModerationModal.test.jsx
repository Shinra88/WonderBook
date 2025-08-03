// src/components/CommentModerationModal/CommentModerationModal.test.jsx
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import CommentModerationModal from './CommentModerationModal';

// Mock services
vi.mock('../../services/commentService', () => ({
  deleteCommentAsAdmin: vi.fn(),
}));

// Mock helpers
vi.mock('../../utils/helpers', () => ({
  displayStars: rating => `⭐`.repeat(rating),
}));

// Mock ToastSuccess
vi.mock('../../components/ToastSuccess/ToastSuccess', () => ({
  default: ({ message }) => <div data-testid="toast">{message}</div>,
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'TopicModerator.CommentModeration': 'Comment Moderation',
        'TopicModerator.CommentDeleted': 'Comment deleted',
        'TopicModerator.NoCommentsForThisBook': 'No comments for this book',
        'TopicModerator.Delete': 'Delete',
        'TopicModerator.Close': 'Close',
        'TopicModerator.ErrorDeletingComment': 'Error deleting comment',
      };
      return translations[key] || key;
    },
  }),
}));

import { deleteCommentAsAdmin } from '../../services/commentService';

describe('CommentModerationModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();

  const mockComments = [
    {
      commentId: 1,
      content: 'Great book!',
      rating: 5,
      created_at: '2023-01-01T10:00:00Z',
      user: { name: 'John Doe', avatar: 'https://example.com/avatar.jpg' },
    },
    {
      commentId: 2,
      content: 'Not bad',
      rating: 3,
      created_at: '2023-01-02T15:30:00Z',
      user: { name: 'Jane Smith' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should render with title', () => {
    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Comment Moderation')).toBeInTheDocument();
  });

  test('should render comments list', () => {
    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('« Great book! »')).toBeInTheDocument();
    expect(screen.getByText('« Not bad »')).toBeInTheDocument();
  });

  test('should display stars rating', () => {
    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('⭐⭐⭐⭐⭐')).toBeInTheDocument();
    expect(screen.getByText('⭐⭐⭐')).toBeInTheDocument();
  });

  test('should display formatted dates', () => {
    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('01/01/2023')).toBeInTheDocument();
    expect(screen.getByText('02/01/2023')).toBeInTheDocument();
  });

  test('should render delete buttons', () => {
    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
  });

  test('should call onClose when close button clicked', async () => {
    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Close'));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should handle comment deletion', async () => {
    vi.mocked(deleteCommentAsAdmin).mockResolvedValue({});

    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');

    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    expect(deleteCommentAsAdmin).toHaveBeenCalledWith(1);
    expect(mockOnUpdate).toHaveBeenCalledWith([mockComments[1]]);

    expect(screen.getByTestId('toast')).toBeInTheDocument();
    expect(screen.getByText('Comment deleted')).toBeInTheDocument();
  });

  test('should handle empty comments list', () => {
    render(<CommentModerationModal comments={[]} onClose={mockOnClose} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('No comments for this book')).toBeInTheDocument();
  });

  test('should handle comments without user info', () => {
    const commentsWithoutUser = [
      {
        commentId: 3,
        content: 'Anonymous comment',
        rating: 2,
        created_at: '2023-01-03T12:00:00Z',
      },
    ];

    render(
      <CommentModerationModal
        comments={commentsWithoutUser}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Anonyme')).toBeInTheDocument();
    expect(screen.getByText('« Anonymous comment »')).toBeInTheDocument();
  });

  test('should close on outside click', async () => {
    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await act(async () => {
      fireEvent.mouseDown(document.body);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should not close on inside click', async () => {
    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const modal = screen.getByText('Comment Moderation');

    await act(async () => {
      fireEvent.mouseDown(modal);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('should handle API error during deletion', async () => {
    vi.mocked(deleteCommentAsAdmin).mockRejectedValue(new Error('API Error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');

    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error deleting comment', expect.any(Error));
    expect(mockOnUpdate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('should hide toast after timeout', async () => {
    vi.mocked(deleteCommentAsAdmin).mockResolvedValue({});

    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');

    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    expect(screen.getByTestId('toast')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  test('should render default avatar when no avatar provided', () => {
    render(
      <CommentModerationModal
        comments={mockComments}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const avatars = screen.getAllByAltText('avatar');
    expect(avatars).toHaveLength(2);

    // Second comment has no avatar URL, should use default
    expect(avatars[1]).toHaveAttribute('src', expect.stringContaining('avatar.webp'));
  });
});
