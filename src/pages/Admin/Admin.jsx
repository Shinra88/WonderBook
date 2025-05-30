import React, { useState, useEffect } from 'react';
import Banner from '../../images/library.png';
import Avatar from '../../images/avatar.png';
import styles from './Admin.module.css';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers, updateUserStatus } from '../../services/adminServices';
import UserEditModal from '../../modals/UserEditModal/UserEditModal';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../components/Pagination/Pagination';

function Admin() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 10;
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  useEffect(() => {
    if (isAdmin) {
      getAllUsers({
        page: currentPage,
        limit: usersPerPage,
        search: searchQuery,
        status: statusFilter,
      })
        .then(({ users, total }) => {
          setUsers(users);
          setTotalUsers(total);
        })
        .catch(() => alert("Erreur chargement des utilisateurs"));
    }
  }, [user, currentPage, searchQuery, statusFilter]);

  const backgroundImageStyle = { backgroundImage: `url(${Banner})` };

  const handleEditUser = (target) => {
    if (!isAdmin && user?.role !== 'moderator') return;
    setSelectedUser(target);
    setShowModal(true);
  };

  const handleToggleStatus = async (targetUser) => {
    if (targetUser.status === 'banned') return;
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';

    try {
      const updated = await updateUserStatus(targetUser.userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.userId === updated.userId ? updated : u))
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error('Erreur statut utilisateur:', err);
      alert('Erreur lors du changement de statut.');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div id="topPage" className={styles.Admin}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <div className={styles.headContainer}>
          <h2>Gestion des utilisateurs</h2>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="status"
                value="all"
                checked={statusFilter === 'all'}
                onChange={() => setStatusFilter('all')}
              />
              Tous
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="active"
                checked={statusFilter === 'active'}
                onChange={() => setStatusFilter('active')}
              />
              Actifs
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="suspended"
                checked={statusFilter === 'suspended'}
                onChange={() => setStatusFilter('suspended')}
              />
              Suspendus
            </label>
          </div>

          <div className={styles.searchBar}>
            <div className={styles.inputSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un utilisateur par nom"
              />
              <button type="button">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>

          {showToast && <ToastSuccess message="Modifications enregistrées ✔️" />}
        </div>

        <section className={styles.tableContainer}>
          {users.length === 0 ? (
            <p>Aucun utilisateur trouvé.</p>
          ) : (
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Pseudo</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Date inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.userId}
                    onClick={() => (isAdmin) && handleEditUser(u)}
                    className={(isAdmin || user?.role === 'moderator') ? styles.clickableRow : ''}
                  >
                    <td>
                      <img
                        src={u.avatar?.startsWith('http') ? u.avatar : Avatar}
                        alt="avatar"
                        className={styles.avatar}
                      />
                    </td>
                    <td>{u.name}</td>
                    <td>{u.mail}</td>
                    <td>{u.role}</td>
                    <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      {u.status === 'banned' ? (
                        <span className={styles.banned}>Banni</span>
                      ) : (
                        (isAdmin || user?.role === 'moderator') && (
                          <button
                            className={u.status === 'suspended' ? styles.activateBtn : styles.suspendBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(u);
                            }}
                          >
                            {u.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className={styles.up_container}>
            <a href="#topPage" className={styles.up}>Haut de page</a>
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

      {showModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={(updatedUser) => {
            setUsers((prev) =>
              prev.map((u) =>
                u.userId === updatedUser.userId ? { ...u, ...updatedUser } : u
              )
            );
            setShowModal(false);
          }}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

export default Admin;
