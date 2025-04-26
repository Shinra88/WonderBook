// 📁 utils/helpers.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import styles from '../components/Books/BookDisplay/BookDisplay.module.css';

/** ⭐ Affiche les étoiles selon la note */
export function displayStars(rating) {
  return Array.from({ length: 5 }, (_, i) => (
    <FontAwesomeIcon
      key={i}
      icon={faStar}
      className={i < Math.round(rating) ? styles.full : styles.empty}
    />
  ));
}

/** ⭐ Étoiles interactives ou en lecture seule */
export function generateStarsInputs(rating, register, readOnly = false) {
  return Array.from({ length: 5 }, (_, i) => {
    const index = i + 1;
    const icon = (
      <FontAwesomeIcon
        icon={faStar}
        className={index <= Math.round(rating) ? styles.full : styles.empty}
      />
    );
    return readOnly ? (
      <span key={index}>{icon}</span>
    ) : (
      <label key={index} htmlFor={`rating${index}`}>
        {icon}
        <input
          type="radio"
          id={`rating${index}`}
          value={index}
          {...register('rating')}
        />
      </label>
    );
  });
}

/** 📆 Formate une date YYYY-MM-DD */
export function formatDate(dateStr) {
  return dateStr?.slice(0, 10) || 'Date inconnue';
}