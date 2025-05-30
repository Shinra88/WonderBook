import React, { useState, useRef, useEffect } from 'react';
import styles from './DropdownYear.module.css';
import { useYears } from '../../hooks/useYears';
import { useFilters } from '../../hooks/filterContext';

function DropdownYear({ isActive = false }) {
  const { minYear, currentYear } = useYears();

  const {
    selectedYear,
    setSelectedYear
  } = useFilters();

  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState(
    typeof selectedYear === 'object' ? 'tranche' : 'unique'
  );
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleUniqueChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setSelectedYear(val); // toujours mettre à jour la saisie pour afficher ce qu'on tape
  };
  

  const handleRangeChange = (field, value) => {
    const newVal = value.replace(/\D/g, '').slice(0, 4);
    const newRange = { ...range, [field]: newVal };
    setSelectedYear(newRange); // tu updates quoiqu’il arrive pour voir la saisie
  
    // Si les deux sont valides, tu vérifies ensuite
    if (
      newRange.start.length === 4 &&
      newRange.end.length === 4 &&
      parseInt(newRange.start) >= minYear &&
      parseInt(newRange.end) <= currentYear &&
      parseInt(newRange.start) <= parseInt(newRange.end)
    ) {
      setSelectedYear(newRange);
    }
  };  

  const range = typeof selectedYear === 'object' ? selectedYear : { start: '', end: '' };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button
        className={`${styles.dropdownButton} ${isActive ? styles.activeFilter : ''}`}
        type="button"
        onClick={toggleDropdown}
      >
        Années
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.filterToggle}>
            <label>
              <input
                type="radio"
                value="unique"
                checked={filterType === 'unique'}
                onChange={() => {
                  setFilterType('unique');
                  setSelectedYear('');
                }}
              />
              Unique
            </label>
            <label>
              <input
                type="radio"
                value="tranche"
                checked={filterType === 'tranche'}
                onChange={() => {
                  setFilterType('tranche');
                  setSelectedYear({ start: '', end: '' });
                }}
              />
              Tranche
            </label>
          </div>

          {filterType === 'unique' && (
            <div className={styles.rangeInputs}>
            <input
              type="number"
              placeholder="Année"
              min={minYear}
              max={currentYear}
              value={typeof selectedYear === 'string' ? selectedYear : ''}
              onChange={handleUniqueChange}
            />
            </div>
          )}

{filterType === 'tranche' && (
  <div className={styles.rangeInputs}>
    <label>
      de
      <input
        type="number"
        placeholder="Année de début"
        min={minYear}
        max={currentYear}
        value={range.start}
        onChange={(e) => handleRangeChange('start', e.target.value)}
      />
    </label>
    <label>
      à
      <input
        type="number"
        placeholder="Année de fin"
        min={minYear}
        max={currentYear}
        value={range.end}
        onChange={(e) => handleRangeChange('end', e.target.value)}
      />
    </label>
  </div>
)}

        </div>
      )}
    </div>
  );
}

export default DropdownYear;
