import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Book from './Book';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Constantes pour éviter les nouvelles références
const mockUser = { role: 'user' };

const mockCollection = [{ bookId: '123' }];

const mockBook = {
  bookId: '123',
  title: 'Test Book',
  cover_url: 'test.jpg',
  comments: [
    {
      commentId: '1',
      content: 'Excellent!',
      created_at: new Date().toISOString(),
      rating: 4,
      user: { name: 'Alice', avatar: null },
    },
  ],
};

// Mocks des hooks et services
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key }),
}));

vi.mock('../../services/bookService', () => ({
  getBookByTitle: vi.fn(() => Promise.resolve(mockBook)),
  updateBookInfo: vi.fn(),
}));

vi.mock('../../services/collectionService', () => ({
  addBookToCollection: vi.fn(),
  removeBookFromCollection: vi.fn(),
  getUserCollection: vi.fn(() => Promise.resolve(mockCollection)),
}));

vi.mock('../../components/Books/BookDisplay/BookDisplay', () => ({
  default: ({ book }) => <div data-testid="book-display">{book.title}</div>,
}));

vi.mock('../../components/ToastSuccess/ToastSuccess', () => ({
  __esModule: true,
  default: ({ message }) => <div data-testid="toast">{message}</div>,
}));

vi.mock('../../components/BackArrow/BackArrow', () => ({
  default: () => <div data-testid="back-arrow">←</div>,
}));

vi.mock('../../modals/BookFormModal/BookFormModal', () => ({
  default: () => <div data-testid="book-form-modal">Edit Modal</div>,
}));

vi.mock('../../modals/CommentModerationModal/CommentModerationModal', () => ({
  default: () => <div data-testid="comment-moderation-modal">Moderation Modal</div>,
}));

describe('Book Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (route = '/book/Test-Book') =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/book/:title" element={<Book />} />
        </Routes>
      </MemoryRouter>
    );

  test('renders loading message initially', () => {
    renderPage();
    expect(screen.getByText('Book.Loading')).toBeInTheDocument();
  });

  test('renders book info when loaded', async () => {
    renderPage();
    await screen.findByTestId('book-display');
    expect(screen.getByText('Test Book')).toBeInTheDocument();
  });

  test('renders add/remove collection button based on collection state', async () => {
    renderPage();
    await screen.findByTestId('book-display');
    expect(screen.getByRole('button', { name: /Book.RemoveFromCollection/i })).toBeInTheDocument();
  });

  test('displays back arrow', async () => {
    renderPage();
    await screen.findByTestId('back-arrow');
    expect(screen.getByTestId('back-arrow')).toBeInTheDocument();
  });

  test('shows commercial links', async () => {
    renderPage();
    await screen.findByText('Book.WhereToBuy');
    expect(screen.getByText(/Amazon/i)).toBeInTheDocument();
    expect(screen.getByText(/Fnac/i)).toBeInTheDocument();
  });

  test('displays comments section toggle', async () => {
    renderPage();
    const toggle = await screen.findByRole('button', { name: /Book.ShowComments/i });
    expect(toggle).toBeInTheDocument();
  });

  test('shows comments when toggle clicked', async () => {
    renderPage();
    const toggle = await screen.findByRole('button', { name: /Book.ShowComments/i });
    fireEvent.click(toggle);
    expect(await screen.findByText(/Excellent!/i)).toBeInTheDocument();
  });

  test('renders avatar even when missing', async () => {
    renderPage();
    const toggle = await screen.findByRole('button', { name: /Book.ShowComments/i });
    fireEvent.click(toggle);
    expect(screen.getByAltText('Avatar')).toBeInTheDocument();
  });

  test('shows comment author and date', async () => {
    renderPage();
    const toggle = await screen.findByRole('button', { name: /Book.ShowComments/i });
    fireEvent.click(toggle);
    expect(await screen.findByText(/Alice/)).toBeInTheDocument();
  });

  test('shows "not found" if no book', async () => {
    const { getBookByTitle } = await import('../../services/bookService');
    vi.mocked(getBookByTitle).mockResolvedValueOnce(null);

    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Book.NotFound')).toBeInTheDocument();
    });
  });

  test('handles error in fetch gracefully', async () => {
    // Mock console.error pour éviter les logs d'erreur dans les tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { getBookByTitle } = await import('../../services/bookService');
    vi.mocked(getBookByTitle).mockRejectedValueOnce(new Error('fail'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Book.NotFound')).toBeInTheDocument();
    });

    // Restaurer console.error
    consoleSpy.mockRestore();
  });

  test('does not render admin buttons for regular user', async () => {
    renderPage();
    await screen.findByTestId('book-display');
    expect(screen.queryByText('Book.EditBook')).not.toBeInTheDocument();
  });
});
