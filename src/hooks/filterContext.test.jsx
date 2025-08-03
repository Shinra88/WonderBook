import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FilterProvider, useFilters } from './filterContext';

// Composant de test pour utiliser le hook
function TestComponent() {
  const {
    selectedCategories,
    setSelectedCategories,
    selectedYear,
    setSelectedYear,
    selectedType,
    setSelectedType,
    minYear,
    setMinYear,
    currentYear,
    searchQuery,
    setSearchQuery,
    filterRead,
    setFilterRead
  } = useFilters();

  return (
    <div>
      <div data-testid="selected-categories">
        Categories: {JSON.stringify(selectedCategories)}
      </div>
      <div data-testid="selected-year">
        Year: {selectedYear || 'empty'}
      </div>
      <div data-testid="selected-type">
        Type: {selectedType}
      </div>
      <div data-testid="min-year">
        MinYear: {minYear}
      </div>
      <div data-testid="current-year">
        CurrentYear: {currentYear}
      </div>
      <div data-testid="search-query">
        Search: {searchQuery || 'empty'}
      </div>
      <div data-testid="filter-read">
        FilterRead: {filterRead.toString()}
      </div>
      
      {/* Boutons pour tester les setters */}
      <button 
        data-testid="set-categories"
        onClick={() => setSelectedCategories(['fiction', 'sci-fi'])}
      >
        Set Categories
      </button>
      <button 
        data-testid="set-year"
        onClick={() => setSelectedYear('2023')}
      >
        Set Year
      </button>
      <button 
        data-testid="set-type"
        onClick={() => setSelectedType('et')}
      >
        Set Type
      </button>
      <button 
        data-testid="set-min-year"
        onClick={() => setMinYear(2000)}
      >
        Set Min Year
      </button>
      <button 
        data-testid="set-search"
        onClick={() => setSearchQuery('test search')}
      >
        Set Search
      </button>
      <button 
        data-testid="set-filter-read"
        onClick={() => setFilterRead(true)}
      >
        Set Filter Read
      </button>
    </div>
  );
}

// Helper pour render avec le provider
const renderWithFilters = (component) => {
  return render(
    <FilterProvider>
      {component}
    </FilterProvider>
  );
};

describe('FilterContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date pour avoir un currentYear stable
    vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendu initial', () => {
    test('should render FilterProvider without crashing', () => {
      renderWithFilters(<TestComponent />);
      
      expect(screen.getByTestId('selected-categories')).toBeInTheDocument();
    });

    test('should have correct initial values', () => {
      renderWithFilters(<TestComponent />);
      
      expect(screen.getByTestId('selected-categories')).toHaveTextContent('Categories: []');
      expect(screen.getByTestId('selected-year')).toHaveTextContent('Year: empty');
      expect(screen.getByTestId('selected-type')).toHaveTextContent('Type: ou');
      expect(screen.getByTestId('min-year')).toHaveTextContent('MinYear: 1900');
      expect(screen.getByTestId('current-year')).toHaveTextContent('CurrentYear: 2024');
      expect(screen.getByTestId('search-query')).toHaveTextContent('Search: empty');
      expect(screen.getByTestId('filter-read')).toHaveTextContent('FilterRead: false');
    });
  });

  describe('selectedCategories state', () => {
    test('should update selectedCategories', () => {
      renderWithFilters(<TestComponent />);
      
      const button = screen.getByTestId('set-categories');
      act(() => {
        fireEvent.click(button);
      });
      
      expect(screen.getByTestId('selected-categories')).toHaveTextContent('Categories: ["fiction","sci-fi"]');
    });

    test('should start with empty array', () => {
      renderWithFilters(<TestComponent />);
      
      expect(screen.getByTestId('selected-categories')).toHaveTextContent('Categories: []');
    });
  });

  describe('selectedYear state', () => {
    test('should update selectedYear', () => {
      renderWithFilters(<TestComponent />);
      
      const button = screen.getByTestId('set-year');
      act(() => {
        fireEvent.click(button);
      });
      
      expect(screen.getByTestId('selected-year')).toHaveTextContent('Year: 2023');
    });

    test('should start with empty string', () => {
      renderWithFilters(<TestComponent />);
      
      expect(screen.getByTestId('selected-year')).toHaveTextContent('Year: empty');
    });
  });

  describe('selectedType state', () => {
    test('should update selectedType', () => {
      renderWithFilters(<TestComponent />);
      
      const button = screen.getByTestId('set-type');
      act(() => {
        fireEvent.click(button);
      });
      
      expect(screen.getByTestId('selected-type')).toHaveTextContent('Type: et');
    });

    test('should start with "ou"', () => {
      renderWithFilters(<TestComponent />);
      
      expect(screen.getByTestId('selected-type')).toHaveTextContent('Type: ou');
    });
  });

  describe('minYear state', () => {
    test('should update minYear', () => {
      renderWithFilters(<TestComponent />);
      
      const button = screen.getByTestId('set-min-year');
      act(() => {
        fireEvent.click(button);
      });
      
      expect(screen.getByTestId('min-year')).toHaveTextContent('MinYear: 2000');
    });

    test('should start with 1900', () => {
      renderWithFilters(<TestComponent />);
      
      expect(screen.getByTestId('min-year')).toHaveTextContent('MinYear: 1900');
    });
  });

  describe('currentYear (computed value)', () => {
    test('should return current year', () => {
      renderWithFilters(<TestComponent />);
      
      expect(screen.getByTestId('current-year')).toHaveTextContent('CurrentYear: 2024');
    });

    test('should use real Date if not mocked', () => {
      // Restaurer le mock pour ce test
      vi.restoreAllMocks();
      
      renderWithFilters(<TestComponent />);
      
      const actualYear = new Date().getFullYear();
      expect(screen.getByTestId('current-year')).toHaveTextContent(`CurrentYear: ${actualYear}`);
    });
  });

  describe('searchQuery state', () => {
    test('should update searchQuery', () => {
      renderWithFilters(<TestComponent />);
      
      const button = screen.getByTestId('set-search');
      act(() => {
        fireEvent.click(button);
      });
      
      expect(screen.getByTestId('search-query')).toHaveTextContent('Search: test search');
    });

    test('should start with empty string', () => {
      renderWithFilters(<TestComponent />);
      
      expect(screen.getByTestId('search-query')).toHaveTextContent('Search: empty');
    });
  });

  describe('filterRead state', () => {
    test('should update filterRead', () => {
      renderWithFilters(<TestComponent />);
      
      const button = screen.getByTestId('set-filter-read');
      act(() => {
        fireEvent.click(button);
      });
      
      expect(screen.getByTestId('filter-read')).toHaveTextContent('FilterRead: true');
    });

    test('should start with false', () => {
      renderWithFilters(<TestComponent />);
      
      expect(screen.getByTestId('filter-read')).toHaveTextContent('FilterRead: false');
    });
  });

  describe('Multiple state updates', () => {
    test('should handle multiple simultaneous updates', () => {
      renderWithFilters(<TestComponent />);
      
      act(() => {
        fireEvent.click(screen.getByTestId('set-categories'));
        fireEvent.click(screen.getByTestId('set-year'));
        fireEvent.click(screen.getByTestId('set-type'));
        fireEvent.click(screen.getByTestId('set-search'));
        fireEvent.click(screen.getByTestId('set-filter-read'));
      });
      
      expect(screen.getByTestId('selected-categories')).toHaveTextContent('Categories: ["fiction","sci-fi"]');
      expect(screen.getByTestId('selected-year')).toHaveTextContent('Year: 2023');
      expect(screen.getByTestId('selected-type')).toHaveTextContent('Type: et');
      expect(screen.getByTestId('search-query')).toHaveTextContent('Search: test search');
      expect(screen.getByTestId('filter-read')).toHaveTextContent('FilterRead: true');
    });
  });

  describe('Context value structure', () => {
    test('should provide all expected values and setters', () => {
      renderWithFilters(<TestComponent />);
      
      // Vérifier que tous les éléments sont présents
      expect(screen.getByTestId('selected-categories')).toBeInTheDocument();
      expect(screen.getByTestId('selected-year')).toBeInTheDocument();
      expect(screen.getByTestId('selected-type')).toBeInTheDocument();
      expect(screen.getByTestId('min-year')).toBeInTheDocument();
      expect(screen.getByTestId('current-year')).toBeInTheDocument();
      expect(screen.getByTestId('search-query')).toBeInTheDocument();
      expect(screen.getByTestId('filter-read')).toBeInTheDocument();
      
      // Vérifier que tous les boutons (setters) sont présents
      expect(screen.getByTestId('set-categories')).toBeInTheDocument();
      expect(screen.getByTestId('set-year')).toBeInTheDocument();
      expect(screen.getByTestId('set-type')).toBeInTheDocument();
      expect(screen.getByTestId('set-min-year')).toBeInTheDocument();
      expect(screen.getByTestId('set-search')).toBeInTheDocument();
      expect(screen.getByTestId('set-filter-read')).toBeInTheDocument();
    });
  });
});