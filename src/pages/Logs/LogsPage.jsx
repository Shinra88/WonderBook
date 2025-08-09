import { useState, useEffect } from 'react';
import Banner from '../../images/library.webp';
import styles from './Logspage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { getAllLogs } from '../../services/logsService';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faUser,
  faBook,
  faComment,
  faComments,
} from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../components/Pagination/Pagination';

function LogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [allLogs, setAllLogs] = useState([]);
  const [showToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const logsPerPage = 25;

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      getAllLogs({
        page: 1,
        limit: 1000,
        userId: '',
        targetType: '',
        action: '',
        startDate: '',
        endDate: '',
      })
        .then(({ logs }) => {
          setAllLogs(logs || []);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des logs:', error);
          alert('Erreur lors du chargement des logs');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isAdmin]);

  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  // Filtrage côté client
  const filteredLogs = allLogs.filter(log => {
    const matchesSearch =
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || log.targetType === typeFilter;
    const matchesUserId = !userIdFilter || log.userId.toString() === userIdFilter;

    let matchesDate = true;
    if (dateFilter.startDate || dateFilter.endDate) {
      const logDate = new Date(log.created_at);
      if (dateFilter.startDate) {
        matchesDate = matchesDate && logDate >= new Date(dateFilter.startDate);
      }
      if (dateFilter.endDate) {
        matchesDate = matchesDate && logDate <= new Date(dateFilter.endDate);
      }
    }

    return matchesSearch && matchesType && matchesUserId && matchesDate;
  });

  // Pagination côté client
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, userIdFilter, dateFilter]);

  const getTargetTypeIcon = targetType => {
    switch (targetType) {
      case 'user':
        return faUser;
      case 'book':
        return faBook;
      case 'comment':
        return faComment;
      case 'subject':
        return faComments;
      default:
        return faMagnifyingGlass;
    }
  };

  const getTargetTypeColor = targetType => {
    switch (targetType) {
      case 'user':
        return '#3b82f6';
      case 'book':
        return '#10b981';
      case 'comment':
        return '#f59e0b';
      case 'subject':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const formatDate = date => {
    return new Date(date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setUserIdFilter('');
    setDateFilter({ startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  if (!isAdmin) {
    return (
      <div className={styles.LogsPage}>
        <div className={styles.banner} style={backgroundImageStyle} />
        <main className={styles.main}>
          <div className={styles.unauthorized}>
            <h2>Accès non autorisé</h2>
            <p>Vous devez être administrateur pour accéder à cette page.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div id="topPage" className={styles.LogsPage}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <div className={styles.headContainer}>
          <h2>Journaux d&apos;activité</h2>

          {/* Statistiques rapides */}
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{allLogs.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{filteredLogs.length}</span>
              <span className={styles.statLabel}>Filtrés</span>
            </div>
          </div>

          <div className={styles.searchBar}>
            <div className={styles.inputSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher une action ou un utilisateur..."
              />
              <button type="button">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>

          {showToast && <ToastSuccess message="Filtres appliqués" />}
        </div>

        {/* Filtres avancés */}
        <div className={styles.filtersContainer}>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="type"
                value="all"
                checked={typeFilter === 'all'}
                onChange={() => setTypeFilter('all')}
              />
              Tous les types
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="user"
                checked={typeFilter === 'user'}
                onChange={() => setTypeFilter('user')}
              />
              Utilisateurs
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="book"
                checked={typeFilter === 'book'}
                onChange={() => setTypeFilter('book')}
              />
              Livres
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="comment"
                checked={typeFilter === 'comment'}
                onChange={() => setTypeFilter('comment')}
              />
              Commentaires
            </label>
          </div>

          <div className={styles.additionalFilters}>
            <div className={styles.filterGroup}>
              <label>ID Utilisateur :</label>
              <input
                type="number"
                value={userIdFilter}
                onChange={e => setUserIdFilter(e.target.value)}
                placeholder="ID utilisateur"
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Du :</label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={e => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Au :</label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={e => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                className={styles.filterInput}
              />
            </div>

            <button onClick={resetFilters} className={styles.resetButton}>
              Réinitialiser
            </button>
          </div>
        </div>

        <section className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>Chargement des logs...</div>
          ) : currentLogs.length === 0 ? (
            <p className={styles.noResults}>Aucun log trouvé</p>
          ) : (
            <table className={styles.logsTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Utilisateur</th>
                  <th>Action</th>
                  <th>Type</th>
                  <th>Cible</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map(log => (
                  <tr key={log.logId}>
                    <td className={styles.logDate}>{formatDate(log.created_at)}</td>
                    <td className={styles.logUser}>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{log.user?.name || 'Inconnu'}</span>
                        <span className={styles.userRole}>({log.user?.role || 'N/A'})</span>
                      </div>
                    </td>
                    <td className={styles.logAction}>{log.action}</td>
                    <td className={styles.logType}>
                      {log.targetType && (
                        <div className={styles.typeIndicator}>
                          <FontAwesomeIcon
                            icon={getTargetTypeIcon(log.targetType)}
                            style={{ color: getTargetTypeColor(log.targetType) }}
                          />
                          <span>{log.targetType}</span>
                        </div>
                      )}
                    </td>
                    <td className={styles.logTarget}>{log.targetId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className={styles.up_container}>
            <a href="#topPage" className={styles.up}>
              Retour en haut
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

export default LogsPage;
