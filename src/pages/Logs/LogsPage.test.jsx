// src/pages/Logs/LogsPage.test.jsx
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('./LogsPage.module.css', () => ({ default: {} }));
// Mock toutes les images
vi.mock('../../images/library.webp', () => ({ default: 'library.webp' }));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      role: 'admin',
    },
  }),
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
    vi.useFakeTimers();
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
});
