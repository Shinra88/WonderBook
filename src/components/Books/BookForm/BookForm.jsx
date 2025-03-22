import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { generateStarsInputs } from '../../../lib/functions';
import { useFilePreview } from '../../../lib/customHooks';
import addFileIMG from '../../../images/add_file.png';
import styles from './BookForm.module.css';
import { updateBook, addBook, uploadImageToS3 } from '../../../lib/common';

export function BookForm({ book = null, validate = () => {} }) {
  const userRating = book ? book.ratings.find((elt) => elt.userId === localStorage.getItem('userId'))?.grade : 0;

  const [rating, setRating] = useState(userRating);
  const navigate = useNavigate();

  const {
    register, watch, formState, handleSubmit, reset,
  } = useForm({
    defaultValues: {
      title: book?.title || '',
      author: book?.author || '',
      year: book?.year || '',
      genre: book?.genre || '',
    },
  });

  /** 🔄 Mise à jour des valeurs par défaut en cas de changement de `book` */
  useEffect(() => {
    reset({
      title: book?.title || '',
      author: book?.author || '',
      year: book?.year || '',
      genre: book?.genre || '',
    });
  }, [book, reset]);

  const file = watch('file');
  const [filePreview] = useFilePreview(file);

  useEffect(() => {
    setRating(userRating);
  }, [userRating]);

  /** ✅ Fonction pour uploader l'image sur S3 */
  const handleImageUpload = async (file) => {
    if (!file) return null; // Pas de fichier fourni
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      alert("❌ L'image est trop volumineuse (max 5MB)");
      return null;
    }
    try {
      return await uploadImageToS3(file);
    } catch (error) {
      console.error("❌ Erreur lors de l'upload de l'image :", error);
      throw error;
    }
  };

  /** 📌 Soumission du formulaire */
  const onSubmit = async (data) => {
    let imageUrl = book?.cover_url || ''; // Conserver l'image actuelle

    if (data.file[0]) {
      imageUrl = await handleImageUpload(data.file[0]); // Upload nouvelle image
      if (!imageUrl) {
        alert("❌ Erreur lors de l'upload de l'image.");
        return;
      }
    }

    const bookData = { ...data, cover_url: imageUrl };

    if (!book) {
      const newBook = await addBook(bookData);
      if (!newBook.error) {
        validate(true);
      } else {
        alert(newBook.message);
      }
    } else {
      const updatedBook = await updateBook(bookData, book.id);
      if (!updatedBook.error) {
        navigate('/');
      } else {
        alert(updatedBook.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.Form}>
      <input type="hidden" id="id" {...register('id')} />

      <label htmlFor="title">
        <p>Titre du livre</p>
        <input type="text" id="title" {...register('title')} required />
      </label>

      <label htmlFor="author">
        <p>Auteur</p>
        <input type="text" id="author" {...register('author')} required />
      </label>

      <label htmlFor="year">
        <p>Année de publication</p>
        <input type="number" id="year" {...register('year')} required min="1800" max={new Date().getFullYear()} />
      </label>

      <label htmlFor="genre">
        <p>Genre</p>
        <input type="text" id="genre" {...register('genre')} required />
      </label>

      <label htmlFor="rate">
        <p>Note</p>
        <div className={styles.Stars}>
          {generateStarsInputs(rating, register, !!book)}
        </div>
      </label>

      <label htmlFor="file">
        <p>Visuel</p>
        <div className={styles.AddImage}>
          {filePreview || book?.cover_url ? (
            <>
              <img src={filePreview ?? book?.cover_url} alt="Aperçu du livre" />
              <p>Modifier</p>
            </>
          ) : (
            <>
              <img src={addFileIMG} alt="Ajouter une image" />
              <p>Ajouter une image</p>
            </>
          )}
        </div>
        <input {...register('file')} type="file" id="file" accept="image/*" />
      </label>

      <button type="submit">Publier</button>
    </form>
  );
}

BookForm.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    userId: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    year: PropTypes.number,
    cover_url: PropTypes.string,
    genre: PropTypes.string,
    ratings: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.string,
      grade: PropTypes.number,
    })),
    averageRating: PropTypes.number,
  }),
  validate: PropTypes.func,
};

export default BookForm;
