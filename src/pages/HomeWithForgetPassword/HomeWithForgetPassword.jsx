import React from 'react';
import { useParams } from 'react-router-dom';
import Home from '../Home/Home';
import ForgetPassword from '../../modals/ForgetPassword/ForgetPassword';
import styles from './HomeWithForgetPassword.module.css';

function HomeWithForgetPassword() {
  const { token } = useParams();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.background}>
        <Home />
      </div>
      <div className={styles.modalOverlay}>
        <ForgetPassword token={token} />
      </div>
    </div>
  );
}

export default HomeWithForgetPassword;
