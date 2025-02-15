import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './DropdownYear.module.css';

function DropdownYear({ onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState('unique');
  const [year, setYear] = useState('');
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ✅ Fonction pour envoyer l'année unique au parent
  const handleYearChange = (e) => {
    const newYear = e.target.value;
    console.log('🔹 Année sélectionnée dans DropdownYear:', newYear);
    setYear(newYear);
    onFilterChange(newYear);
  };

  // ✅ Fonction pour envoyer une plage d'années au parent
  const handleYearRangeChange = (start, end) => {
    setYearStart(start);
    setYearEnd(end);
    onFilterChange({ start, end }); // ✅ Envoi de la plage d'années au parent
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button className={styles.dropdownButton} type="button" onClick={toggleDropdown}>
        Années
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.filterSection}>
            <div className={styles.filterToggle}>
              <label htmlFor="filter-unique">
                <input
                  type="radio"
                  name="filter"
                  value="unique"
                  checked={filterType === 'unique'}
                  onChange={() => setFilterType('unique')}
                />
                Unique
              </label>
              <label htmlFor="filter-tranche">
                <input
                  type="radio"
                  name="filter"
                  value="tranche"
                  checked={filterType === 'tranche'}
                  onChange={() => setFilterType('tranche')}
                />
                Tranche
              </label>
            </div>
          </div>
          {filterType === 'unique' && (
            <div className={styles.inputWrapper}>
              <input
                type="number"
                placeholder="Année"
                value={year}
                onChange={handleYearChange} // ✅ Utilisation de la fonction ici
              />
            </div>
          )}
          {filterType === 'tranche' && (
            <div className={styles.rangeInputs}>
              <label htmlFor="yearStart">
                de
                <input
                  type="number"
                  placeholder="Année de début"
                  value={yearStart}
                  onChange={(e) => handleYearRangeChange(e.target.value, yearEnd)}
                />
              </label>
              <label htmlFor="yearEnd">
                à
                <input
                  type="number"
                  placeholder="Année de fin"
                  value={yearEnd}
                  onChange={(e) => handleYearRangeChange(yearStart, e.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

DropdownYear.propTypes = {
  onFilterChange: PropTypes.func,
};

DropdownYear.defaultProps = {
  onFilterChange: () => {},
};

export default DropdownYear;
