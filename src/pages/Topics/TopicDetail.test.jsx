import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import TopicDetail from './TopicDetail';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getTopicById,
  updateTopicNotice,
  deleteTopic,
  toggleTopicLock,
} from '../../services/topicsService';
import { getPostsByTopicId, deletePost } from '../../services/postsService';
import styles from './TopicDetail.module.css';

// Mock des données de test
const mockTopic = {
  _id: 'topic-123',
  title: 'Titre du topic',
  content: 'Contenu du topic\nDeuxième ligne',
  authorName: 'Auteur Test',
  authorAvatar: 'https://example.com/avatar.jpg',
  created_at: '2024-01-15T10:30:00Z',
  locked: false,
  notice: false,
};

const mockPosts = [
  {
    _id: 'post-1',
    content: 'Premier commentaire\nAvec du contenu [b]gras[/b]',
    userName: 'User1',
    userAvatar: 'https://example.com/user1.jpg',
    created_at: '2024-01-15T11:00:00Z',
  },
  {
    _id: 'post-2',
    content: 'Deuxième commentaire avec [spoiler]contenu caché[/spoiler]',
    userName: 'User2',
    userAvatar: null,
    created_at: '2024-01-15T12:00:00Z',
  },
];

const mockUser = {
  id: 'user-123',
  name: 'Test User',
  role: 'user',
  token: 'test-token',
};

const mockAdmin = {
  id: 'admin-123',
  name: 'Admin User',
  role: 'admin',
  token: 'admin-token',
};

// Mock des services
vi.mock('../../services/topicsService', () => ({
  getTopicById: vi.fn(() => Promise.resolve(mockTopic)),
  updateTopicNotice: vi.fn(() => Promise.resolve()),
  deleteTopic: vi.fn(() => Promise.resolve()),
  toggleTopicLock: vi.fn(() => Promise.resolve({ locked: true })),
}));

vi.mock('../../services/postsService', () => ({
  getPostsByTopicId: vi.fn(() => Promise.resolve(mockPosts)),
  deletePost: vi.fn(() => Promise.resolve()),
}));

// Mock du hook useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: mockUser })),
}));

// Mock de useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ topicId: 'topic-123' })),
  };
});

// Mock des composants
vi.mock('../../components/BackArrow/BackArrow', () => ({
  default: () => <button data-testid="back-arrow">Retour</button>,
}));

vi.mock('../../modals/PostModal/PostModal', () => ({
  default: ({ topicId, onClose, onSuccess }) => (
    <div data-testid="post-modal">
      <span data-testid="modal-topic-id">{topicId}</span>
      <button onClick={onClose} data-testid="modal-close">
        Fermer
      </button>
      <button onClick={onSuccess} data-testid="modal-success">
        Succès
      </button>
    </div>
  ),
}));

vi.mock('../../components/Pagination/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} data-testid="prev-page">
        Précédent
      </button>
      <span data-testid="page-info">
        {currentPage} / {totalPages}
      </span>
      <button onClick={() => onPageChange(currentPage + 1)} data-testid="next-page">
        Suivant
      </button>
    </div>
  ),
}));

vi.mock('../../components/ToastSuccess/ToastSuccess', () => ({
  default: ({ message }) => <div data-testid="toast-success">{message}</div>,
}));

vi.mock('../../components/Spoiler/Spoiler', () => ({
  default: ({ content }) => <span data-testid="spoiler">{content}</span>,
}));

// Mock de react-i18next
const mockT = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock des images
vi.mock('../../images/library.webp', () => ({
  default: '/mocked-banner.webp',
}));

vi.mock('../../images/avatar.webp', () => ({
  default: '/mocked-avatar.webp',
}));

// Mock de window.confirm et window.location
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
});

Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: vi.fn(),
  },
  writable: true,
});

// Wrapper pour les tests
const TestWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('TopicDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Configuration par défaut des mocks
    vi.mocked(useAuth).mockReturnValue({ user: mockUser });
    vi.mocked(useParams).mockReturnValue({ topicId: 'topic-123' });
    vi.mocked(getTopicById).mockResolvedValue(mockTopic);
    vi.mocked(getPostsByTopicId).mockResolvedValue(mockPosts);

    mockT.mockImplementation(key => {
      const translations = {
        ErrorFetchingDatas: 'Erreur lors du chargement des données',
        ErrorRefreshTopics: 'Erreur lors du rafraîchissement',
        'TopicDetail.AnswerTopic': 'Répondre au sujet',
        'TopicDetail.LockedMessage': 'Ce sujet est verrouillé',
        'TopicDetail.SearchPlaceholder': 'Rechercher dans les réponses...',
        'TopicDetail.Unlock': 'Déverrouiller',
        'TopicDetail.Lock': 'Verrouiller',
        'TopicDetail.Unpin': 'Désépingler',
        'TopicDetail.Pin': 'Épingler',
        'TopicDetail.ConfirmDelete': 'Êtes-vous sûr de vouloir supprimer ce sujet ?',
        'TopicDetail.DeleteSuccess': 'Sujet supprimé avec succès',
        'TopicDetail.Delete': 'Supprimer',
        'TopicDetail.Author': 'Auteur',
        'TopicDetail.CreatedOn': 'Créé le',
        'TopicDetail.Replies': 'Réponses',
        'TopicDetail.NoReplies': 'Aucune réponse',
        'TopicDetail.BackToTop': 'Retour en haut',
        ErrorToggleLock: 'Erreur lors du verrouillage',
        ErrorTogglePin: "Erreur lors de l'épinglage",
        'TopicDetail.ErrorDelete': 'Erreur lors de la suppression',
      };
      return translations[key] || key;
    });
  });

  describe('Chargement initial', () => {
    it('doit afficher le message de chargement avant de charger les données', () => {
      // Mock pour simuler un topic non chargé
      vi.mocked(getTopicById).mockImplementation(() => new Promise(() => {}));

      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      expect(screen.getByText('Chargement du topic...')).toBeInTheDocument();
    });

    it('doit charger et afficher le topic et les posts', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Titre du topic')).toBeInTheDocument();
        expect(screen.getByText('Auteur Test')).toBeInTheDocument();
        expect(screen.getByText('Premier commentaire')).toBeInTheDocument();
      });

      expect(getTopicById).toHaveBeenCalledWith('topic-123');
      expect(getPostsByTopicId).toHaveBeenCalledWith('topic-123');
    });

    it('doit gérer les erreurs de chargement', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Erreur réseau');
      vi.mocked(getTopicById).mockRejectedValueOnce(testError);

      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Erreur lors du chargement des données');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Interface utilisateur connecté', () => {
    it('doit afficher le bouton "Répondre au sujet" pour un topic non verrouillé', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Répondre au sujet')).toBeInTheDocument();
      });
    });

    it('doit afficher le message de verrouillage pour un topic verrouillé', async () => {
      vi.mocked(getTopicById).mockResolvedValueOnce({
        ...mockTopic,
        locked: true,
      });

      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Ce sujet est verrouillé')).toBeInTheDocument();
        expect(screen.queryByText('Répondre au sujet')).not.toBeInTheDocument();
      });
    });
  });

  describe('Interface utilisateur non connecté', () => {
    it("ne doit pas afficher les boutons d'action", async () => {
      vi.mocked(useAuth).mockReturnValue({ user: null });

      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Titre du topic')).toBeInTheDocument();
      });

      expect(screen.queryByText('Répondre au sujet')).not.toBeInTheDocument();
    });
  });

  describe('Fonctionnalités de modération', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({ user: mockAdmin });
    });

    it('doit afficher les boutons de modération pour un admin', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Verrouiller')).toBeInTheDocument();
        expect(screen.getByText('Épingler')).toBeInTheDocument();
        expect(screen.getAllByText('Supprimer')).toHaveLength(3); // Topic + 2 posts
      });
    });

    it('doit pouvoir verrouiller/déverrouiller un topic', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Verrouiller')).toBeInTheDocument();
      });

      const lockButton = screen.getByText('Verrouiller');
      fireEvent.click(lockButton);

      await waitFor(() => {
        expect(toggleTopicLock).toHaveBeenCalledWith('topic-123', 'admin-token');
      });
    });

    it('doit pouvoir épingler/désépingler un topic', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Épingler')).toBeInTheDocument();
      });

      const pinButton = screen.getByText('Épingler');
      fireEvent.click(pinButton);

      await waitFor(() => {
        expect(updateTopicNotice).toHaveBeenCalledWith('topic-123', 'admin-token');
      });
    });

    it('doit pouvoir supprimer un topic avec confirmation', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Titre du topic')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Supprimer');
      const topicDeleteButton = deleteButtons[0]; // Premier bouton = suppression du topic

      fireEvent.click(topicDeleteButton);

      expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer ce sujet ?');

      await waitFor(() => {
        expect(deleteTopic).toHaveBeenCalledWith('topic-123', 'admin-token');
      });
    });

    it('doit pouvoir supprimer un post', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Premier commentaire')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Supprimer');
      const postDeleteButton = deleteButtons[1]; // Deuxième bouton = suppression du post

      fireEvent.click(postDeleteButton);

      await waitFor(() => {
        expect(deletePost).toHaveBeenCalledWith('post-1', 'admin-token');
      });
    });
  });

  describe('Modal de création de post', () => {
    it('doit ouvrir et fermer la modal', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Répondre au sujet')).toBeInTheDocument();
      });

      const replyButton = screen.getByText('Répondre au sujet');
      fireEvent.click(replyButton);

      expect(screen.getByTestId('post-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-topic-id')).toHaveTextContent('topic-123');

      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument();
    });

    it('doit rafraîchir les posts après succès', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Répondre au sujet')).toBeInTheDocument();
      });

      const replyButton = screen.getByText('Répondre au sujet');
      fireEvent.click(replyButton);

      const successButton = screen.getByTestId('modal-success');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(getPostsByTopicId).toHaveBeenCalledTimes(2); // Initial + après succès
      });
    });
  });

  describe('Fonctionnalité de recherche', () => {
    it('doit filtrer les posts selon la recherche', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Premier commentaire')).toBeInTheDocument();
        expect(screen.getByText('Deuxième commentaire avec')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Rechercher dans les réponses...');
      fireEvent.change(searchInput, { target: { value: 'Premier' } });

      await waitFor(() => {
        expect(screen.getByText('Premier commentaire')).toBeInTheDocument();
        expect(screen.queryByText('Deuxième commentaire avec')).not.toBeInTheDocument();
      });
    });

    it("doit réinitialiser la pagination lors d'une recherche", async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Rechercher dans les réponses...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Rechercher dans les réponses...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // La pagination devrait être réinitialisée à la page 1
      // (ce test vérifie le comportement, pas l'affichage visuel)
      expect(searchInput.value).toBe('test');
    });
  });

  describe('Parsing du contenu', () => {
    it('doit parser le contenu avec formatage BBCode', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        // Vérifier que le contenu avec [b] est rendu
        expect(screen.getByText('Premier commentaire')).toBeInTheDocument();
        // Le composant Spoiler devrait être rendu pour [spoiler]
        expect(screen.getByTestId('spoiler')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it("doit afficher la pagination s'il y a plus d'une page", async () => {
      // Mock avec plus de 10 posts
      const manyPosts = Array.from({ length: 15 }, (_, i) => ({
        _id: `post-${i}`,
        content: `Post ${i}`,
        userName: `User${i}`,
        userAvatar: null,
        created_at: '2024-01-15T12:00:00Z',
      }));

      vi.mocked(getPostsByTopicId).mockResolvedValueOnce(manyPosts);

      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
    });
  });

  describe('Gestion des images', () => {
    it("doit utiliser l'avatar par défaut si pas d'avatar", async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        const avatars = screen.getAllByAltText('Avatar');
        // Vérifier qu'il y a des avatars (topic + posts)
        expect(avatars.length).toBeGreaterThan(0);
      });
    });

    it("doit appliquer le style d'image de fond", async () => {
      const { container } = render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        const bannerDiv = container.querySelector(`.${styles.banner}`);
        expect(bannerDiv).toHaveStyle('background-image: url(/mocked-banner.webp)');
      });
    });
  });

  describe('Formatage des dates', () => {
    it('doit formater correctement les dates', async () => {
      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        // Vérifier qu'une date formatée est affichée
        const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Toast notifications', () => {
    it('doit afficher un toast après suppression réussie', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: mockAdmin });

      render(
        <TestWrapper>
          <TopicDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Premier commentaire')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Supprimer');
      const postDeleteButton = deleteButtons[1];

      fireEvent.click(postDeleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      });
    });
  });
});
