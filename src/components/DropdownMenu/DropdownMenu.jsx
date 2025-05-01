import React, { useState, useEffect, useRef } from 'react';
import styles from './DropdownMenu.module.css';
import useCategories from '../../hooks/useCategories';
import { useFilters } from '../../hooks/filterContext';

function DropdownMenu({ isActive = false }) {  const {
    selectedCategories,
    setSelectedCategories,
    selectedType,
    setSelectedType
  } = useFilters();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { categories, loading, error } = useCategories();

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

  const handleCategorySelect = (categoryName) => {
    const updatedCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter((c) => c !== categoryName)
      : selectedCategories.length < 2
        ? [...selectedCategories, categoryName]
        : selectedCategories;

    setSelectedCategories(updatedCategories);
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button 
        className={`${styles.dropdownButton} ${isActive ? styles.activeFilter : ''}`} 
        type="button" 
        onClick={toggleDropdown}
      >
        Catégories
      </button>

      {isOpen && (
        <div className={`${styles.dropdownMenu}`}>
          {loading && <p>Chargement...</p>}
          {error && <p>Erreur de chargement</p>}

          {!loading && !error && (
            <>
              <div className={styles.filterSection}>
                <span>Filtrage</span>
                <div className={styles.filterToggle}>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="et"
                      checked={selectedType === 'et'}
                      onChange={() => setSelectedType('et')}
                    />
                    et
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="ou"
                      checked={selectedType === 'ou'}
                      onChange={() => setSelectedType('ou')}
                    />
                    ou
                  </label>
                </div>
              </div>

              <ul className={styles.categoryList}>
                {categories.map((cat) => (
                  <li key={cat.name} className={styles.categoryItem}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => handleCategorySelect(cat.name)}
                        disabled={
                          !selectedCategories.includes(cat.name) &&
                          selectedCategories.length >= 2
                        }
                      />
                      {cat.name}
                    </label>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;
