// src/components/Pagination/Pagination.jsx
import PropTypes from 'prop-types';
import styles from './Pagination.module.css';
import { useTranslation } from 'react-i18next';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslation();

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ◀ {t('Pagination.Previous')}
      </button>

      <span>Page {currentPage} / {totalPages}</span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {t('Pagination.Next')} ▶
      </button>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
