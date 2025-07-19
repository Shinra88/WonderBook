//ToastSuccess.jsx
import styles from './ToastSuccess.module.css';

export default function ToastSuccess({ message }) {
  return (
    <div className={styles.toast}>
      <span>✅ {message}</span>
    </div>
  );
}
