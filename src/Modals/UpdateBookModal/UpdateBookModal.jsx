import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import styles from './UpdateBookModal.module.css';
import GenreSelector from '../../components/GenreSelector/GenreSelector';
import useCategories from '../../hooks/useCategories';
import useEditors from '../../hooks/useEditors';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';

function UpdateBookModal({ book, onClose, onSave }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    author: book.author,
    date: book.date?.split('T')[0] || '',
    summary: book.summary,
    status: book.status,
  });

  const [sagaName, setSagaName] = useState('');
  const [hasSaga, setHasSaga] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });

  const { categories } = useCategories();
  const { editors: publishers } = useEditors();

  useEffect(() => {
    if (book.title.includes(':')) {
      const parts = book.title.split(':');
      setSagaName(parts[0].trim());
      setFormData((prev) => ({ ...prev, title: parts[1].trim() }));
      setHasSaga(true);
    } else {
      setFormData((prev) => ({ ...prev, title: book.title }));
    }
  }, [book.title]);

  useEffect(() => {
    if (categories.length && book.categories?.length) {
      const matchedIds = categories
        .filter((cat) =>
          book.categories.includes(cat.name) ||
          book.categories.some((c) => c.name === cat.name)
        )
        .map((cat) => cat.id || cat.categoryId);
      setSelectedGenres(matchedIds);
    }
  }, [categories, book.categories]);

  useEffect(() => {
    if (publishers.length && book.editors?.length) {
      const match = publishers.find(
        (pub) => pub.name === book.editors[0] || book.editors.some((e) => e.name === pub.name)
      );
      if (match) {
        setSelectedPublisher(match.id || match.publisherId);
      }
    }
  }, [publishers, book.editors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.author || !formData.date || !selectedPublisher || selectedGenres.length === 0) {
      setNotification({ error: true, message: 'Veuillez remplir tous les champs requis.' });
      return;
    }

    const finalTitle = hasSaga && sagaName
      ? `${sagaName.trim()} : ${formData.title.trim()}`
      : formData.title.trim();

    const updatedData = {
      ...formData,
      title: finalTitle,
      categories: selectedGenres.map(Number),
      editors: [Number(selectedPublisher)],
    };

    try {
      onSave(updatedData);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onClose();
        navigate(`/livre/${encodeURIComponent(finalTitle)}`);
      }, 2000);
    } catch (err) {
      setNotification({ error: true, message: 'Erreur lors de la mise à jour du livre.' });
    }
  };

  const isDisabled =
    !formData.title ||
    !formData.author ||
    !formData.date ||
    !selectedPublisher ||
    selectedGenres.length === 0;

  return (
    <div className={styles.modalBackground}>
      <div className={styles.modalContent}>
        <h2>Modifier les informations du livre</h2>
        {showToast && <ToastSuccess message="Livre mis à jour avec succès 🎉" />}
        {!showToast && notification.message && (
          <p className={styles.errorMessage}>{notification.message}</p>
        )}
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={hasSaga}
                onChange={(e) => setHasSaga(e.target.checked)}
              /> Ce livre fait partie d’une saga ou d’un cycle
            </label>
          </div>

          {hasSaga && (
            <div className={styles.formGroup}>
              <label>Nom de la saga :</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={sagaName}
                  onChange={(e) => setSagaName(e.target.value)}
                  className={styles.inputField}
                />
              </div>
            </div>
          )}

          {[{ label: 'Titre', name: 'title' }, { label: 'Auteur', name: 'author' }, { label: 'Date', name: 'date', type: 'date' }].map(({ label, name, type = 'text' }) => (
            <div key={name} className={styles.formGroup}>
              <label>{label} :</label>
              <div className={styles.inputWrapper}>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={styles.inputField}
                />
              </div>
            </div>
          ))}

          <div className={styles.formGroup}>
            <label>Statut :</label>
            <div className={styles.inputWrapper}>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.inputField}
              >
                <option value="pending">En attente</option>
                <option value="validated">Validé</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Genres :</label>
            <div className={styles.genreButtonWrapper}>
              <GenreSelector
                categories={categories}
                onGenresSelect={setSelectedGenres}
                initialGenres={selectedGenres}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Éditeur :</label>
            <div className={styles.inputWrapper}>
              <select
                className={styles.inputField}
                value={selectedPublisher}
                onChange={(e) => setSelectedPublisher(Number(e.target.value))}
              >
                <option value="">-- Sélectionner un éditeur --</option>
                {publishers.map((pub) => (
                  <option key={pub.id} value={pub.id}>
                    {pub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Résumé :</label>
            <div className={styles.inputWrapper}>
              <textarea
                name="summary"
                value={formData.summary}
                onFocus={() => setIsExpanded(true)}
                onBlur={() => setIsExpanded(false)}
                onChange={handleChange}
                className={`${styles.inputField} ${styles.textarea} ${isExpanded ? styles.expanded : ''}`}
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.validate} disabled={isDisabled}>
              Enregistrer
            </button>
            <button type="button" onClick={onClose} className={styles.cancel}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

UpdateBookModal.propTypes = {
  book: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default UpdateBookModal;