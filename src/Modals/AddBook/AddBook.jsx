import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { API_ROUTES } from '../../utils/constants';
import GenreSelector from '../../components/GenreSelector/GenreSelector';
import styles from './AddBook.module.css';
import UploadIcon from '../../images/photo.png';
import ReCAPTCHA from "react-google-recaptcha";
import { uploadImageToS3 } from '../../services/uploadServices';

function AddBook({ onClose }) {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [editor, setEditor] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');

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
    if (!recaptchaToken) {
      setNotification({ error: true, message: 'Veuillez valider le CAPTCHA.' });
      return;
    }
  
    if (!title || !author || !editor || !year) {
      setNotification({ error: true, message: 'Tous les champs obligatoires doivent être remplis.' });
      return;
    }
  
    setIsLoading(true);
    let coverUrl = '';
  
    try {
      // 1. Upload de l'image (si présente)
      if (coverFile) {
        const uploadedUrl = await uploadImageToS3(coverFile);
        if (!uploadedUrl) {
          setNotification({ error: true, message: 'Erreur lors de l’upload de l’image.' });
          setIsLoading(false);
          return;
        }
        setCoverPreviewUrl(uploadedUrl);
        coverUrl = uploadedUrl;
      }
  
      // 2. Création du livre avec l’URL de l’image
      const response = await axios.post(API_ROUTES.BOOKS.ADD_BOOK, {
        title,
        author,
        editor,
        year,
        summary,
        genres: selectedGenres.length > 0 ? selectedGenres : ['Général'],
        recaptchaToken,
        cover_url: coverUrl, // nouveau champ
      });
  
      if (response.status !== 201) {
        setNotification({ error: true, message: 'Erreur lors de l’ajout du livre.' });
      } else {
        setNotification({ error: false, message: 'Livre ajouté avec succès !' });
        onClose();
      }
    } catch (err) {
      console.error('❌ Erreur dans handleAddBook:', err);
      setNotification({
        error: true,
        message: err.response?.data?.error || 'Erreur inattendue lors de l’ajout du livre.',
      });
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

            <label htmlFor="editor">
              <p>Éditeur</p>
              <input
                type="text"
                id="editor"
                value={editor}
                onChange={(e) => setEditor(e.target.value)}
              />
            </label>

            <label htmlFor="summary">
              <p>Résumé</p>
              <textarea
                id="summary"
                rows="5"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
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
                {coverPreviewUrl && (
                  <img src={coverPreviewUrl} alt="Aperçu couverture" className={styles.coverPreview} />
                )}

              </div>
              <input
                type="file"
                id="attachment"
                className={styles.fileInput}
                accept=".png, .jpeg, .jpg, .webp"
                onChange={(e) => setCoverFile(e.target.files[0])}
              />
            </label>
          </aside>
        </section>
        
        <div className={styles.recaptchaWrapper}>
          <ReCAPTCHA
            sitekey="6LeySBQrAAAAAP6T4OxTqoVWFOEkBnp7Mfntsnes"
            onChange={(token) => {
              console.log('reCAPTCHA token:', token);
              setRecaptchaToken(token);
            }}
          />
        </div>
        {!recaptchaToken && (
          <p style={{ color: '#ff6666', fontWeight: 'bold', textAlign: 'center' }}>
            Veuillez valider le CAPTCHA avant de soumettre.
          </p>
        )}

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
