import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { generateStarsInputs } from '../../../utils/helpers';
import { useFilePreview } from '../../../hooks/customHooks';
import addFileIMG from '../../../images/add_file.png';
import styles from './BookForm.module.css';
import { updateBook, addBook } from '../../../services/bookService';
import { uploadImageToS3 } from '../../../services/uploadServices';
export function BookForm({ book = null, validate = () => {} }) {
  const userRating = book?.ratings?.find((elt) => elt.userId === localStorage.getItem('userId'))?.grade || 0;
  const [rating, setRating] = useState(userRating);
  const navigate = useNavigate();

  const {
    register, watch, formState, handleSubmit, reset,
  } = useForm({
    defaultValues: {
      title: book?.title || '',
      author: book?.author || '',
      date: book?.date || '',
      genre: book?.genre || '',
    },
  });

  useEffect(() => {
    reset({
      title: book?.title || '',
      author: book?.author || '',
      date: book?.date || '',
      genre: book?.genre || '',
    });
  }, [book, reset]);

  const file = watch('file');
  const [filePreview] = useFilePreview(file);

  useEffect(() => {
    setRating(userRating);
  }, [userRating]);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    if (file.size > 5 * 1024 * 1024) {
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

  const onSubmit = async (data) => {
    let imageUrl = book?.cover_url || '';
    if (data.file?.[0]) {
      imageUrl = await handleImageUpload(data.file[0]);
      if (!imageUrl) {
        alert("❌ Erreur lors de l'upload de l'image.");
        return;
      }
    }

    const bookData = {
      ...data,
      cover_url: imageUrl,
    };

    if (!book) {
      const newBook = await addBook(bookData);
      if (!newBook.error) {
        validate(true);
      } else {
        alert(newBook.message);
      }
    } else {
      const updatedBook = await updateBook(bookData, book.bookId);
      if (!updatedBook.error) {
        navigate('/');
      } else {
        alert(updatedBook.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.Form}>
      <label htmlFor="title">
        <p>Titre du livre</p>
        <input type="text" id="title" {...register('title')} required />
      </label>

      <label htmlFor="author">
        <p>Auteur</p>
        <input type="text" id="author" {...register('author')} required />
      </label>

      <label htmlFor="date">
        <p>Date de publication</p>
        <input type="date" id="date" {...register('date')} required />
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
    bookId: PropTypes.number,
    userId: PropTypes.number,
    title: PropTypes.string,
    author: PropTypes.string,
    date: PropTypes.string,
    genre: PropTypes.string,
    cover_url: PropTypes.string,
    ratings: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.number,
      grade: PropTypes.number,
    })),
    averageRating: PropTypes.number,
  }),
  validate: PropTypes.func,
};

export default BookForm;