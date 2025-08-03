import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Admin from './Admin';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockUser = { role: 'admin' };

// Mock de l'authentification
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock de i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key }),
}));

// Mock des services d'administration
vi.mock('../../services/adminServices', async () => {
  return {
    getAllUsers: vi.fn(() =>
      Promise.resolve({
        users: [
          {
            userId: '1',
            name: 'Alice',
            mail: 'alice@example.com',
            avatar: '',
            role: 'user',
            status: 'active',
            created_at: new Date().toISOString(),
          },
          {
            userId: '2',
            name: 'Bob',
            mail: 'bob@example.com',
            avatar: '',
            role: 'moderator',
            status: 'suspended',
            created_at: new Date().toISOString(),
          },
        ],
        total: 20, // 👈 CORRECTION ICI
      })
    ),
    updateUserStatus: vi.fn(userId =>
      Promise.resolve({
        userId,
        status: 'suspended',
      })
    ),
  };
});

// Mock du modal d'édition utilisateur
vi.mock('../../modals/UserEditModal/UserEditModal', () => {
  return {
    default: ({ onClose, onSave }) => (
      <div data-testid="edit-modal">
        <button onClick={() => onSave({ userId: '1', name: 'Updated' })}>
          Admin.Save
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ),
  };
});

describe('Page Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </MemoryRouter>
    );

  test('affiche la liste des utilisateurs sans boucle infinie', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  test('affiche les avatars', async () => {
    renderPage();
    const avatars = await screen.findAllByRole('img', { name: /avatar/i });
    expect(avatars.length).toBeGreaterThan(0);
  });

  test('affiche le champ de recherche', async () => {
    renderPage();
    const input = await screen.findByPlaceholderText(/Admin.Search/i);
    expect(input).toBeInTheDocument();
  });

  test('affiche les filtres radio', async () => {
    renderPage();
    const radios = await screen.findAllByRole('radio');
    expect(radios.length).toBe(3);
  });

  test('peut changer le filtre vers "suspendu"', async () => {
    renderPage();
    const radio = await screen.findByRole('radio', { name: /Admin.SuspendedUsers/i });
    fireEvent.click(radio);
    expect(radio).toBeChecked();
  });

    test('affiche la pagination s’il y a plus d’une page', async () => {
    renderPage();

    const nextBtn = await screen.findByRole('button', { name: /Pagination.Next/i });
    expect(nextBtn).toBeInTheDocument();
    });

  test('affiche le lien retour en haut de page', async () => {
    renderPage();
    const lien = await screen.findByRole('link', { name: /Admin.BackToTop/i });
    expect(lien).toHaveAttribute('href', '#topPage');
  });

  test('le modal d’édition ne s’affiche pas par défaut', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
    });
  });

  test('peut ouvrir le modal d’édition en cliquant sur une ligne utilisateur', async () => {
    renderPage();

    const rows = await screen.findAllByRole('row');
    expect(rows.length).toBeGreaterThan(1);

    fireEvent.click(rows[1]); // Clique sur la première ligne utilisateur

    const modal = await screen.findByTestId('edit-modal');
    expect(modal).toBeInTheDocument();

    const saveBtn = await screen.findByRole('button', { name: /Admin.Save/i });
    expect(saveBtn).toBeInTheDocument();
  });

  test('appelle updateUserStatus en cliquant sur "Suspendre"', async () => {
    const { updateUserStatus } = await import('../../services/adminServices');
    renderPage();

    const boutonSuspendre = await screen.findByRole('button', { name: /Admin.Suspend/i });
    fireEvent.click(boutonSuspendre);

    await waitFor(() => {
      expect(updateUserStatus).toHaveBeenCalled();
    });
  });

  test('affiche une toast après changement de statut réussi', async () => {
    renderPage();

    const boutonSuspendre = await screen.findByRole('button', { name: /Admin.Suspend/i });
    fireEvent.click(boutonSuspendre);

    const toast = await screen.findByText(/Admin.UserUpdated/i);
    expect(toast).toBeInTheDocument();
  });

  test('gère une erreur API lors de getAllUsers', async () => {
    const { getAllUsers } = await import('../../services/adminServices');
    getAllUsers.mockRejectedValueOnce(new Error('fail'));

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderPage();

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Admin.ErrorFetchingUsers');
    });

    alertMock.mockRestore();
  });

  test('gère une erreur API lors de updateUserStatus', async () => {
    const { updateUserStatus } = await import('../../services/adminServices');
    updateUserStatus.mockRejectedValueOnce(new Error('fail'));

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderPage();

    const boutonSuspendre = await screen.findByRole('button', { name: /Admin.Suspend/i });
    fireEvent.click(boutonSuspendre);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Admin.ErrorUpdatingUser');
    });

    alertMock.mockRestore();
  });

  test('empêche de changer le statut d’un utilisateur banni', async () => {
    const { getAllUsers } = await import('../../services/adminServices');
    getAllUsers.mockResolvedValueOnce({
      users: [
        {
          userId: '3',
          name: 'BannedUser',
          mail: 'ban@ex.com',
          avatar: '',
          role: 'user',
          status: 'banned',
          created_at: new Date().toISOString(),
        },
      ],
      total: 1,
    });

    renderPage();

    const label = await screen.findByText('Banni');
    expect(label).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /Suspend/i })).not.toBeInTheDocument();
  });
});
