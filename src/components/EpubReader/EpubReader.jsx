import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReactReader } from 'react-reader';
import {
  getUserCollection,
  getReadingProgress,
  saveReadingProgress,
} from '../../services/collectionService';
import styles from './EpubReader.module.css';

function EpubReader() {
  const { bookId } = useParams();
  const [location, setLocation] = useState(null);
  const [epubUrl, setEpubUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const renditionRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getUserCollection();
      const item = data.find(b => b.books.bookId === parseInt(bookId));
      setEpubUrl(item?.books?.ebook_url || null);

      const saved = await getReadingProgress(bookId);
      setLocation(saved || localStorage.getItem(`reading-position-${bookId}`));
    }
    fetchData();
  }, [bookId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleLocationChange = loc => {
    setLocation(loc);
    saveReadingProgress(bookId, loc);
    localStorage.setItem(`reading-position-${bookId}`, loc);

    if (renditionRef.current?.book?.locations) {
      const perc = renditionRef.current.book.locations.percentageFromCfi(loc);
      setProgress(perc);
    }
  };

  const handleSliderChange = async value => {
    const rendition = renditionRef.current;
    const book = rendition?.book;
    const percentage = parseFloat(value);

    if (!book?.locations) return;

    try {
      await book.locations.ready;
      const cfi = book.locations.cfiFromPercentage(percentage);
      if (cfi && cfi !== 'epubcfi()') {
        await rendition.display(cfi);
      }
    } catch (err) {
      console.error('❌ Erreur slider :', err);
    }
  };

  const goFullscreen = () => {
    if (wrapperRef.current?.requestFullscreen) {
      wrapperRef.current.requestFullscreen().then(() => {
        setTimeout(() => {
          if (renditionRef.current && location) {
            renditionRef.current.display(location);
          }
        }, 300);
      });
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`${styles.readerContainer} ${isFullscreen ? styles.fullscreen : styles.standard}`}>
      {epubUrl ? (
        <>
          <button onClick={goFullscreen} className={styles.fullscreenButton}>
            🖥️ Plein écran
          </button>

          <ReactReader
            url={epubUrl}
            location={location}
            locationChanged={handleLocationChange}
            getRendition={rendition => {
              renditionRef.current = rendition;
              rendition.themes.default({
                body: {
                  background: 'white',
                  color: 'black',
                  fontSize: '100%',
                },
              });

              rendition.book.ready.then(() => {
                rendition.book.locations.generate(1000).then(() => {});
              });
            }}
            showToc={false}
          />

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={progress}
            onChange={e => setProgress(parseFloat(e.target.value))}
            onMouseUp={e => handleSliderChange(e.target.value)}
            onTouchEnd={e => handleSliderChange(e.target.value)}
            className={styles.slider}
          />
        </>
      ) : (
        <p style={{ textAlign: 'center' }}>📖 Chargement du livre…</p>
      )}
    </div>
  );
}

export default EpubReader;
