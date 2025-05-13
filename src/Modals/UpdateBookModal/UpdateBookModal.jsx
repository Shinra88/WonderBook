import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './UpdateBookModal.module.css';
import GenreSelector from '../../components/GenreSelector/GenreSelector';
import useCategories from '../../hooks/useCategories';
import useEditors from '../../hooks/useEditors';

function UpdateBookModal({ book, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    date: book.date?.split('T')[0] || '',
    summary: book.summary,
    status: book.status,
  });

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const { categories } = useCategories();
  const { editors: publishers } = useEditors();
  const [isExpanded, setIsExpanded] = useState(false);

  // Pré-remplissage des genres
  useEffect(() => {
    if (categories.length && book.categories?.length) {
      const matchedCategoryIds = categories
        .filter((cat) => book.categories.includes(cat.name))
        .map((cat) => cat.id || cat.categoryId);
      setSelectedGenres(matchedCategoryIds);
    }
  }, [categories, book.categories]);

  // Pré-remplissage de l’éditeur
  useEffect(() => {
    if (publishers.length && book.editors?.length) {
      const match = publishers.find((pub) => pub.name === book.editors[0]);
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
    const updatedData = {
      ...formData,
      categories: selectedGenres,
      editors: [selectedPublisher],
    };
    onSave(updatedData);
    onClose();
  };

  return (
    <div className={styles.modalBackground}>
        <div className={styles.modalContent}>
            <h2>Modifier les informations du livre</h2>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
            {[
                { label: 'Titre', name: 'title', type: 'text', required: true },
                { label: 'Auteur', name: 'author', type: 'text', required: true },
                { label: 'Date', name: 'date', type: 'date', required: true },
            ].map(({ label, name, type, required }) => (
                <div key={name} className={styles.formGroup}>
                <label>{label} :</label>
                <div className={styles.inputWrapper}>
                    <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={styles.inputField}
                    required={required}
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
            <button type="submit" className={styles.validate}>Enregistrer</button>
            <button type="button" onClick={onClose} className={styles.cancel}>Annuler</button>
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
