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

// 🔤 Normalisation pour la recherche (front)
export function normalize(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/['’"]/g, "")           // apostrophes
    .replace(/[^a-z0-9\s]/g, "")     // caractères spéciaux (mais on garde les espaces)
    .replace(/\s+/g, " ")            // espaces multiples -> simple espace
    .trim();
}

/** 🔠 Met en majuscule la première lettre de chaque mot */
export function capitalize(str = "") {
  return str
    .toLowerCase()
    .replace(/(^|\s|-|:)\p{L}/gu, (match) => match.toUpperCase());
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


