import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { API_ROUTES } from '../../utils/constants';
import GenreSelector from '../../components/GenreSelector/GenreSelector';
import styles from './AddBook.module.css';
import UploadIcon from '../../images/photo.png';
import ReCAPTCHA from 'react-google-recaptcha';
import { uploadImageToS3 } from '../../services/uploadServices';
import useCategories from '../../hooks/useCategories';
import useEditors from '../../hooks/useEditors';
import api from '../../services/api/api';
import { useAuth } from '../../hooks/useAuth';

function AddBook({ onClose }) {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState({ day: '', month: '', year: '' });
  const { isAuthenticated } = useAuth();
  const { categories, loading, error } = useCategories();
  const { editors: publishers } = useEditors();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const previewURL = URL.createObjectURL(file);
    setCoverPreviewUrl(previewURL);
  };

  const handleClickOutside = (event) => {
    if (event.target.classList.contains(styles.modalBackground)) {
      onClose();
    }
  };

  const validateDateField = (field, value) => {
    let error = '';
    const intValue = parseInt(value, 10);
    const currentYear = new Date().getFullYear();

    if (field === 'day') {
      if (isNaN(intValue) || intValue < 1 || intValue > 31) error = 'Jour invalide';
    }
    if (field === 'month') {
      if (isNaN(intValue) || intValue < 1 || intValue > 12) error = 'Mois invalide';
    }
    if (field === 'year') {
      if (isNaN(intValue) || intValue < 900 || intValue > currentYear) error = "Année invalide";
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const isValidDate = () => {
    return !errors.day && !errors.month && !errors.year && day && month && year;
  };

  const handleAddBook = async () => {
    if (!recaptchaToken) {
      setNotification({ error: true, message: 'Veuillez valider le CAPTCHA.' });
      return;
    }

    if (!title || !author || !selectedPublisher || !isValidDate()) {
      setNotification({ error: true, message: 'Tous les champs obligatoires doivent être remplis avec une date valide.' });
      return;
    }

    if (!coverFile) {
      setNotification({ error: true, message: 'Veuillez ajouter une image de couverture.' });
      return;
    }

    if (selectedGenres.length === 0) {
      setNotification({ error: true, message: 'Veuillez sélectionner au moins un genre.' });
      return;
    }

    setIsLoading(true);
    let coverUrl = '';

    try {
      const uploadedUrl = await uploadImageToS3(coverFile, title);
      if (!uploadedUrl) {
        setNotification({ error: true, message: "Erreur lors de l'upload de l’image." });
        return;
      }
      coverUrl = uploadedUrl;

      const defaultGeneral = categories.find(c => c.name === "Général");
      const paddedYear = String(year).padStart(4, '0');
      const paddedMonth = String(month).padStart(2, '0');
      const paddedDay = String(day).padStart(2, '0');
      
      const fullDate = `${paddedYear}-${paddedMonth}-${paddedDay}`;
      
      if (isNaN(Date.parse(fullDate))) {
        setNotification({ error: true, message: 'Date invalide. Vérifiez les champs JJ/MM/AAAA.' });
        setIsLoading(false);
        return;
      }      

      const payload = {
        title,
        author,
        year: fullDate,
        summary,
        cover_url: coverUrl,
        recaptchaToken,
        editor: [Number(selectedPublisher)],
        categories: selectedGenres.length > 0
          ? selectedGenres
          : defaultGeneral ? [defaultGeneral.id || defaultGeneral.categoryId] : [],
      };

      const response = await api.post(API_ROUTES.BOOKS.ADD_BOOK, payload);

      if (response.status !== 201) {
        setNotification({ error: true, message: "Erreur lors de l’ajout du livre." });
      } else {
        setNotification({ error: false, message: "Livre ajouté avec succès !" });
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
          onClose();
          window.location.reload();
        }, 1500);        
      }
    } catch (err) {
      console.error('❌ Erreur dans handleAddBook:', err);
      setNotification({
        error: true,
        message: err.response?.data?.error || "Erreur inattendue lors de l’ajout du livre.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const errorClass = notification.error ? styles.errorMessage : '';
  const isDisabled = !title || !author || !selectedPublisher || !isValidDate() || !recaptchaToken || !coverFile || selectedGenres.length === 0 || isLoading;

  return (
    <div className={styles.modalBackground} onClick={handleClickOutside} role="presentation">
      {showToast && (
        <div className={styles.toastSuccess}>
          🎉 Livre ajouté avec succès !
        </div>
      )}

      <div className={styles.modalContent}>
        <h2>Ajouter un livre</h2>

        {notification.message && (
          <div className={`${styles.notification} ${errorClass}`}>
            {notification.message}
          </div>
        )}

        {!loading && !error && (
          <GenreSelector categories={categories} onGenresSelect={setSelectedGenres} />
        )}

        <section className={styles.formContainer}>
          <article className={styles.formProperty}>
            <label htmlFor="author">
              <p>Auteur</p>
              <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </label>

            <label htmlFor="title">
              <p>Titre</p>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <label htmlFor="editor">
              <p>Éditeur</p>
              <select id="editor" value={selectedPublisher} onChange={(e) => setSelectedPublisher(e.target.value)}>
                <option value="">-- Sélectionner un éditeur --</option>
                {publishers.map((pub) => (
                  <option key={`publisher-${pub.id}`} value={pub.id}>
                    {pub.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <p>Date de publication</p>
              <div className={styles.dateInputs}>
                <div className={styles.dateColumn}>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="JJ"
                    value={day}
                    onInput={(e) => e.target.value = e.target.value.slice(0, 2)}
                    onBlur={(e) => {
                      if (e.target.value.length === 1) {
                        setDay(`0${e.target.value}`);
                      }
                    }}
                    onChange={(e) => { setDay(e.target.value); validateDateField('day', e.target.value); }}
                  />
                  {errors.day && <span className={styles.dateError}>{errors.day}</span>}
                </div>
                <div className={styles.dateColumn}>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    placeholder="MM"
                    value={month}
                    onInput={(e) => e.target.value = e.target.value.slice(0, 2)}
                    onBlur={(e) => {
                      if (e.target.value.length === 1) {
                        setMonth(`0${e.target.value}`);
                      }
                    }}
                    onChange={(e) => { setMonth(e.target.value); validateDateField('month', e.target.value); }}
                  />
                  {errors.month && <span className={styles.dateError}>{errors.month}</span>}
                </div>
                <div className={styles.dateColumn}>
                  <input
                    type="number"
                    min="900"
                    max={new Date().getFullYear()}
                    placeholder="AAAA"
                    value={year}
                    onInput={(e) => e.target.value = e.target.value.slice(0, 4)}
                    onChange={(e) => { setYear(e.target.value); validateDateField('year', e.target.value); }}
                  />
                  {errors.year && <span className={styles.dateError}>{errors.year}</span>}
                </div>
              </div>
            </label>

            
          </article>

          <aside className={styles.asideContainer}>
            <label htmlFor="attachment" className={styles.imageUpload}>
              <p className={styles.formatText}>Formats d’image acceptés</p>
              <p className={styles.formatTypes}>PNG, JPEG, WEBP</p>
              <div className={styles.imageContainer}>
                {!coverPreviewUrl && (
                  <img src={UploadIcon} alt="Upload Icon" className={styles.UploadIcon} />
                )}
                {coverPreviewUrl && (
                  <img src={coverPreviewUrl} alt="Aperçu couverture" className={styles.coverPreview} />
                )}
              </div>
              <input
                type="file"
                id="attachment"
                className={styles.fileInput}
                accept=".png, .jpeg, .jpg, .webp"
                onChange={handleFileChange}
              />
            </label>
            <div className={styles.recaptchaWrapper}>
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>
          </aside>
        </section> 
        <section className={styles.summary}>
          <label htmlFor="summary">
            <p>Résumé</p>
            <textarea id="summary" rows="5" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </label>
        </section>

        <div className={styles.buttonContainer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Annuler
          </button>
          <button type="button" className={styles.validateButton} onClick={handleAddBook} disabled={isDisabled}>
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
