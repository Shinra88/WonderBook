import { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedType, setSelectedType] = useState('ou');
  const [minYear, setMinYear] = useState(1900);
  const [searchQuery, setSearchQuery] = useState('');
  const currentYear = new Date().getFullYear();
  const [filterRead, setFilterRead] = useState(false);

  return (
    <FilterContext.Provider
      value={{
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
        setFilterRead,
      }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext);
}
