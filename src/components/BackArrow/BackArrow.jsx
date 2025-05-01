import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import styles from './BackArrow.module.css';
import { useNavigate } from 'react-router-dom';
import React from 'react';

function BackArrow() {
  const navigate = useNavigate();


  const handleBack = () => {

    navigate(-1);

  };
  return (
    <button onClick={handleBack} className={styles.backArrow}>
      <FontAwesomeIcon icon={faChevronLeft} />
    </button>
  );
}

export default BackArrow;
