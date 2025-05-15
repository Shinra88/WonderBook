import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
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
        console.error("Erreur lors de la récupération des données :", error);
      }
    }

    fetchTopicAndPosts();
  }, [topicId]);

  const handleSuccess = async () => {
    try {
      const updatedPosts = await getPostsByTopicId(topicId);
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des posts :", error);
    }
  };

  if (!topic) return <h1>Chargement du topic...</h1>;

  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  const canModerate = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div className={styles.TopicDetail}>
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
                Répondre au sujet
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
            <h3 className={styles.lockedMessage}>Ce sujet est verrouillé.</h3>
          )}



          <h2>{topic.title}</h2>

          <div className={styles.searchBar}>
            <div className={styles.inputSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher dans les réponses"
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
                    alert("Erreur lors du verrouillage du sujet.");
                  }
                }}
              >
                {topic.locked ? "Déverrouiller" : "Verrouiller"}
              </button>

              <button
                className={styles.pinButton}
                onClick={async () => {
                  try {
                    await updateTopicNotice(topic._id, user.token);
                    setTopic(prev => ({ ...prev, notice: !prev.notice }));
                  } catch (err) {
                    alert("Erreur lors du changement d'état épinglé.");
                    console.error(err);
                  }
                }}
              >
                {topic.notice ? "Désépingler" : "Épingler"}
              </button>

              <button
                className={styles.deleteTopicButton}
                onClick={async () => {
                  const confirmDelete = window.confirm("Supprimer ce sujet et toutes ses réponses ?");
                  if (!confirmDelete) return;

                  try {
                    await deleteTopic(topic._id, user.token);
                    setToastMessage("Sujet supprimé avec succès ✅");
                    setShowToast(true);
                    setTimeout(() => {
                      setShowToast(false);
                      window.location.href = "/Forum";
                    }, 2000);
                  } catch (err) {
                    alert("Erreur lors de la suppression du sujet.");
                  }
                }}
              >
                Supprimer le sujet
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
              <p><strong>Auteur :</strong> {topic.authorName}</p>
              <p><strong>Créé le :</strong> {new Date(topic.created_at).toLocaleDateString()}</p>
            </div>
            <div className={styles.authorContent}>
            {topic.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
            </div>
          </div>

          <h3>Réponses :</h3>
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
                      <p><strong>{post.userName}</strong></p>
                      <p><strong>Posté le :</strong> {new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    {canModerate && (
                      <button
                        className={styles.deletePostButton}
                        onClick={async () => {
                          try {
                            await deletePost(post._id, user.token);
                            setPosts(prev => prev.filter(p => p._id !== post._id));
                            setToastMessage("Post supprimé avec succès ✅");
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 2000);
                          } catch (err) {
                            alert("Erreur lors de la suppression.");
                          }
                        }}
                      >
                        Supprimer
                      </button>
                    )}
                    <div className={styles.postContent}>
                      <p>{post.content}</p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p>Aucune réponse ne correspond à votre recherche.</p>
            )}
          </ul>

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
