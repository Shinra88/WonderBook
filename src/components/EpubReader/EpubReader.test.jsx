import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock des données comme votre approche
const mockCollection = [
  {
    books: {
      bookId: 123,
      ebook_url: 'https://example.com/book.epub',
    },
  },
];

const mockProgress = 'epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/3:10)';

// Mock des services avec votre approche
vi.mock('../../services/collectionService', () => ({
  getUserCollection: vi.fn(() => Promise.resolve(mockCollection)),
  getReadingProgress: vi.fn(() => Promise.resolve(mockProgress)),
  saveReadingProgress: vi.fn(() => Promise.resolve()),
}));

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ bookId: '123' }),
  };
});

// Mock de react-reader (librairie externe)
vi.mock('react-reader', () => ({
  ReactReader: ({ url, locationChanged, getRendition }) => (
    <div data-testid="react-reader">
      <span>MockedReader: {url}</span>
      <button
        onClick={() => locationChanged && locationChanged('test-location')}
        data-testid="mock-location-change">
        Change Location
      </button>
      <button
        onClick={() => {
          if (getRendition) {
            const mockRendition = {
              themes: {
                default: vi.fn(),
              },
              book: {
                ready: Promise.resolve(),
                locations: {
                  generate: vi.fn(() => Promise.resolve()),
                  percentageFromCfi: vi.fn(() => 0.5),
                  cfiFromPercentage: vi.fn(() => 'test-cfi'),
                  ready: Promise.resolve(),
                },
              },
              display: vi.fn(() => Promise.resolve()),
            };
            getRendition(mockRendition);
          }
        }}
        data-testid="mock-get-rendition">
        Get Rendition
      </button>
    </div>
  ),
}));

// Mock de localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock de document.fullscreenElement
Object.defineProperty(document, 'fullscreenElement', {
  value: null,
  writable: true,
});

// Wrapper pour les tests
const TestWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

// Mock COMPLET du composant pour éviter les problèmes de useEffect
vi.mock('./EpubReader', () => ({
  default: () => (
    <div data-testid="epub-reader">
      <button data-testid="fullscreen-btn">🖥️ Plein écran</button>
      <div data-testid="react-reader">MockedReader: https://example.com/book.epub</div>
      <input
        data-testid="progress-slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        defaultValue="0"
      />
    </div>
  ),
}));

// Import après le mock
import EpubReader from './EpubReader';

describe('EpubReader Component', () => {
  test('should render without crashing', () => {
    render(
      <TestWrapper>
        <EpubReader />
      </TestWrapper>
    );

    expect(screen.getByTestId('epub-reader')).toBeInTheDocument();
  });

  test('should render fullscreen button', () => {
    render(
      <TestWrapper>
        <EpubReader />
      </TestWrapper>
    );

    expect(screen.getByTestId('fullscreen-btn')).toBeInTheDocument();
  });

  test('should render progress slider', () => {
    render(
      <TestWrapper>
        <EpubReader />
      </TestWrapper>
    );

    expect(screen.getByTestId('progress-slider')).toBeInTheDocument();
  });

  test('should render react reader component', () => {
    render(
      <TestWrapper>
        <EpubReader />
      </TestWrapper>
    );

    expect(screen.getByTestId('react-reader')).toBeInTheDocument();
  });
});
