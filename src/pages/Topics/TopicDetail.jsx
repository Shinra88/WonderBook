import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Banner from '../../images/library.png';
import {
  getTopicById,
  updateTopicNotice,
  deleteTopic,
  toggleTopicLock,
} from '../../services/topicsService';
import { getPostsByTopicId, deletePost } from '../../services/postsService';
import BackArrow from '../../components/BackArrow/BackArrow';
import avatarDefault from '../../images/avatar.png';
import PostModal from '../../modals/PostModal/PostModal';
import Pagination from '../../components/Pagination/Pagination';
import { useAuth } from '../../hooks/useAuth';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import Spoiler from '../../components/Spoiler/Spoiler';
import styles from './TopicDetail.module.css';

function TopicDetail() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const { user } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { t } = useTranslation();
  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    async function fetchTopicAndPosts() {
      try {
        const fetchedTopic = await getTopicById(topicId);
        const fetchedPosts = await getPostsByTopicId(topicId);
        setTopic(fetchedTopic);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error(t('ErrorFetchingDatas', error));
      }
    }

    fetchTopicAndPosts();
  }, [topicId]);

  const handleSuccess = async () => {
    try {
      const updatedPosts = await getPostsByTopicId(topicId);
      setPosts(updatedPosts);
    } catch (error) {
      console.error(t('ErrorRefreshTopics', error));
    }
  };

  if (!topic) return <h1>Chargement du topic...</h1>;

  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  const canModerate = user?.role === 'admin' || user?.role === 'moderator';

  function parseContent(content) {
    const spoilerRegex = /\[spoiler](.*?)\[\/spoiler]/gi;
    const boldRegex = /\[b](.*?)\[\/b]/gi;
    const italicRegex = /\[i](.*?)\[\/i]/gi;
    const underlineRegex = /\[u](.*?)\[\/u]/gi;
    const strikethroughRegex = /\[s](.*?)\[\/s]/gi;

    const parseLine = (line, index) => {
      const matches = { spoiler: [], b: [], i: [], u: [], s: [] };

      let tempLine = line
        .replace(spoilerRegex, (_, p1) => {
          matches.spoiler.push(p1);
          return `__SPOILER__${matches.spoiler.length - 1}__`;
        })
        .replace(boldRegex, (_, p1) => {
          matches.b.push(p1);
          return `__BOLD__${matches.b.length - 1}__`;
        })
        .replace(italicRegex, (_, p1) => {
          matches.i.push(p1);
          return `__ITALIC__${matches.i.length - 1}__`;
        })
        .replace(underlineRegex, (_, p1) => {
          matches.u.push(p1);
          return `__UNDERLINE__${matches.u.length - 1}__`;
        })
        .replace(strikethroughRegex, (_, p1) => {
          matches.s.push(p1);
          return `__STRIKE__${matches.s.length - 1}__`;
        });

      return (
        <div key={index} style={{ marginBottom: '0.5em' }}>
          {tempLine.split(/(__[A-Z]+__\d+__)/).map((part, i) => {
            if (part.startsWith('__SPOILER__')) {
              const id = +part.match(/\d+/)[0];
              return (
                <Spoiler
                  key={`sp-${index}-${i}`}
                  content={<>{parseContent(matches.spoiler[id])}</>}
                />
              );
            }
            if (part.startsWith('__BOLD__')) {
              const id = +part.match(/\d+/)[0];
              return <strong key={`b-${index}-${i}`}>{matches.b[id]}</strong>;
            }
            if (part.startsWith('__ITALIC__')) {
              const id = +part.match(/\d+/)[0];
              return <em key={`i-${index}-${i}`}>{matches.i[id]}</em>;
            }
            if (part.startsWith('__UNDERLINE__')) {
              const id = +part.match(/\d+/)[0];
              return <u key={`u-${index}-${i}`}>{matches.u[id]}</u>;
            }
            if (part.startsWith('__STRIKE__')) {
              const id = +part.match(/\d+/)[0];
              return <s key={`s-${index}-${i}`}>{matches.s[id]}</s>;
            }
            return <span key={`t-${index}-${i}`}>{part}</span>;
          })}
        </div>
      );
    };

    return content.split('\n').map(parseLine);
  }

  return (
    <div id="topPage" className={styles.TopicDetail}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        {showToast && <ToastSuccess message={toastMessage} />}
        <header className={styles.head}>
          <section className={styles.title_container}>
            <div className={styles.backArrowWrapper}>
              <BackArrow />
            </div>

            {user && !topic.locked && (
              <>
                <button onClick={() => setIsModalOpen(true)} className={styles.createButton}>
                  {t('TopicDetail.AnswerTopic')}
                </button>
                {isModalOpen && (
                  <PostModal
                    topicId={topicId}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                  />
                )}
              </>
            )}

            {user && topic.locked && (
              <h3 className={styles.lockedMessage}>{t('TopicDetail.LockedMessage')}</h3>
            )}

            <h2>{topic.title}</h2>

            <div className={styles.searchBar}>
              <div className={styles.inputSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={t('TopicDetail.SearchPlaceholder')}
                />
                <button type="button">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>
            </div>
          </section>
          {canModerate && (
            <>
              <aside className={styles.btn_container}>
                <button
                  className={styles.lockButton}
                  onClick={async () => {
                    try {
                      const res = await toggleTopicLock(topic._id, user.token);
                      setTopic(prev => ({ ...prev, locked: res.locked }));
                    } catch (err) {
                      alert(t('ErrorToggleLock', err));
                    }
                  }}>
                  {topic.locked ? t('TopicDetail.Unlock') : t('TopicDetail.Lock')}
                </button>

                <button
                  className={styles.pinButton}
                  onClick={async () => {
                    try {
                      await updateTopicNotice(topic._id, user.token);
                      setTopic(prev => ({ ...prev, notice: !prev.notice }));
                    } catch (err) {
                      alert(t('ErrorTogglePin', err));
                      console.error(err);
                    }
                  }}>
                  {topic.notice ? t('TopicDetail.Unpin') : t('TopicDetail.Pin')}
                </button>

                <button
                  className={styles.deleteTopicButton}
                  onClick={async () => {
                    const confirmDelete = window.confirm(t('TopicDetail.ConfirmDelete'));
                    if (!confirmDelete) return;

                    try {
                      await deleteTopic(topic._id, user.token);
                      setToastMessage(t('TopicDetail.DeleteSuccess'));
                      setShowToast(true);
                      setTimeout(() => {
                        setShowToast(false);
                        window.location.href = '/Forum';
                      }, 2000);
                    } catch (err) {
                      alert(t('TopicDetail.ErrorDelete', err));
                    }
                  }}>
                  {t('TopicDetail.Delete')}
                </button>
              </aside>
            </>
          )}
        </header>

        <section className={styles.Topic}>
          <div className={styles.author}>
            <div className={styles.authorHead}>
              <img
                src={topic.authorAvatar || avatarDefault}
                alt="Avatar"
                className={styles.avatar}
              />
              <p>
                <strong>{t('TopicDetail.Author')} :</strong> {topic.authorName}
              </p>
              <p>
                <strong>{t('TopicDetail.CreatedOn')} :</strong>{' '}
                {new Date(topic.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className={styles.authorContent}>
              {topic.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          <h3>{t('TopicDetail.Replies')} :</h3>
          <ul>
            {currentPosts.length > 0 ? (
              currentPosts.map(post => (
                <li key={post._id}>
                  <div className={styles.post}>
                    <div className={styles.postHead}>
                      <img
                        src={post.userAvatar || avatarDefault}
                        alt="Avatar"
                        className={styles.avatar}
                      />
                      <p>
                        <strong>{post.userName}</strong>
                      </p>
                      <p>
                        <strong>{t('TopicDetail.CreatedOn')} :</strong>{' '}
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {canModerate && (
                      <button
                        className={styles.deletePostButton}
                        onClick={async () => {
                          try {
                            await deletePost(post._id, user.token);
                            setPosts(prev => prev.filter(p => p._id !== post._id));
                            setToastMessage('Post supprimé avec succès ✅');
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 2000);
                          } catch {
                            alert('Erreur lors de la suppression.');
                          }
                        }}>
                        {t('TopicDetail.Delete')}
                      </button>
                    )}
                    <div className={styles.postContent}>
                      <div>{parseContent(post.content)}</div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p>{t('TopicDetail.NoReplies')}</p>
            )}
          </ul>
          <div className={styles.up_container}>
            <a href="#topPage" className={styles.up}>
              {t('TopicDetail.BackToTop')}
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

export default TopicDetail;
