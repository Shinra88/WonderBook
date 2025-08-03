import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomeWithForgetPassword from './HomeWithForgetPassword';
import { useParams } from 'react-router-dom';
import styles from './HomeWithForgetPassword.module.css';

// Mock du composant Home
vi.mock('../Home/Home', () => ({
  default: () => <div data-testid="home-component">Home Component</div>,
}));

// Mock du composant ForgetPassword
vi.mock('../../modals/ForgetPassword/ForgetPassword', () => ({
  default: ({ token }) => (
    <div data-testid="forget-password-modal">
      <span data-testid="token-value">{token}</span>
    </div>
  ),
}));

// Mock de useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

// Wrapper pour les tests avec Router
const TestWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('HomeWithForgetPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu initial', () => {
    it('doit afficher les composants Home et ForgetPassword', () => {
      // Mock useParams pour retourner un token
      vi.mocked(useParams).mockReturnValue({ token: 'test-token-123' });

      render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      // Vérifier que le composant Home est présent
      expect(screen.getByTestId('home-component')).toBeInTheDocument();

      // Vérifier que le composant ForgetPassword est présent
      expect(screen.getByTestId('forget-password-modal')).toBeInTheDocument();
    });

    it('doit avoir la structure CSS correcte', () => {
      vi.mocked(useParams).mockReturnValue({ token: 'test-token-123' });

      const { container } = render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      // Vérifier la structure des classes CSS avec CSS Modules
      const pageContainer = container.firstChild;
      expect(pageContainer).toHaveClass(styles.pageContainer);

      const backgroundDiv = pageContainer.querySelector(`.${styles.background}`);
      expect(backgroundDiv).toBeInTheDocument();

      const modalOverlay = pageContainer.querySelector(`.${styles.modalOverlay}`);
      expect(modalOverlay).toBeInTheDocument();
    });
  });

  describe('Gestion du token', () => {
    it('doit transmettre le token au composant ForgetPassword', () => {
      const testToken = 'abc123-reset-token';
      vi.mocked(useParams).mockReturnValue({ token: testToken });

      render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      // Vérifier que le token est passé au composant ForgetPassword
      expect(screen.getByTestId('token-value')).toHaveTextContent(testToken);
    });

    it('doit gérer le cas où le token est undefined', () => {
      vi.mocked(useParams).mockReturnValue({ token: undefined });

      render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      // Vérifier que le composant fonctionne même sans token
      expect(screen.getByTestId('home-component')).toBeInTheDocument();
      expect(screen.getByTestId('forget-password-modal')).toBeInTheDocument();

      // Le token devrait être undefined (rendu comme chaîne vide)
      expect(screen.getByTestId('token-value')).toBeEmptyDOMElement();
    });

    it('doit gérer le cas où le token est une chaîne vide', () => {
      vi.mocked(useParams).mockReturnValue({ token: '' });

      render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId('home-component')).toBeInTheDocument();
      expect(screen.getByTestId('forget-password-modal')).toBeInTheDocument();
      expect(screen.getByTestId('token-value')).toBeEmptyDOMElement();
    });

    it('doit gérer un token avec des caractères spéciaux', () => {
      const specialToken = 'token-with-special-chars_123-!@#';
      vi.mocked(useParams).mockReturnValue({ token: specialToken });

      render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId('token-value')).toHaveTextContent(specialToken);
    });
  });

  describe('Layout et structure', () => {
    it('doit avoir les bonnes classes CSS appliquées', () => {
      vi.mocked(useParams).mockReturnValue({ token: 'test-token' });

      const { container } = render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      const pageContainer = container.firstChild;
      const backgroundDiv = pageContainer.children[0];
      const modalOverlay = pageContainer.children[1];

      expect(pageContainer).toHaveClass(styles.pageContainer);
      expect(backgroundDiv).toHaveClass(styles.background);
      expect(modalOverlay).toHaveClass(styles.modalOverlay);
    });

    it('doit contenir exactement deux divs enfants', () => {
      vi.mocked(useParams).mockReturnValue({ token: 'test-token' });

      const { container } = render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      const pageContainer = container.firstChild;
      expect(pageContainer.children).toHaveLength(2);
    });

    it('doit placer Home dans la div background et ForgetPassword dans modalOverlay', () => {
      vi.mocked(useParams).mockReturnValue({ token: 'test-token' });

      const { container } = render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      const backgroundDiv = container.querySelector(`.${styles.background}`);
      const modalOverlay = container.querySelector(`.${styles.modalOverlay}`);

      // Vérifier que les divs existent
      expect(backgroundDiv).toBeInTheDocument();
      expect(modalOverlay).toBeInTheDocument();

      // Vérifier que Home est dans background
      expect(backgroundDiv).toContainElement(screen.getByTestId('home-component'));

      // Vérifier que ForgetPassword est dans modalOverlay
      expect(modalOverlay).toContainElement(screen.getByTestId('forget-password-modal'));
    });
  });

  describe("Tests d'intégration", () => {
    it('doit fonctionner avec différents types de tokens', () => {
      const testCases = [
        'simple-token',
        'token_with_underscores',
        'token-with-dashes',
        '123456789',
        'very-long-token-with-many-characters-and-numbers-123456789',
        'a',
      ];

      testCases.forEach(token => {
        vi.mocked(useParams).mockReturnValue({ token });

        const { unmount } = render(
          <TestWrapper>
            <HomeWithForgetPassword />
          </TestWrapper>
        );

        expect(screen.getByTestId('home-component')).toBeInTheDocument();
        expect(screen.getByTestId('forget-password-modal')).toBeInTheDocument();
        expect(screen.getByTestId('token-value')).toHaveTextContent(token);

        unmount();
      });
    });
  });

  describe('Robustesse', () => {
    it('doit gérer le cas où useParams retourne un objet vide', () => {
      vi.mocked(useParams).mockReturnValue({});

      render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId('home-component')).toBeInTheDocument();
      expect(screen.getByTestId('forget-password-modal')).toBeInTheDocument();
    });
  });

  describe('Accessibilité et sémantique', () => {
    it('doit avoir une structure DOM logique', () => {
      vi.mocked(useParams).mockReturnValue({ token: 'test-token' });

      const { container } = render(
        <TestWrapper>
          <HomeWithForgetPassword />
        </TestWrapper>
      );

      // Vérifier que la structure est logique (container > background + overlay)
      const pageContainer = container.firstChild;
      expect(pageContainer.tagName).toBe('DIV');
      expect(pageContainer).toHaveClass(styles.pageContainer);

      const children = Array.from(pageContainer.children);
      expect(children).toHaveLength(2);
      expect(children[0]).toHaveClass(styles.background);
      expect(children[1]).toHaveClass(styles.modalOverlay);
    });
  });
});
