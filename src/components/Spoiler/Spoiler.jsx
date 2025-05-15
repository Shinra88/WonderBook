import React, { useState } from 'react';
import styles from './Spoiler.module.css';

export default function Spoiler({ content }) {
  const [visible, setVisible] = useState(false);

  return (
    <span className={styles.spoiler} onClick={() => setVisible(!visible)}>
      {visible ? content : <em className={styles.clickToReveal}>🔒 Cliquez pour révéler</em>}
    </span>
  );
}
