// BestRatedBooks.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, test, vi, beforeEach, expect } from 'vitest';
import BestRatedBooks from './BestRatedBooks';

// Mocks
vi.mock('../../../hooks/customHooks', () => ({
  useBestRatedBooks: vi.fn()
}));
vi.mock('../../../hooks/filterContext', () => ({
  useFilters: vi.fn()
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'BookDisplay.Loading': 'Loading...',
      'BookDisplay.NoBooksFound': 'No books found'
    }[key] || key)
  })
}));

// Mock du composant BookDisplay
vi.mock('../BookDisplay/BookDisplay', () => ({
  __esModule: true,
  default: ({ book }) => <div data-testid="book-display">{book.title}</div>
}));

// Références aux hooks
import { useBestRatedBooks } from '../../../hooks/customHooks';
import { useFilters } from '../../../hooks/filterContext';

describe('BestRatedBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useFilters.mockReturnValue({
      selectedCategories: [],
      selectedYear: '',
      selectedType: 'et'
    });
  });

  test('affiche le message de chargement', () => {
    useBestRatedBooks.mockReturnValue({
      bestRatedBooks: [],
      loading: true
    });

    render(<BestRatedBooks />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('affiche les livres quand ils sont chargés', () => {
    useBestRatedBooks.mockReturnValue({
      bestRatedBooks: [{ bookId: 1, title: 'Book One' }, { bookId: 2, title: 'Book Two' }],
      loading: false
    });

    render(<BestRatedBooks />);
    const books = screen.getAllByTestId('book-display');
    expect(books).toHaveLength(2);
    expect(screen.getByText('Book One')).toBeInTheDocument();
    expect(screen.getByText('Book Two')).toBeInTheDocument();
  });

  test('affiche le message "No books found" si aucun livre', () => {
    useBestRatedBooks.mockReturnValue({
      bestRatedBooks: [],
      loading: false
    });

    render(<BestRatedBooks />);
    expect(screen.getByText('No books found')).toBeInTheDocument();
  });
});
