import React, { useState, useEffect, setUsers } from 'react';
import Banner from '../../images/library.png';
import Avatar from '../../images/avatar.png';
import FeatherIcon from '../../images/feather.png';
import styles from './Admin.module.css';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers, updateUserById, updateUserStatus } from '../../services/adminServices';
import { updateAvatarOnS3 } from '../../services/uploadServices';
import UserEditModal from '../../modals/UserEditModal/UserEditModal';
import ToastSuccess from '../../components/ToastSuccess/ToastSuccess';

function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const isAdmin = user?.role === 'admin';
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      getAllUsers()
        .then(setUsers)
        .catch(() => alert("Erreur chargement des utilisateurs"));
    }
  }, [user]);

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
        prev.map((u) =>
          u.userId === updated.userId ? updated : u
        )
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error('Erreur statut utilisateur:', err);
      alert('Erreur lors du changement de statut.');
    }
  };   
  
  return (
    <div className={styles.Admin}>
      <div className={styles.banner} style={backgroundImageStyle} />
      <main className={styles.main}>
        <div className={styles.headContainer}>
           <h2>Gestion des utilisateurs</h2>  
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
                    <th>Statut</th>
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
                      <td>{u.status || '—'}</td>
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
