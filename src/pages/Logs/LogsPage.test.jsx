// src/pages/Logs/LogsPage.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('./LogsPage.module.css', () => ({ default: {} }));
vi.mock('../../images/library.webp', () => ({ default: 'library.webp' }));

const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

vi.mock('../../services/logsService', () => ({
  getAllLogs: vi.fn(),
}));

vi.mock('../../components/Pagination/Pagination', () => ({
  default: ({ currentPage, totalPages }) => (
    <div data-testid="pagination">
      Page {currentPage} of {totalPages}
    </div>
  ),
}));

vi.mock('../../components/ToastSuccess/ToastSuccess', () => ({
  default: ({ message }) => <div data-testid="toast">{message}</div>,
}));

import LogsPage from './LogsPage';
import { getAllLogs } from '../../services/logsService';

const mockLogs = [
  {
    logId: 1,
    userId: 1,
    action: 'Utilisateur suspendu : JohnDoe',
    targetId: 5,
    targetType: 'user',
    created_at: '2024-01-15T10:30:00Z',
    user: { name: 'AdminUser', role: 'admin' },
  },
  {
    logId: 2,
    userId: 2,
    action: 'Livre ajouté : "Test Book"',
    targetId: 10,
    targetType: 'book',
    created_at: '2024-01-14T14:20:00Z',
    user: { name: 'ModeratorUser', role: 'moderator' },
  },
  {
    logId: 3,
    userId: 3,
    action: 'Commentaire ajouté sur "Dune"',
    targetId: 15,
    targetType: 'comment',
    created_at: '2024-01-13T16:45:00Z',
    user: { name: 'RegularUser', role: 'user' },
  },
  {
    logId: 4,
    userId: 1,
    action: 'Sujet créé: "Discussion"',
    targetId: 1991709239,
    targetType: 'forum_topic',
    created_at: '2024-01-12T09:15:00Z',
    user: { name: 'AdminUser', role: 'admin' },
  },
  {
    logId: 5,
    userId: 2,
    action: 'Post ajouté dans le sujet',
    targetId: 1991709240,
    targetType: 'forum_post',
    created_at: '2024-01-11T11:20:00Z',
    user: { name: 'ModeratorUser', role: 'moderator' },
  },
];

describe('LogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { role: 'admin' },
    });
    getAllLogs.mockResolvedValue({ logs: mockLogs });
  });

  test('should render without crashing', () => {
    render(<LogsPage />);
    expect(document.body).toBeInTheDocument();
  });

  test('should display main elements for admin', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Journaux d'activité/i })).toBeInTheDocument();
    });
  });

  test('should show unauthorized message for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'user' },
    });

    render(<LogsPage />);

    expect(screen.getByText('Accès non autorisé')).toBeInTheDocument();
  });

  test('should display tabs with counts', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Site \(3\)/)).toBeInTheDocument();
      expect(screen.getByText(/Forum \(2\)/)).toBeInTheDocument();
    });
  });

  test('should display search input', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Rechercher une action/)).toBeInTheDocument();
    });
  });

  test('should display filter options', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('Tous les types')).toBeInTheDocument();
      expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
      expect(screen.getByText('Livres')).toBeInTheDocument();
      expect(screen.getByText('Commentaires')).toBeInTheDocument();
    });
  });

  test('should display logs table', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Utilisateur')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  test('should display log entries', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('Utilisateur suspendu : JohnDoe')).toBeInTheDocument();
      expect(screen.getByText('Livre ajouté : "Test Book"')).toBeInTheDocument();
      expect(screen.getByText('Commentaire ajouté sur "Dune"')).toBeInTheDocument();
    });
  });

  test('should format dates correctly', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
    });
  });

  test('should display type indicators', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('book')).toBeInTheDocument();
      expect(screen.getByText('comment')).toBeInTheDocument();
    });
  });

  test('should display reset button', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    });
  });

  test('should handle API errors gracefully', async () => {
    getAllLogs.mockRejectedValueOnce(new Error('API Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<LogsPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  test('should show loading state', () => {
    getAllLogs.mockImplementationOnce(() => new Promise(() => {}));

    render(<LogsPage />);

    expect(screen.getByText('Chargement des logs...')).toBeInTheDocument();
  });

  test('should display statistics cards', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('Total site')).toBeInTheDocument();
      expect(screen.getByText('Filtrés')).toBeInTheDocument();
    });
  });

  test('should have proper component structure', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      // Vérifier que les éléments principaux sont présents
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Retour en haut')).toBeInTheDocument();
    });
  });

  test('should display date filter inputs', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('Du :')).toBeInTheDocument();
      expect(screen.getByText('Au :')).toBeInTheDocument();
      expect(screen.getByText('ID Utilisateur :')).toBeInTheDocument();
    });
  });
});
