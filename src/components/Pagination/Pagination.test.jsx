// src/components/Pagination/Pagination.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'Pagination.Previous': 'Previous',
        'Pagination.Next': 'Next',
      };
      return translations[key] || key;
    },
  }),
}));

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onPageChange.mockClear();
  });

  test('should render without crashing', () => {
    const { container } = render(<Pagination {...defaultProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  test('should display current page information', () => {
    render(<Pagination {...defaultProps} currentPage={3} totalPages={5} />);

    // Le texte exact basé sur le composant : "Page 3 / 5"
    expect(screen.getByText('Page 3 / 5')).toBeInTheDocument();
  });

  test('should render navigation buttons with correct text', () => {
    render(<Pagination {...defaultProps} />);

    // Vérifier les boutons avec les icônes et textes
    expect(screen.getByText(/◀ Previous/)).toBeInTheDocument();
    expect(screen.getByText(/Next ▶/)).toBeInTheDocument();
  });

  test('should disable previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    const prevButton = screen.getByText(/◀ Previous/);
    expect(prevButton.disabled).toBe(true);
  });

  test('should disable next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);

    const nextButton = screen.getByText(/Next ▶/);
    expect(nextButton.disabled).toBe(true);
  });

  test('should enable both buttons on middle pages', () => {
    render(<Pagination {...defaultProps} currentPage={3} totalPages={5} />);

    const prevButton = screen.getByText(/◀ Previous/);
    const nextButton = screen.getByText(/Next ▶/);

    expect(prevButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(false);
  });

  test('should call onPageChange with correct page when clicking previous', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    const prevButton = screen.getByText(/◀ Previous/);
    fireEvent.click(prevButton);

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  test('should call onPageChange with correct page when clicking next', () => {
    render(<Pagination {...defaultProps} currentPage={2} />);

    const nextButton = screen.getByText(/Next ▶/);
    fireEvent.click(nextButton);

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  test('should not call onPageChange when clicking disabled previous button', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    const prevButton = screen.getByText(/◀ Previous/);
    fireEvent.click(prevButton);

    // Ne devrait pas être appelé car le bouton est disabled
    expect(defaultProps.onPageChange).not.toHaveBeenCalled();
  });

  test('should not call onPageChange when clicking disabled next button', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);

    const nextButton = screen.getByText(/Next ▶/);
    fireEvent.click(nextButton);

    // Ne devrait pas être appelé car le bouton est disabled
    expect(defaultProps.onPageChange).not.toHaveBeenCalled();
  });

  test('should handle single page correctly', () => {
    render(<Pagination {...defaultProps} currentPage={1} totalPages={1} />);

    const prevButton = screen.getByText(/◀ Previous/);
    const nextButton = screen.getByText(/Next ▶/);

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(screen.getByText('Page 1 / 1')).toBeInTheDocument();
  });

  test('should have correct CSS class structure', () => {
    render(<Pagination {...defaultProps} />);

    const pagination = document.querySelector('[class*="pagination"]');
    expect(pagination).toBeTruthy();

    const buttons = pagination.querySelectorAll('button');
    expect(buttons.length).toBe(2);

    const span = pagination.querySelector('span');
    expect(span).toBeTruthy();
  });

  test('should display correct page format for different numbers', () => {
    render(<Pagination {...defaultProps} currentPage={10} totalPages={100} />);

    expect(screen.getByText('Page 10 / 100')).toBeInTheDocument();
  });
});
