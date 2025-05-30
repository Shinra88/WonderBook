// BookFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import styles from './BookFormModal.module.css';
import GenreSelector from '../../components/GenreSelector/GenreSelector';
import UploadIcon from '../../images/photo.png';
import useCategories from '../../hooks/useCategories';
import useEditors from '../../hooks/useEditors';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import { uploadImageToS3 } from '../../services/uploadServices';
import ReCAPTCHA from 'react-google-recaptcha';
import { API_ROUTES } from '../../utils/constants';
import api from '../../services/api/api';
import { normalize, capitalize } from '../../utils/helpers';

function BookFormModal({ mode = 'add', book = {}, onClose, onSave }) {
  const navigate = useNavigate();
  const isUpdate = mode === 'update';

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    date: '',
    summary: '',
    status: 'pending',
    cover_url: '',
  });

  const [sagaName, setSagaName] = useState('');
  const [hasSaga, setHasSaga] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const { categories } = useCategories();
  const { editors: publishers } = useEditors();
  const modalRef = useRef(null);

  useEffect(() => {
    if (isUpdate && book) {
      const [saga, title] = book.title.includes(':') ? book.title.split(':').map(p => p.trim()) : [null, book.title];
      setHasSaga(!!saga);
      setSagaName(saga || '');
      setFormData({
        title: title || '',
        author: book.author || '',
        date: book.date?.split('T')[0] || '',
        summary: book.summary || '',
        status: book.status || 'pending',
        cover_url: book.cover_url || '',
      });
      if (book.categories) {
        const matchedIds = categories.filter(cat => book.categories.includes(cat.name) || book.categories.some(c => c.name === cat.name)).map(cat => cat.id || cat.categoryId);
        setSelectedGenres(matchedIds);
      }
      if (book.editors) {
        const match = publishers.find(pub => pub.name === book.editors[0] || book.editors.some(e => e.name === pub.name));
        if (match) setSelectedPublisher(match.id || match.publisherId);
      }
    }
  }, [isUpdate, book, categories, publishers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.author || !formData.date || !selectedPublisher || selectedGenres.length === 0 || (!isUpdate && !recaptchaToken)) {
      setNotification({ error: true, message: 'Veuillez remplir tous les champs requis.' });
      return;
    }

    const finalTitle = hasSaga && sagaName ? `${capitalize(sagaName)} : ${capitalize(formData.title)}` : capitalize(formData.title);
    const formattedDate = formData.date;
    let coverUrl = formData.cover_url || '';

    if (coverFile) {
      try {
        if (isUpdate) {
          const formDataImage = new FormData();
          formDataImage.append('cover', coverFile);
          const res = await api.put(API_ROUTES.BOOKS.UPDATE_COVER.replace(':id', book.bookId), formDataImage, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          coverUrl = res.data.cover_url;
        } else {
          const uploadedUrl = await uploadImageToS3(coverFile, finalTitle);
          coverUrl = uploadedUrl;
        }
      } catch (err) {
        console.error(err);
        setNotification({ error: true, message: 'Erreur lors de l’upload de la couverture.' });
        return;
      }
    }

    const payload = {
      title: finalTitle,
      search_title: normalize(`${finalTitle} ${formData.author}`),
      author: formData.author,
      year: formattedDate,
      summary: formData.summary,
      cover_url: coverUrl,
      status: formData.status,
      recaptchaToken,
      categories: selectedGenres,
      editors: [Number(selectedPublisher)],
    };

    try {
      if (isUpdate) {
        onSave(payload);
      } else {
        const response = await api.post(API_ROUTES.BOOKS.ADD_BOOK, payload);
        if (response.status !== 201) throw new Error('Erreur lors de l’ajout.');
      }

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onClose();
        navigate(`/livre/${encodeURIComponent(finalTitle)}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      setNotification({ error: true, message: 'Erreur lors de l’enregistrement du livre.' });
    }
  };

  const isDisabled = !formData.title || !formData.author || !formData.date || !selectedPublisher || selectedGenres.length === 0 || (!isUpdate && (!recaptchaToken || !coverFile));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.modalBackground}>
      <div ref={modalRef} className={styles.modalContent}>
        <h2>{isUpdate ? 'Modifier le livre' : 'Ajouter un livre'}</h2>
        {showToast && <ToastSuccess message={`Livre ${isUpdate ? 'modifié' : 'ajouté'} avec succès 🎉`} />}
        {!showToast && notification.message && <p className={styles.errorMessage}>{notification.message}</p>}

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label>
              <input type="checkbox" checked={hasSaga} onChange={(e) => setHasSaga(e.target.checked)} /> Ce livre fait partie d’une saga ou d’un cycle
            </label>
          </div>

          {hasSaga && (
            <div className={styles.formGroup}>
              <label>Nom de la saga :</label>
              <div className={styles.inputWrapper}>
                <input type="text" value={sagaName} onChange={(e) => setSagaName(e.target.value)} className={styles.inputField} />
              </div>
            </div>
          )}

          {[{ label: 'Titre', name: 'title' }, { label: 'Auteur', name: 'author' }, { label: 'Date de publication', name: 'date', type: 'date' }].map(({ label, name, type = 'text' }) => (
            <div key={name} className={styles.formGroup}>
              <label>{label} :</label>
              <div className={styles.inputWrapper}>
                <input type={type} name={name} value={formData[name]} onChange={handleChange} className={styles.inputField} max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
          ))}

          <div className={styles.formGroup}>
            <p className={styles.formatText}>{isUpdate ? 'Vous pouvez remplacer la couverture existante :' : 'Ajoutez une image de couverture :'}</p>
            <label htmlFor="attachment" className={styles.imageUpload} title="Cliquez ici pour ajouter une image de couverture">
              <div className={styles.imageContainer}>
                {!coverPreviewUrl && formData.cover_url && isUpdate && (
                  <img src={formData.cover_url} alt="Couverture actuelle" className={styles.coverPreview} />
                )}
                {!coverPreviewUrl && !formData.cover_url && (
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
          </div>

          {isUpdate && (
            <div className={styles.formGroup}>
              <label>Statut :</label>
              <div className={styles.inputWrapper}>
                <select name="status" value={formData.status} onChange={handleChange} className={styles.inputField}>
                  <option value="pending">En attente</option>
                  <option value="validated">Validé</option>
                </select>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Genres :</label>
            <div className={styles.genreButtonWrapper}>
              <GenreSelector categories={categories} onGenresSelect={setSelectedGenres} initialGenres={selectedGenres} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Éditeur :</label>
            <div className={styles.inputWrapper}>
              <select className={styles.inputField} value={selectedPublisher} onChange={(e) => setSelectedPublisher(Number(e.target.value))}>
                <option value="">-- Sélectionner un éditeur --</option>
                {publishers.map((pub) => (
                  <option key={pub.id} value={pub.id}>{pub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Résumé :</label>
            <div className={styles.inputWrapper}>
              <textarea name="summary" value={formData.summary} onFocus={() => setIsExpanded(true)} onBlur={() => setIsExpanded(false)} onChange={handleChange} className={`${styles.inputField} ${styles.textarea} ${isExpanded ? styles.expanded : ''}`} />
            </div>
          </div>

          {!isUpdate && (
            <div className={styles.formGroup}>
              <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={(token) => setRecaptchaToken(token)} />
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.validate} disabled={isDisabled}>{isUpdate ? 'Enregistrer' : 'Ajouter'}</button>
            <button type="button" onClick={onClose} className={styles.cancel}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

BookFormModal.propTypes = {
  mode: PropTypes.oneOf(['add', 'update']),
  book: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default BookFormModal;