import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './DropdownMenu.module.css';

function DropdownMenu({ categories, backgroundClass = '', onFilterChange = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filterType, setFilterType] = useState('et');
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

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

  const handleCategorySelect = (category) => {
    if (selectedCategories.includes(category)) {
      const updatedCategories = selectedCategories.filter((c) => c !== category);
      setSelectedCategories(updatedCategories);
      onFilterChange(updatedCategories);
    } else {
      if (selectedCategories.length < 2) {
        const updatedCategories = [...selectedCategories, category];
        setSelectedCategories(updatedCategories);
        onFilterChange(updatedCategories);
      }
    }
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button className={styles.dropdownButton} type="button" onClick={toggleDropdown}>
        Catégories
      </button>

      {isOpen && (
        <div className={`${styles.dropdownMenu} ${styles[backgroundClass]}`}>
          <div className={styles.filterSection}>
            <span>Filtrage</span>
            <div className={styles.filterToggle}>
              <label htmlFor="filter-et">
                <input
                  type="radio"
                  name="filter"
                  id="filter-et"
                  value="et"
                  checked={filterType === 'et'}
                  onChange={() => setFilterType('et')}
                />
                et
              </label>
              <label htmlFor="filter-ou">
                <input
                  type="radio"
                  name="filter"
                  id="filter-ou"
                  value="ou"
                  checked={filterType === 'ou'}
                  onChange={() => setFilterType('ou')}
                />
                ou
              </label>
            </div>
          </div>

          <ul className={styles.categoryList}>
            {categories.map((category) => (
              <li key={category} className={styles.categoryItem}>
                <label htmlFor="category">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategorySelect(category)}
                  />
                  {category}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

DropdownMenu.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  backgroundClass: PropTypes.string,
  onFilterChange: PropTypes.func,
};

export default DropdownMenu;
