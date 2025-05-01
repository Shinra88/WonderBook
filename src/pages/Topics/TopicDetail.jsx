import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Banner from '../../images/library.png';
import { getTopicById } from '../../services/topicsService';
import { getPostsByTopicId } from '../../services/postsService';
import BackArrow from '../../components/BackArrow/BackArrow';
import avatarDefault from '../../images/avatar.png';
import PostModal from '../../modals/PostModal/PostModal';
import Pagination from '../../components/Pagination/Pagination';
import { useAuth } from '../../hooks/useAuth';
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


  // 🔍 Filtrage des posts par contenu (défini AVANT la pagination)
  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔢 Pagination sur les posts filtrés
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (newPage) => {
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

  return (
    <div className={styles.TopicDetail}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <header className={styles.head}>
          <div className={styles.backArrowWrapper}>
            <BackArrow />
          </div>
          {user && (
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
          <h2>{topic.title}</h2>
          <div className={styles.searchBar}>
            <div className={styles.inputSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // 🔄 Réinitialise à la première page lors d'une recherche
                }}
                placeholder="Rechercher dans les réponses"
              />
              <button type="button">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>
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
              <p>{topic.content}</p>
            </div>
          </div>

          <h3>Réponses :</h3>
          <ul>
            {currentPosts.length > 0 ? (
              currentPosts.map((post) => (
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
