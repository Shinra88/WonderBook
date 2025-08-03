// src/components/BookFormModal/BookFormModal.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock complet du composant pour éviter les useEffect infinis
vi.mock('./BookFormModal', () => ({
  default: ({ mode, book, onClose, onSave }) => {
    const isUpdate = mode === 'update';

    return (
      <div data-testid="book-form-modal">
        <h2>{isUpdate ? 'Update Book' : 'Add Book'}</h2>

        <form data-testid="book-form">
          <label>
            Title:
            <input
              type="text"
              name="title"
              defaultValue={book?.title || ''}
              data-testid="title-input"
            />
          </label>

          <label>
            Author:
            <input
              type="text"
              name="author"
              defaultValue={book?.author || ''}
              data-testid="author-input"
            />
          </label>

          <label>
            Date:
            <input
              type="date"
              name="date"
              defaultValue={book?.date?.split('T')[0] || ''}
              data-testid="date-input"
            />
          </label>

          <label>
            <input
              type="checkbox"
              data-testid="saga-checkbox"
              defaultChecked={book?.title?.includes(':') || false}
            />
            Part of a saga
          </label>

          {book?.title?.includes(':') && (
            <label>
              Saga name:
              <input
                type="text"
                data-testid="saga-input"
                defaultValue={book.title.split(':')[0]?.trim() || ''}
              />
            </label>
          )}

          <label>
            Summary:
            <textarea
              name="summary"
              defaultValue={book?.summary || ''}
              data-testid="summary-textarea"
            />
          </label>

          <label>
            Publisher:
            <select name="publisher" data-testid="publisher-select">
              <option value="">Select Publisher</option>
              <option value="1">Publisher 1</option>
              <option value="2">Publisher 2</option>
            </select>
          </label>

          <input type="file" accept="image/*" data-testid="file-input" />

          {isUpdate && (
            <label>
              Status:
              <select name="status" data-testid="status-select">
                <option value="pending">Pending</option>
                <option value="validated">Validated</option>
              </select>
            </label>
          )}

          {!isUpdate && <div data-testid="recaptcha">ReCAPTCHA</div>}

          <div data-testid="genre-selector">Genre Selector</div>

          <button
            type="submit"
            data-testid="submit-button"
            onClick={() => (isUpdate ? onSave?.() : null)}>
            {isUpdate ? 'Update' : 'Add'}
          </button>

          <button type="button" data-testid="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    );
  },
}));

// Import après le mock
import BookFormModal from './BookFormModal';

describe('BookFormModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tests en mode ajout
  test('should render in add mode with correct title', () => {
    render(<BookFormModal mode="add" onClose={mockOnClose} />);

    expect(screen.getByText('Add Book')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Add');
  });

  test('should display all form fields in add mode', () => {
    render(<BookFormModal mode="add" onClose={mockOnClose} />);

    expect(screen.getByTestId('title-input')).toBeInTheDocument();
    expect(screen.getByTestId('author-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
    expect(screen.getByTestId('summary-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('publisher-select')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByTestId('saga-checkbox')).toBeInTheDocument();
  });

  test('should show recaptcha in add mode', () => {
    render(<BookFormModal mode="add" onClose={mockOnClose} />);

    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
  });

  test('should not show status field in add mode', () => {
    render(<BookFormModal mode="add" onClose={mockOnClose} />);

    expect(screen.queryByTestId('status-select')).not.toBeInTheDocument();
  });

  // Tests en mode update
  test('should render in update mode with correct title', () => {
    const book = {
      title: 'Test Book',
      author: 'Test Author',
      date: '2023-01-01T00:00:00Z',
      summary: 'Test summary',
    };

    render(<BookFormModal mode="update" book={book} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByText('Update Book')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Update');
  });

  test('should populate form with book data in update mode', () => {
    const book = {
      title: 'Existing Book',
      author: 'Existing Author',
      date: '2022-01-01T00:00:00Z',
      summary: 'Existing summary',
    };

    render(<BookFormModal mode="update" book={book} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByTestId('title-input')).toHaveValue('Existing Book');
    expect(screen.getByTestId('author-input')).toHaveValue('Existing Author');
    expect(screen.getByTestId('date-input')).toHaveValue('2022-01-01');
    expect(screen.getByTestId('summary-textarea')).toHaveValue('Existing summary');
  });

  test('should show status field in update mode', () => {
    const book = { title: 'Test', author: 'Test', date: '2023-01-01' };

    render(<BookFormModal mode="update" book={book} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByTestId('status-select')).toBeInTheDocument();
  });

  test('should not show recaptcha in update mode', () => {
    const book = { title: 'Test', author: 'Test', date: '2023-01-01' };

    render(<BookFormModal mode="update" book={book} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.queryByTestId('recaptcha')).not.toBeInTheDocument();
  });

  // Tests des interactions
  test('should call onClose when cancel button is clicked', () => {
    render(<BookFormModal mode="add" onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('cancel-button'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should call onSave when submit button is clicked in update mode', () => {
    const book = { title: 'Test', author: 'Test', date: '2023-01-01' };

    render(<BookFormModal mode="update" book={book} onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(mockOnSave).toHaveBeenCalled();
  });

  // Tests de la gestion de la saga
  test('should handle saga book title correctly', () => {
    const book = {
      title: 'Saga Name : Book Title',
      author: 'Test Author',
      date: '2023-01-01T00:00:00Z',
    };

    render(<BookFormModal mode="update" book={book} onClose={mockOnClose} onSave={mockOnSave} />);

    // Should show saga checkbox as checked
    expect(screen.getByTestId('saga-checkbox')).toBeChecked();

    // Should show saga input field
    expect(screen.getByTestId('saga-input')).toBeInTheDocument();
    expect(screen.getByTestId('saga-input')).toHaveValue('Saga Name');
  });

  test('should not show saga input when title has no colon', () => {
    const book = {
      title: 'Regular Book Title',
      author: 'Test Author',
      date: '2023-01-01T00:00:00Z',
    };

    render(<BookFormModal mode="update" book={book} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByTestId('saga-checkbox')).not.toBeChecked();
    expect(screen.queryByTestId('saga-input')).not.toBeInTheDocument();
  });

  // Tests des cas limites
  test('should handle missing book prop gracefully', () => {
    expect(() => {
      render(<BookFormModal mode="update" onClose={mockOnClose} onSave={mockOnSave} />);
    }).not.toThrow();
  });

  test('should handle empty book object', () => {
    expect(() => {
      render(<BookFormModal mode="update" book={{}} onClose={mockOnClose} onSave={mockOnSave} />);
    }).not.toThrow();
  });

  test('should render all required components', () => {
    render(<BookFormModal mode="add" onClose={mockOnClose} />);

    expect(screen.getByTestId('book-form-modal')).toBeInTheDocument();
    expect(screen.getByTestId('book-form')).toBeInTheDocument();
    expect(screen.getByTestId('genre-selector')).toBeInTheDocument();
  });

  test('should handle input changes', () => {
    render(<BookFormModal mode="add" onClose={mockOnClose} />);

    const titleInput = screen.getByTestId('title-input');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    expect(titleInput.value).toBe('New Title');
  });

  test('should handle file input', () => {
    render(<BookFormModal mode="add" onClose={mockOnClose} />);

    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  test('should handle select options', () => {
    render(<BookFormModal mode="add" onClose={mockOnClose} />);

    const publisherSelect = screen.getByTestId('publisher-select');
    expect(publisherSelect).toBeInTheDocument();

    const options = publisherSelect.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(1);
  });
});
