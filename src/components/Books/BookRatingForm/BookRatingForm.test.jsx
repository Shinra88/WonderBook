// src/components/Books/BookRatingForm/BookRatingForm.test.jsx - VERSION SIMPLIFIÉE
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock complet et simple
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    formState: { dirtyFields: {} },
    handleSubmit: vi.fn(fn => fn),
  }),
}));

vi.mock('../../../utils/helpers', () => ({
  generateStarsInputs: () => <div data-testid="star-inputs">Stars</div>,
  displayStars: () => <div data-testid="display-stars">★★★</div>,
}));

vi.mock('../../../utils/constants', () => ({
  APP_ROUTES: { SIGN_IN: '/signin' },
}));

vi.mock('../../../hooks/customHooks', () => ({
  useUser: () => ({ connectedUser: {}, auth: true }),
}));

vi.mock('../../../services/bookService', () => ({
  rateBook: () => Promise.resolve({}),
}));

import BookRatingForm from './BookRatingForm';

const RouterWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('BookRatingForm Component', () => {
  const defaultProps = {
    rating: 3,
    setRating: vi.fn(),
    userId: 'user123',
    setBook: vi.fn(),
    id: 'book456',
    userRated: false,
  };

  test('should render without crashing', () => {
    const { container } = render(
      <RouterWrapper>
        <BookRatingForm {...defaultProps} />
      </RouterWrapper>
    );
    expect(container.firstChild).toBeTruthy();
  });

  test('should render star inputs when user has not rated', () => {
    render(
      <RouterWrapper>
        <BookRatingForm {...defaultProps} userRated={false} />
      </RouterWrapper>
    );

    expect(screen.getByTestId('star-inputs')).toBeInTheDocument();
  });

  test('should render display stars when user has rated', () => {
    render(
      <RouterWrapper>
        <BookRatingForm {...defaultProps} userRated={true} />
      </RouterWrapper>
    );

    expect(screen.getByTestId('display-stars')).toBeInTheDocument();
  });

  test('should show validate button when user has not rated', () => {
    render(
      <RouterWrapper>
        <BookRatingForm {...defaultProps} userRated={false} />
      </RouterWrapper>
    );

    expect(screen.getByText('BookDisplay.Validate')).toBeInTheDocument();
  });

  test('should not show validate button when user has rated', () => {
    render(
      <RouterWrapper>
        <BookRatingForm {...defaultProps} userRated={true} />
      </RouterWrapper>
    );

    expect(screen.queryByText('BookDisplay.Validate')).not.toBeInTheDocument();
  });

  test('should show different message based on rating', () => {
    const { rerender } = render(
      <RouterWrapper>
        <BookRatingForm {...defaultProps} rating={0} />
      </RouterWrapper>
    );

    expect(screen.getByText('BookDisplay.RateThisBook')).toBeInTheDocument();

    rerender(
      <RouterWrapper>
        <BookRatingForm {...defaultProps} rating={4} />
      </RouterWrapper>
    );

    expect(screen.getByText('BookDisplay.YourRating')).toBeInTheDocument();
  });

  test('should render form element', () => {
    render(
      <RouterWrapper>
        <BookRatingForm {...defaultProps} />
      </RouterWrapper>
    );

    expect(document.querySelector('form')).toBeInTheDocument();
  });

  test('should handle different rating values', () => {
    render(
      <RouterWrapper>
        <BookRatingForm {...defaultProps} rating={5} />
      </RouterWrapper>
    );

    expect(screen.getByText('BookDisplay.YourRating')).toBeInTheDocument();
  });
});
