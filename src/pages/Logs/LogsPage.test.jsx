// src/pages/Logs/LogsPage.test.jsx
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock toutes les images
vi.mock('../../images/library.webp', () => ({ default: 'library.webp' }));

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      role: 'admin',
    },
  }),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

// Mock des services
vi.mock('../../services/logsService', () => ({
  getAllLogs: vi.fn(),
}));

// Mock des composants
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

// Données de test
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
    action: 'Livre ajouté : "Test Book" par Test Author',
    targetId: 10,
    targetType: 'book',
    created_at: '2024-01-14T14:20:00Z',
    user: { name: 'ModeratorUser', role: 'moderator' },
  },
  {
    logId: 3,
    userId: 3,
    action: 'Commentaire ajouté sur "Dune" (Note: 5/5)',
    targetId: 15,
    targetType: 'comment',
    created_at: '2024-01-13T16:45:00Z',
    user: { name: 'RegularUser', role: 'user' },
  },
];

describe('LogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // ✅ Ajout pour supprimer les warnings act()
    getAllLogs.mockResolvedValue({ logs: mockLogs });
  });

  afterEach(() => {
    // ✅ Nettoyer les timers après chaque test
    vi.runAllTimers();
    vi.useRealTimers();
  });

  test('should render without crashing', () => {
    render(<LogsPage />);
    expect(document.body).toBeInTheDocument();
  });

  test('should display main elements', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Journaux d'activité/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Rechercher une action/)).toBeInTheDocument();
    });
  });

  test('should show filter options', () => {
    render(<LogsPage />);

    expect(screen.getByLabelText('Tous les types')).toBeInTheDocument();
    expect(screen.getByLabelText('Utilisateurs')).toBeInTheDocument();
    expect(screen.getByLabelText('Livres')).toBeInTheDocument();
    expect(screen.getByLabelText('Commentaires')).toBeInTheDocument();
  });

  test('should display logs after loading', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('Utilisateur suspendu : JohnDoe')).toBeInTheDocument();
      expect(screen.getByText('Livre ajouté : "Test Book" par Test Author')).toBeInTheDocument();
      expect(screen.getByText('AdminUser')).toBeInTheDocument();
    });
  });

  test('should show loading state', async () => {
    getAllLogs.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<LogsPage />);

    expect(screen.getByText('Chargement des logs...')).toBeInTheDocument();
  });

  test('should show statistics', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Filtrés')).toBeInTheDocument();
      // Vérifier qu'il y a au moins un élément avec le nombre 3
      expect(screen.getAllByText('3')).toHaveLength(2); // Total et Filtrés
    });
  });

  test('should filter logs by search', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('Utilisateur suspendu : JohnDoe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Rechercher une action/);
    fireEvent.change(searchInput, { target: { value: 'livre' } });

    await waitFor(() => {
      expect(screen.getByText('Livre ajouté : "Test Book" par Test Author')).toBeInTheDocument();
      expect(screen.queryByText('Utilisateur suspendu : JohnDoe')).not.toBeInTheDocument();
    });
  });

  test('should filter logs by type', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('Utilisateur suspendu : JohnDoe')).toBeInTheDocument();
    });

    const bookFilter = screen.getByLabelText('Livres');
    fireEvent.click(bookFilter);

    await waitFor(() => {
      expect(screen.getByText('Livre ajouté : "Test Book" par Test Author')).toBeInTheDocument();
      expect(screen.queryByText('Utilisateur suspendu : JohnDoe')).not.toBeInTheDocument();
    });
  });

  test('should reset filters', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('Utilisateur suspendu : JohnDoe')).toBeInTheDocument();
    });

    // Apply filter
    const searchInput = screen.getByPlaceholderText(/Rechercher une action/);
    fireEvent.change(searchInput, { target: { value: 'livre' } });

    // Reset filters
    const resetButton = screen.getByText('Réinitialiser');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(searchInput.value).toBe('');
      expect(screen.getByText('Utilisateur suspendu : JohnDoe')).toBeInTheDocument();
    });
  });

  test('should show pagination for many logs', async () => {
    const manyLogs = Array.from({ length: 30 }, (_, i) => ({
      ...mockLogs[0],
      logId: i + 1,
      action: `Action ${i + 1}`,
    }));

    getAllLogs.mockResolvedValue({ logs: manyLogs });

    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  test('should show empty state when no logs', async () => {
    getAllLogs.mockResolvedValue({ logs: [] });

    const { container } = render(<LogsPage />);

    await waitFor(() => {
      // Vérifier qu'aucun log n'est affiché dans le tableau
      expect(screen.queryByText('Utilisateur suspendu : JohnDoe')).not.toBeInTheDocument();
      expect(screen.queryByText('Livre ajouté')).not.toBeInTheDocument();

      // Vérifier que l'élément noResults existe
      const noResults = container.querySelector('[class*="noResults"]');
      expect(noResults).toBeTruthy();
    });
  });

  test('should show up page link', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Retour en haut/i })).toBeInTheDocument();
    });
  });

  test('should display user roles correctly', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('(admin)')).toBeInTheDocument();
      expect(screen.getByText('(moderator)')).toBeInTheDocument();
      expect(screen.getByText('(user)')).toBeInTheDocument();
    });
  });

  test('should show target types with correct labels', async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('book')).toBeInTheDocument();
      expect(screen.getByText('comment')).toBeInTheDocument();
    });
  });
});
