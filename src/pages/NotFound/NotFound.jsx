// 📁 src/pages/NotFound/NotFound.jsx
import Banner from '../../images/library.png';
import styles from './NotFound.module.css';

function NotFound() {
  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  return (
    <div id="topPage" className={styles.NotFound}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <section className={styles.errorNotice}>
            <h2>Erreur 404</h2>
            <h4>La page que vous cherchez n'existe pas ou a été déplacée.</h4>
        </section>
      </main>
    </div>
  );
}

export default NotFound;
