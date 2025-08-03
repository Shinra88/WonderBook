import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from './AppLayout';

// Mock des composants enfants
vi.mock('../components/Header/Header', () => ({
  default: ({ user, setUser }) => (
    <header data-testid="header">
      <span>Header - User: {user ? user.name : 'No user'}</span>
      <button onClick={() => setUser && setUser(null)}>Logout</button>
    </header>
  ),
}));

vi.mock('../components/Footer/Footer', () => ({
  default: () => <footer data-testid="footer">Footer Component</footer>,
}));

// Mock react-router-dom Outlet
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Page Content</div>,
  };
});

// Wrapper pour les tests
const TestWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('AppLayout Component', () => {
  const mockSetUser = vi.fn();

  test('should render without crashing', () => {
    render(
      <TestWrapper>
        <AppLayout setUser={mockSetUser} />
      </TestWrapper>
    );

    expect(document.body).toBeInTheDocument();
  });

  test('should render Header component', () => {
    render(
      <TestWrapper>
        <AppLayout setUser={mockSetUser} />
      </TestWrapper>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('should render main element with Outlet', () => {
    render(
      <TestWrapper>
        <AppLayout setUser={mockSetUser} />
      </TestWrapper>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  test('should render Footer component', () => {
    render(
      <TestWrapper>
        <AppLayout setUser={mockSetUser} />
      </TestWrapper>
    );

    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('should pass user prop to Header', () => {
    const mockUser = { name: 'John Doe' };

    render(
      <TestWrapper>
        <AppLayout user={mockUser} setUser={mockSetUser} />
      </TestWrapper>
    );

    expect(screen.getByText('Header - User: John Doe')).toBeInTheDocument();
  });

  test('should pass setUser function to Header', () => {
    render(
      <TestWrapper>
        <AppLayout setUser={mockSetUser} />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  test('should handle null user', () => {
    render(
      <TestWrapper>
        <AppLayout user={null} setUser={mockSetUser} />
      </TestWrapper>
    );

    expect(screen.getByText('Header - User: No user')).toBeInTheDocument();
  });

  test('should handle undefined user (default prop)', () => {
    render(
      <TestWrapper>
        <AppLayout setUser={mockSetUser} />
      </TestWrapper>
    );

    expect(screen.getByText('Header - User: No user')).toBeInTheDocument();
  });
});
