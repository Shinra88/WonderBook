import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import styles from './GenreSelector.module.css';
import { API_ROUTES } from '../../utils/constants';
import { useTranslation } from 'react-i18next';

function GenreSelector({ onGenresSelect, initialGenres = [] }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(initialGenres);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(API_ROUTES.CATEGORIES.GET_ALL);
        if (Array.isArray(res.data)) {
          const cleaned = res.data.map((cat) => ({
            id: cat.id ?? cat.categoryId,
            name: cat.name
          })).filter(cat => cat.id && cat.name);
          setCategories(cleaned);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des catégories :', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setSelected(initialGenres);
  }, [initialGenres]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleGenreToggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((g) => g !== id);
      } else if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleApply = () => {
    onGenresSelect([...selected]);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.genreSelectorContainer} ref={dropdownRef}>
      <button type="button" className={styles.dropdownButton} onClick={toggleDropdown}>
        {selected.length > 0
          ? selected.map((id) => categories.find((c) => c.id === id)?.name).join(', ')
          : t('GenreSelector.SelectGenres')}
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <ul className={styles.genreList}>
            {categories.map((cat) => (
              <li key={`genre-${cat.id}`} className={styles.genreItem}>
                <label htmlFor={`genre-${cat.id}`}>
                <input
                  id={`genre-${cat.id}`}
                  type="checkbox"
                  className="genreCheckbox"
                  checked={selected.includes(cat.id)}
                  onChange={() => handleGenreToggle(cat.id)}
                  disabled={!selected.includes(cat.id) && selected.length >= 2}
                />
                  {cat.name}
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.applyButton}
            onClick={handleApply}
            disabled={selected.length === 0}
          >
            {t('BookFormModal.Submit')}
          </button>
        </div>
      )}
    </div>
  );
}

GenreSelector.propTypes = {
  onGenresSelect: PropTypes.func.isRequired,
  initialGenres: PropTypes.array,
};

export default GenreSelector;
