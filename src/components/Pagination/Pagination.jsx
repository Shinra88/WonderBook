// src/components/Pagination/Pagination.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Pagination.module.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ◀ Précédent
      </button>

      <span>Page {currentPage} / {totalPages}</span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Suivant ▶
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
