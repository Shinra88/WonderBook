import { useState, useEffect } from 'react';
import Banner from '../../images/library.webp';
import styles from './LogsPage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { getAllLogs } from '../../services/logsService';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faUser,
  faBook,
  faComment,
  faMessage,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../components/Pagination/Pagination';

function LogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [allLogs, setAllLogs] = useState([]);
  const [showToast] = useState(false);
  const [selectedTab, setSelectedTab] = useState('site');
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

  const getLogsForTab = (logs, tab) => {
    if (tab === 'site') {
      return logs.filter(
        log => !log.targetType || !['forum_topic', 'forum_post'].includes(log.targetType)
      );
    } else if (tab === 'forum') {
      return logs.filter(log => ['forum_topic', 'forum_post'].includes(log.targetType));
    }
    return logs;
  };

  // Filtrage côté client
  const tabFilteredLogs = getLogsForTab(allLogs, selectedTab);

  const filteredLogs = tabFilteredLogs.filter(log => {
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

  const handleTabClick = tab => {
    setSelectedTab(tab);
    setCurrentPage(1);
    setTypeFilter('all');
  };

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
      case 'forum_topic':
        return faClipboardList;
      case 'forum_post':
        return faMessage;
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
      case 'forum_topic':
        return '#8b5cf6';
      case 'forum_post':
        return '#ec4899';
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

  const getFilterOptions = () => {
    if (selectedTab === 'site') {
      return [
        { value: 'all', label: 'Tous les types' },
        { value: 'user', label: 'Utilisateurs' },
        { value: 'book', label: 'Livres' },
        { value: 'comment', label: 'Commentaires' },
      ];
    } else if (selectedTab === 'forum') {
      return [
        { value: 'all', label: 'Tous les types' },
        { value: 'forum_topic', label: 'Sujets' },
        { value: 'forum_post', label: 'Posts' },
      ];
    }
    return [];
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

          <div className={styles.menu}>
            <button
              type="button"
              className={selectedTab === 'site' ? styles.active : styles.inactive}
              onClick={() => handleTabClick('site')}>
              Site ({getLogsForTab(allLogs, 'site').length})
            </button>
            <button
              type="button"
              className={selectedTab === 'forum' ? styles.active : styles.inactive}
              onClick={() => handleTabClick('forum')}>
              Forum ({getLogsForTab(allLogs, 'forum').length})
            </button>
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{tabFilteredLogs.length}</span>
              <span className={styles.statLabel}>Total {selectedTab}</span>
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

        <div className={styles.filtersContainer}>
          <div className={styles.radioGroup}>
            {getFilterOptions().map(option => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={typeFilter === option.value}
                  onChange={() => setTypeFilter(option.value)}
                />
                {option.label}
              </label>
            ))}
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
            <p className={styles.noResults}>Aucun log trouvé dans la section {selectedTab}</p>
          ) : (
            <table className={styles.logsTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Utilisateur</th>
                  <th>Action</th>
                  <th>Type</th>
                  <th>ID Cible</th>
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
