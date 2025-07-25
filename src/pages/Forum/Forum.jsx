import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Banner from '../../images/library.webp';
import { getTopics } from '../../services/topicsService';
import TopicModal from '../../modals/TopicModal/TopicModal';
import { useAuth } from '../../hooks/useAuth';
import Pagination from '../../components/Pagination/Pagination';
import { useTranslation } from 'react-i18next';
import styles from './Forum.module.css';

function Forum() {
  const [topics, setTopics] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const subjectsPerPage = 10;
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchTopics() {
      try {
        const fetchedTopics = await getTopics();
        setTopics(fetchedTopics);
      } catch (error) {
        console.error(t('ErrorFetchingTopics:'), error);
      }
    }
    fetchTopics();
  }, []);

  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  const handleTopicClick = topicId => {
    navigate(`/topic/${topicId}`);
  };

  // Separation of topics according to "notice"
  const noticeTopics = topics.filter(topic => topic.notice === true);
  const subjectTopics = topics.filter(topic => topic.notice === false);

  // Filter by search (in title only here)
  const filteredNotices = noticeTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjectTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastSubject = currentPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = filteredSubjects.slice(indexOfFirstSubject, indexOfLastSubject);
  const totalPages = Math.ceil(filteredSubjects.length / subjectsPerPage);

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div id="topPage" className={styles.Forum}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <header className={styles.head}>
          {user ? (
            <div className={styles.actions}>
              <button onClick={() => setIsModalOpen(true)} className={styles.createButton}>
                {t('Forum.CreateTopic')}
              </button>
            </div>
          ) : (
            <div style={{ width: '10rem' }} />
          )}

          {user && isModalOpen && (
            <TopicModal
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => {
                setIsModalOpen(false);
                window.location.reload();
              }}
            />
          )}

          <div className={styles.searchBar}>
            <div className={styles.inputSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('Forum.SearchPlaceholder')}
              />
              <button type="button">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>
        </header>
        <section className={styles.Notice}>
          <h2>{t('Forum.Notices')}</h2>
        </section>
        <section className={styles.subjectList}>
          <ul>
            {filteredNotices.length > 0 ? (
              filteredNotices.map(topic => (
                <li
                  key={topic._id}
                  className={styles.topicItem}
                  onClick={() => handleTopicClick(topic._id)}>
                  <h3>{topic.title}</h3>
                </li>
              ))
            ) : (
              <p>{t('Forum.NoTopicsFound')}</p>
            )}
          </ul>
        </section>

        <section className={styles.Subject}>
          <h2>{t('Forum.Subjects')}</h2>
        </section>
        <section className={styles.subjectList}>
          <ul>
            {currentSubjects.length > 0 ? (
              currentSubjects.map(topic => (
                <li
                  key={topic._id}
                  className={styles.topicItem}
                  onClick={() => handleTopicClick(topic._id)}>
                  <h3>{topic.title}</h3>
                </li>
              ))
            ) : (
              <p>{t('Forum.NoTopicsFound')}</p>
            )}
          </ul>
          <div className={styles.up_container}>
            <a href="#topPage" className={styles.up}>
              {t('Forum.BackToTop')}
            </a>
          </div>

          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Forum;
