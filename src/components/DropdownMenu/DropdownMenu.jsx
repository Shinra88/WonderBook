import { useState, useEffect, useRef } from 'react';
import styles from './DropdownMenu.module.css';
import useCategories from '../../hooks/useCategories';
import { useFilters } from '../../hooks/filterContext';
import { useTranslation } from 'react-i18next';

function DropdownMenu({ isActive = false }) {
  const { t } = useTranslation();

  const { selectedCategories, setSelectedCategories, selectedType, setSelectedType } = useFilters();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { categories, loading, error } = useCategories();

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = event => {
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

  const handleCategorySelect = categoryName => {
    const updatedCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(c => c !== categoryName)
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
        {t('DropdownMenu.Categories')}
      </button>

      {isOpen && (
        <div className={`${styles.dropdownMenu}`}>
          {loading && <p>{t('DropdownMenu.Loading')}...</p>}
          {error && <p>{t('DropdownMenu.ErrorLoading')}</p>}

          {!loading && !error && (
            <>
              <div className={styles.filterSection}>
                <span>{t('DropdownMenu.Filter')}</span>
                <div className={styles.filterToggle}>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="et"
                      checked={selectedType === 'et'}
                      onChange={() => setSelectedType('et')}
                    />
                    {t('DropdownMenu.And')}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="ou"
                      checked={selectedType === 'ou'}
                      onChange={() => setSelectedType('ou')}
                    />
                    {t('DropdownMenu.Or')}
                  </label>
                </div>
              </div>

              <ul className={styles.categoryList}>
                {categories.map(cat => (
                  <li key={cat.name} className={styles.categoryItem}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => handleCategorySelect(cat.name)}
                        disabled={
                          !selectedCategories.includes(cat.name) && selectedCategories.length >= 2
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
