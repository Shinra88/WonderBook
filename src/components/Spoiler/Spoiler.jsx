import React, { useState } from 'react';
import styles from './Spoiler.module.css';

export default function Spoiler({ content }) {
  const [visible, setVisible] = useState(false);

  const isInline =
    typeof content === 'string' ||
    (Array.isArray(content) && content.every(c => typeof c === 'string'));

  const Wrapper = isInline ? 'span' : 'div';

  return (
    <Wrapper className={styles.spoiler} onClick={() => setVisible(!visible)}>
     {visible ? content : <span className={styles.clickToReveal}>🔒 Cliquez pour révéler</span>}
    </Wrapper>
  );
}
