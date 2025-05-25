import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getUserCollection,
  getReadingProgress,
  saveReadingProgress,
} from '../../services/collectionService';
import styles from './ReadBook.module.css';

function ReadBook() {
  const { bookId } = useParams();
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const [bookReady, setBookReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const touchStartX = useRef(0);
  const mouseStartX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    async function loadEpub() {
      try {
        const ePub = (await import('epubjs')).default;
        const data = await getUserCollection();
        const item = data.find(b => b.books.bookId === parseInt(bookId));
        const url = item?.books?.ebook_url;
        if (!url || !viewerRef.current) return;

        const book = ePub(url);
        bookRef.current = book;

        const rendition = book.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          manager: 'default',
          direction: 'ltr',
        });

        renditionRef.current = rendition;

        rendition.themes.default({
          body: {
            background: 'white',
            color: 'black',
            fontSize: '100%',
          },
        });

        const savedCfi =
          (await getReadingProgress(bookId)) ||
          localStorage.getItem(`reading-position-${bookId}`);

        await book.ready;
        await book.locations.generate(1000);
        await book.locations.ready; // 👈 indispensable pour que cfiFromPercentage fonctionne

        await rendition.display(savedCfi || undefined);

        setBookReady(true);

        rendition.on('relocated', (location) => {
          const cfi = location?.start?.cfi;
          const percentage = location?.start?.percentage || 0;
          if (cfi) {
            saveReadingProgress(bookId, cfi);
            localStorage.setItem(`reading-position-${bookId}`, cfi);
          }
          setProgress(percentage);
        });

        const viewer = viewerRef.current;
        const handleSwipe = (startX, endX) => {
          const delta = startX - endX;
          if (delta > 50) rendition.next();
          else if (delta < -50) rendition.prev();
        };

        viewer.addEventListener('touchstart', (e) => {
          touchStartX.current = e.changedTouches[0].screenX;
        });
        viewer.addEventListener('touchend', (e) => {
          const touchEndX = e.changedTouches[0].screenX;
          handleSwipe(touchStartX.current, touchEndX);
        });
        viewer.addEventListener('mousedown', (e) => {
          isDragging.current = true;
          mouseStartX.current = e.clientX;
        });
        viewer.addEventListener('mouseup', (e) => {
          if (!isDragging.current) return;
          isDragging.current = false;
          handleSwipe(mouseStartX.current, e.clientX);
        });

        return () => {
          viewer.removeEventListener('touchstart', () => {});
          viewer.removeEventListener('touchend', () => {});
          viewer.removeEventListener('mousedown', () => {});
          viewer.removeEventListener('mouseup', () => {});
        };
      } catch (err) {
        console.error('❌ Erreur lors du chargement EPUB :', err);
      }
    }

    loadEpub();
  }, [bookId]);

  const goFullscreen = () => {
    if (viewerRef.current?.requestFullscreen) {
      viewerRef.current.requestFullscreen();
    } else {
      console.warn('Le plein écran n’est pas supporté.');
    }
  };

  const handleSliderRelease = async (value) => {
    const book = bookRef.current;
    const rendition = renditionRef.current;
    if (!book || !rendition || !book.locations) return;
  
    const percentage = parseInt(value, 10) / 100;
  
    // Attendre la génération complète des locations
    await book.locations.ready;
    const cfi = book.locations.cfiFromPercentage(percentage);
    console.log("📍 CFI généré :", cfi);
  
    // Reset manuel du rendu avant affichage (force le changement)
    rendition.display(cfi).then(() => {
      console.log("✅ Affichage forcé via .display()");
      // petit délai pour laisser la page se stabiliser
      setTimeout(() => {
        const current = rendition.location?.start?.percentage;
        if (current !== undefined) {
          setProgress(current);
          console.log("✅ Position réelle après setTimeout :", current);
        }
      }, 200); // délai léger pour être sûr que le rendu est terminé
    }).catch(err => {
      console.error("❌ Erreur display slider :", err);
    });
  };  

  return (
    <div className={styles.ReadBook}>
      <main className={styles.main}>
        <div ref={viewerRef} className={styles.viewer}>
          {!bookReady && <p style={{ color: 'gray' }}>📖 Chargement du lecteur...</p>}
        </div>

        {bookReady && (
          <>
            <button onClick={goFullscreen} className={styles.fullscreenButton}>
              🖥️ Plein écran
            </button>

            <div className={styles.sliderWrapper}>
            <input
  type="range"
  min="0"
  max="100"
  value={Math.floor(progress * 100)}
  onChange={(e) => setProgress(e.target.value / 100)}
  onMouseUp={(e) => handleSliderRelease(e.target.value)}
  onTouchEnd={(e) => handleSliderRelease(e.target.value)}
  className={styles.slider}
/>

              <span className={styles.sliderValue}>{Math.floor(progress * 100)}%</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ReadBook;
