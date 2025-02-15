import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './GenreSelector.module.css';

function GenreSelector({ categories, onGenresSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleGenreClick = (genre) => {
    if (selected.includes(genre)) {
      setSelected(selected.filter((g) => g !== genre));
    } else if (selected.length < 2) {
      setSelected([...selected, genre]);
    }
  };

  const handleApplySelection = () => {
    setIsOpen(false);
    onGenresSelect(selected);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.genreSelectorContainer} ref={dropdownRef}>
      <button type="button" className={styles.dropdownButton} onClick={toggleDropdown}>
        {selected.length > 0 ? selected.join(', ') : 'Choisir des genres'}
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <ul className={styles.genreList}>
            {categories.map((genre) => (
              <li key={genre} className={styles.genreItem}>
                <label htmlFor="genre">
                  <input
                    type="checkbox"
                    checked={selected.includes(genre)}
                    onChange={() => handleGenreClick(genre)}
                    disabled={!selected.includes(genre) && selected.length >= 2}
                  />
                  {genre}
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.applyButton}
            onClick={handleApplySelection}
            disabled={selected.length === 0}
          >
            Valider
          </button>
        </div>
      )}
    </div>
  );
}

GenreSelector.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onGenresSelect: PropTypes.func.isRequired,
};

export default GenreSelector;
