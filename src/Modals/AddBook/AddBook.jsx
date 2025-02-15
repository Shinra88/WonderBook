import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { API_ROUTES } from '../../utils/constants';
import GenreSelector from '../../components/GenreSelector/GenreSelector';
import styles from './AddBook.module.css';
import UploadIcon from '../../images/photo.png';

function AddBook({ onClose }) {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });

  useEffect(() => {
    // Gestion de la fermeture avec Escape
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleClickOutside = (event) => {
    if (event.target.classList.contains(styles.modalBackground)) {
      onClose();
    }
  };

  const handleAddBook = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(API_ROUTES.ADD_BOOK, {
        title,
        author,
        year,
        genres: selectedGenres,
      });

      if (response.status !== 200) {
        setNotification({ error: true, message: 'Une erreur est survenue.' });
      } else {
        setNotification({ error: false, message: 'Livre ajouté avec succès !' });
        onClose();
      }
    } catch (err) {
      setNotification({ error: true, message: err.response?.data?.message || 'Erreur inattendue.' });
    } finally {
      setIsLoading(false);
    }
  };

  const errorClass = notification.error ? styles.errorMessage : '';

  return (
    <div className={styles.modalBackground} onClick={handleClickOutside} role="presentation">
      <div className={styles.modalContent}>
        <h2>Ajouter un livre</h2>

        {notification.message && (
          <div className={`${styles.notification} ${errorClass}`}>
            {notification.message}
          </div>
        )}

        <GenreSelector
          categories={['Amour', 'Aventure', 'Fantastique', 'Fantasy', 'Historique', 'Policier', 'Science-Fiction']}
          onSelectGenres={setSelectedGenres}
        />
        {selectedGenres.length > 0 && (
          <div className={styles.selectedGenres}>
            <strong>Genres sélectionnés:</strong>
            {selectedGenres.join(', ')}
          </div>
        )}

        <section className={styles.formContainer}>
          <article className={styles.formProperty}>
            <label htmlFor="author">
              <p>Auteur</p>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </label>

            <label htmlFor="title">
              <p>Titre</p>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label htmlFor="year">
              <p>Année</p>
              <input
                type="number"
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </label>
          </article>

          <aside className={styles.formImage}>
            <label htmlFor="attachment" className={styles.imageUpload}>
              <p className={styles.formatText}>Formats d’image acceptés</p>
              <p className={styles.formatTypes}>PNG, JPEG, WEBP</p>
              <div className={styles.imageContainer}>
                <img src={UploadIcon} alt="Upload Icon" className={styles.UploadIcon} />
              </div>
              <input type="file" id="attachment" className={styles.fileInput} accept=".png, .jpeg, .jpg, .webp" />
            </label>
          </aside>
        </section>

        <div className={styles.buttonContainer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Annuler
          </button>
          <button type="button" className={styles.validateButton} onClick={handleAddBook} disabled={isLoading}>
            {isLoading ? 'Chargement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}

AddBook.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddBook;
