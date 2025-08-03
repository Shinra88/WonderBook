// src/pages/Home/Home.test.jsx
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';

// Mock toutes les images
vi.mock('../../images/library.webp', () => ({ default: 'library.webp' }));

// Mock tous les hooks personnalisés
vi.mock('../../hooks/customHooks', () => ({
  useBestRatedBooks: () => ({
    bestRatedBooks: [{ bookId: '1', title: 'Best Book 1', status: 'validated' }],
    loading: false,
  }),
  useLastAddedBooks: () => ({
    lastAddedBooks: [{ bookId: '2', title: 'Last Book 1', status: 'validated' }],
    loading: false,
  }),
  useFilteredBooks: () => ({
    books: [
      { bookId: '3', title: 'Book 1', status: 'validated' },
      { bookId: '4', title: 'Book 2', status: 'pending' },
    ],
    total: 20,
    loading: false,
  }),
}));

// Mock filterContext
vi.mock('../../hooks/filterContext', () => ({
  useFilters: () => ({
    selectedCategories: ['Fiction'],
    selectedYear: '2023',
    selectedType: 'et',
    searchQuery: '',
  }),
}));

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      role: 'user',
    },
  }),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

// Mock des composants
vi.mock('../../components/Books/BookDisplay/BookDisplay', () => ({
  default: ({ book }) => <div data-testid="book-display">{book.title}</div>,
}));

vi.mock('../../components/Books/BestRatedBooks/BestRatedBooks', () => ({
  default: ({ books }) => <div data-testid="best-rated">{books?.length || 0} best books</div>,
}));

vi.mock('../../components/Books/LastBook/LastBook', () => ({
  default: ({ lastAddedBooks }) => (
    <div data-testid="last-book">{lastAddedBooks?.length || 0} last books</div>
  ),
}));

vi.mock('../../components/Pagination/Pagination', () => ({
  default: ({ currentPage, totalPages }) => (
    <div data-testid="pagination">
      Page {currentPage} of {totalPages}
    </div>
  ),
}));

import Home from './Home';

describe('Home Page', () => {
  test('should render without crashing', () => {
    render(<Home />);
    expect(document.body).toBeInTheDocument();
  });

  test('should display main elements', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /homepage.title/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /homepage.filter/i })).toBeInTheDocument();
  });

  test('should show tab navigation for regular users', () => {
    render(<Home />);

    expect(screen.getByRole('button', { name: /homepage.lastadded/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /homepage.bestrated/i })).toBeInTheDocument();
  });

  test('should display books', () => {
    render(<Home />);

    expect(screen.getByTestId('book-display')).toBeInTheDocument();
    expect(screen.getByText('Book 1')).toBeInTheDocument();
  });

  test('should show pagination', () => {
    render(<Home />);

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  test('should switch between tabs', async () => {
    render(<Home />);

    const bestRatedTab = screen.getByRole('button', { name: /homepage.bestrated/i });

    await act(async () => {
      fireEvent.click(bestRatedTab);
    });

    expect(screen.getByTestId('best-rated')).toBeInTheDocument();
  });

  test('should display filters information', () => {
    render(<Home />);

    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  test('should show up page link', () => {
    render(<Home />);

    expect(screen.getByRole('link', { name: /homepage.uppage/i })).toBeInTheDocument();
  });
});
