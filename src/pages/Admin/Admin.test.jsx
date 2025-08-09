// src/pages/Admin/Admin.test.jsx
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Admin from './Admin';

// Mock des dépendances
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { role: 'admin' },
  }),
}));

vi.mock('../../services/adminServices', () => ({
  getAllUsers: vi.fn().mockResolvedValue({
    users: [
      {
        userId: 1,
        name: 'John Doe',
        mail: 'john@example.com',
        role: 'user',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
    total: 1,
  }),
  updateUserStatus: vi.fn().mockResolvedValue({
    userId: 1,
    status: 'suspended',
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

vi.mock('../../components/Pagination/Pagination', () => ({
  default: ({ currentPage, totalPages }) => (
    <div data-testid="pagination">
      Page {currentPage}/{totalPages}
    </div>
  ),
}));

vi.mock('../../components/ToastSuccess/ToastSuccess', () => ({
  default: ({ message }) => <div data-testid="toast">{message}</div>,
}));

vi.mock('../../modals/UserEditModal/UserEditModal', () => ({
  default: ({ user, onClose }) => (
    <div data-testid="user-edit-modal">
      Editing {user?.name}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('Admin Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('should render without crashing', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Admin />
        </BrowserRouter>
      );
    });

    expect(document.body).toBeInTheDocument();
  });

  test('should display user management title', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Admin />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Admin.UserManagement')).toBeInTheDocument();
    });
  });

  test('should show filter options', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Admin />
        </BrowserRouter>
      );
    });

    expect(screen.getByLabelText('Admin.AllUsers')).toBeInTheDocument();
    expect(screen.getByLabelText('Admin.ActiveUsers')).toBeInTheDocument();
    expect(screen.getByLabelText('Admin.SuspendedUsers')).toBeInTheDocument();
  });

  test('should display search bar', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Admin />
        </BrowserRouter>
      );
    });

    expect(screen.getByPlaceholderText('Admin.Search')).toBeInTheDocument();
  });
});
