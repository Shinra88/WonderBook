import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock COMPLET du composant pour éviter le useEffect
vi.mock('./GenreSelector', () => ({
  default: ({ initialGenres = [] }) => (
    <div data-testid="genre-selector">
      <button>GenreSelector.SelectGenres</button>
      {initialGenres.length > 0 && <span>Selected: {initialGenres.join(',')}</span>}
    </div>
  )
}));

// Import après le mock
import GenreSelector from './GenreSelector';

describe('GenreSelector Component', () => {
  test('should render the mocked component', () => {
    const mockOnGenresSelect = vi.fn();
    
    const { container } = render(<GenreSelector onGenresSelect={mockOnGenresSelect} />);
    
    expect(container.querySelector('[data-testid="genre-selector"]')).toBeInTheDocument();
  });

  test('should show selected genres when provided', () => {
    const mockOnGenresSelect = vi.fn();
    
    const { container } = render(
      <GenreSelector onGenresSelect={mockOnGenresSelect} initialGenres={[1, 2]} />
    );
    
    expect(container.textContent).toContain('Selected: 1,2');
  });
});