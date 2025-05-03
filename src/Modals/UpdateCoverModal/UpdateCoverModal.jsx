import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './UpdateCoverModal.module.css';
import UploadIcon from '../../images/photo.png';
import api from '../../services/api/api';
import { API_ROUTES } from '../../utils/constants';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';

function UpdateCoverModal({ bookId, bookTitle, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  // Nettoyage de l'URL blob au démontage
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setNotification('');
  };

  const handleSubmit = async () => {
    if (!file) return setNotification("Veuillez sélectionner une image.");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('cover', file);

      const { data } = await api.put(
        API_ROUTES.BOOKS.UPDATE_COVER.replace(':id', bookId),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      ToastSuccess("Image mise à jour avec succès ✅");
      onSuccess?.(data.cover_url);
      onClose();
    } catch (err) {
      console.error("❌ Erreur mise à jour image :", err);
      setNotification("Échec lors de l’envoi de la nouvelle image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.modalBackground}
      onClick={(e) => e.target.classList.contains(styles.modalBackground) && onClose()}
    >
      <div className={styles.modalContent}>
        <h2>Modifier la couverture de « {bookTitle} »</h2>

        {notification && <p className={styles.notification}>{notification}</p>}

        <label htmlFor="coverInput" className={styles.uploadArea}>
          {preview ? (
            <img src={preview} alt="Aperçu" className={styles.previewImage} />
          ) : (
            <img src={UploadIcon} alt="Upload" className={styles.icon} />
          )}
          <input
            id="coverInput"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
        </label>

        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.cancel}>
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className={styles.validate}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
}

UpdateCoverModal.propTypes = {
  bookId: PropTypes.number.isRequired,
  bookTitle: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default UpdateCoverModal;
