import * as PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './BookRatingForm.module.css';
import { generateStarsInputs, displayStars } from '../../../utils/helpers';
import { APP_ROUTES } from '../../../utils/constants';
import { useUser } from '../../../hooks/customHooks';
import { useTranslation } from 'react-i18next';
import { rateBook } from '../../../services/bookService';

function BookRatingForm({
  rating, setRating, userId, setBook, id, userRated,
}) {
  const { connectedUser, auth } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, formState, handleSubmit } = useForm({
    mode: 'onChange',
    defaultValues: {
      rating: 0,
    },
  });
  useEffect(() => {
    if (formState.dirtyFields.rating) {
      const rate = document.querySelector('input[name="rating"]:checked').value;
      setRating(parseInt(rate, 10));
      formState.dirtyFields.rating = false;
    }
  }, [formState]);
  const onSubmit = async () => {
    if (!connectedUser || !auth) {
      navigate(APP_ROUTES.SIGN_IN);
    }
    const update = await rateBook(id, userId, rating);
    if (update) {
      setBook({ ...update, id: update._id });
    } else {
      alert(update);
    }
  };
  return (
    <div className={styles.BookRatingForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>{rating > 0 ? t('BookDisplay.YourRating') : t('BookDisplay.RateThisBook')}</p>
        <div className={styles.Stars}>
          {!userRated ? generateStarsInputs(rating, register) : displayStars(rating)}
        </div>
        {!userRated ? <button type="submit">{t('BookDisplay.Validate')}</button> : null}
      </form>
    </div>
  );
}

BookRatingForm.propTypes = {
  rating: PropTypes.number.isRequired,
  setRating: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  setBook: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  userRated: PropTypes.bool.isRequired,
};

export default BookRatingForm;
