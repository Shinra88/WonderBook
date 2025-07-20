// 📁 src/pages/NotFound/NotFound.jsx
import Banner from '../../images/library.png';
import { useTranslation } from 'react-i18next';
import styles from './NotFound.module.css';

function NotFound() {
  const { t } = useTranslation();
  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  return (
    <div id="topPage" className={styles.NotFound}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <section className={styles.errorNotice}>
            <h2>{t('NotFound.Error404')}</h2>
            <h4>{t('NotFound.PageNotFound')}</h4>
        </section>
      </main>
    </div>
  );
}

export default NotFound;
