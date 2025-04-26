//ToastSuccess.jsx
import React from 'react';
import styles from './ToastSuccess.module.css'; // à créer : position fixe, transition, couleur verte

export default function ToastSuccess({ message }) {
  return (
    <div className={styles.toast}>
      <span>✅ {message}</span>
    </div>
  );
}
