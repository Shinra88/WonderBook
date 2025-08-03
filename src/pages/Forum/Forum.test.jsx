import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Forum from './Forum';
import { getTopics } from '../../services/topicsService';
import { useAuth } from '../../hooks/useAuth';

// Mock des données de test
const mockTopics = [
  {
    _id: '1',
    title: 'Notice importante',
    notice: true,
  },
  {
    _id: '2',
    title: 'Sujet de discussion',
    notice: false,
  },
  {
    _id: '3',
    title: 'Autre sujet',
    notice: false,
  },
];

// Mock du service topics
vi.mock('../../services/topicsService', () => ({
  getTopics: vi.fn(() => Promise.resolve(mockTopics)),
}));

// Mock du hook useAuth
const mockUser = { id: '123', name: 'Test User' };
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: mockUser })),
}));

// Mock du modal TopicModal
vi.mock('../../modals/TopicModal/TopicModal', () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="topic-modal">
      <button onClick={onClose} data-testid="modal-close">
        Close
      </button>
      <button onClick={onSuccess} data-testid="modal-success">
        Success
      </button>
    </div>
  ),
}));

// Mock du composant Pagination
vi.mock('../../components/Pagination/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        data-testid="prev-page"
        disabled={currentPage === 1}>
        Précédent
      </button>
      <span data-testid="page-info">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        data-testid="next-page"
        disabled={currentPage === totalPages}>
        Suivant
      </button>
    </div>
  ),
}));

// Mock de react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'ErrorFetchingTopics:': 'Erreur lors du chargement des sujets :',
        'Forum.CreateTopic': 'Créer un sujet',
        'Forum.SearchPlaceholder': 'Rechercher un sujet...',
        'Forum.Notices': 'Annonces',
        'Forum.Subjects': 'Sujets',
        'Forum.NoTopicsFound': 'Aucun sujet trouvé',
        'Forum.BackToTop': 'Retour en haut',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock de react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock du reload de window.location
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});

// Wrapper pour les tests avec Router
const TestWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('Forum Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Réinitialiser le mock useAuth avec un utilisateur connecté par défaut
    vi.mocked(useAuth).mockReturnValue({ user: mockUser });
  });

  describe('Rendu initial', () => {
    it('doit afficher les éléments principaux du forum', async () => {
      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      // Vérifier que les sections principales sont présentes
      expect(screen.getByText('Annonces')).toBeInTheDocument();
      expect(screen.getByText('Sujets')).toBeInTheDocument();

      // Vérifier la présence de la barre de recherche
      expect(screen.getByPlaceholderText('Rechercher un sujet...')).toBeInTheDocument();

      // Attendre que les topics soient chargés
      await waitFor(() => {
        expect(screen.getByText('Notice importante')).toBeInTheDocument();
        expect(screen.getByText('Sujet de discussion')).toBeInTheDocument();
      });
    });

    it('doit afficher le bouton "Créer un sujet" quand l\'utilisateur est connecté', () => {
      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      expect(screen.getByText('Créer un sujet')).toBeInTheDocument();
    });
  });

  describe('Utilisateur non connecté', () => {
    it('ne doit pas afficher le bouton "Créer un sujet"', () => {
      // Mock pour utilisateur non connecté
      vi.mocked(useAuth).mockReturnValue({ user: null });

      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      expect(screen.queryByText('Créer un sujet')).not.toBeInTheDocument();
    });
  });

  describe('Chargement des topics', () => {
    it('doit séparer correctement les notices et les sujets', async () => {
      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      await waitFor(() => {
        // Vérifier que la notice est dans la section Annonces
        const noticesSection = screen.getByText('Annonces').closest('section');
        expect(noticesSection.nextElementSibling).toHaveTextContent('Notice importante');

        // Vérifier que les sujets sont dans la section Sujets
        expect(screen.getByText('Sujet de discussion')).toBeInTheDocument();
        expect(screen.getByText('Autre sujet')).toBeInTheDocument();
      });
    });
  });

  describe('Fonctionnalité de recherche', () => {
    it('doit filtrer les topics selon la recherche', async () => {
      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sujet de discussion')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Rechercher un sujet...');
      fireEvent.change(searchInput, { target: { value: 'Notice' } });

      await waitFor(() => {
        expect(screen.getByText('Notice importante')).toBeInTheDocument();
        expect(screen.queryByText('Sujet de discussion')).not.toBeInTheDocument();
      });
    });

    it('doit afficher "Aucun sujet trouvé" quand aucun résultat', async () => {
      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sujet de discussion')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Rechercher un sujet...');
      fireEvent.change(searchInput, { target: { value: 'inexistant' } });

      await waitFor(() => {
        const noTopicsMessages = screen.getAllByText('Aucun sujet trouvé');
        expect(noTopicsMessages).toHaveLength(2); // Un pour notices, un pour sujets
      });
    });
  });

  describe('Navigation', () => {
    it('doit naviguer vers le détail du topic au clic', async () => {
      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sujet de discussion')).toBeInTheDocument();
      });

      const topicItem = screen.getByText('Sujet de discussion');
      fireEvent.click(topicItem);

      expect(mockNavigate).toHaveBeenCalledWith('/topic/2');
    });
  });

  describe('Modal de création de topic', () => {
    beforeEach(() => {
      // S'assurer que l'utilisateur est connecté pour ces tests
      vi.mocked(useAuth).mockReturnValue({ user: mockUser });
    });

    it('doit ouvrir et fermer la modal', async () => {
      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      // Attendre que le composant soit chargé
      await waitFor(() => {
        expect(screen.getByText('Créer un sujet')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Créer un sujet');
      fireEvent.click(createButton);

      expect(screen.getByTestId('topic-modal')).toBeInTheDocument();

      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('topic-modal')).not.toBeInTheDocument();
    });

    it('doit recharger la page après succès de création', async () => {
      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      // Attendre que le composant soit chargé
      await waitFor(() => {
        expect(screen.getByText('Créer un sujet')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Créer un sujet');
      fireEvent.click(createButton);

      const successButton = screen.getByTestId('modal-success');
      fireEvent.click(successButton);

      expect(window.location.reload).toHaveBeenCalled();
      expect(screen.queryByTestId('topic-modal')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it("doit afficher la pagination quand il y a plus d'une page", async () => {
      // Mock avec plus de 10 sujets pour tester la pagination
      const manyTopics = Array.from({ length: 15 }, (_, i) => ({
        _id: `topic-${i}`,
        title: `Sujet ${i}`,
        notice: false,
      }));

      vi.mocked(getTopics).mockResolvedValueOnce(manyTopics);

      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
        expect(screen.getByTestId('page-info')).toHaveTextContent('1 / 2');
      });
    });

    it('doit changer de page avec la pagination', async () => {
      const manyTopics = Array.from({ length: 15 }, (_, i) => ({
        _id: `topic-${i}`,
        title: `Sujet ${i}`,
        notice: false,
      }));

      vi.mocked(getTopics).mockResolvedValueOnce(manyTopics);

      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });

      const nextButton = screen.getByTestId('next-page');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('page-info')).toHaveTextContent('2 / 2');
      });
    });
  });

  describe('Gestion des erreurs', () => {
    it('doit gérer les erreurs de chargement des topics', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(getTopics).mockRejectedValueOnce(new Error('Erreur réseau'));

      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erreur lors du chargement des sujets :',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Lien retour en haut', () => {
    it('doit afficher le lien "Retour en haut"', async () => {
      render(
        <TestWrapper>
          <Forum />
        </TestWrapper>
      );

      await waitFor(() => {
        const backToTopLink = screen.getByText('Retour en haut');
        expect(backToTopLink).toBeInTheDocument();
        expect(backToTopLink).toHaveAttribute('href', '#topPage');
      });
    });
  });
});
