import Map from '../../images/map_footer.png';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.Footer}>
      <div className={styles.MapBlock}>
        <img src={Map} alt="Position Géographique Wonderbook" />
        <address>
          {'Place Pereire'}
          <br />
          64100 Bayonne
          <br />
          <a className={styles.MapLink} target="_blank" href={'https://www.google.fr/maps/place/Gare+de+Bayonne/@43.4967847,-1.4730126,17z/data=!3m1!4b1!4m6!3m5!1s0xd5140edb3f3acf9:0xcccc210cb4db926e!8m2!3d43.4967808!4d-1.4704377!16s%2Fm%2F0g9wc83?hl=fr&entry=ttu&g_ep=EgoyMDI1MDQyOC4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D'} rel="noreferrer">
            {t('Footer.TextMap')}
          </a>
        </address>
      </div>
      <p>01 12 23 34 45</p>
      <p>Copyright 2024 - 2025</p>
      <p>{t('Footer.LegalMentions')}</p>
    </footer>

  );
}

export default Footer;
