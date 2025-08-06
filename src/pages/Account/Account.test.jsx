import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Account from './Account';

// ✅ CHANGEMENT : Mock useAuth au lieu d'authService
const mockLogin = vi.fn();
const mockUpdateUserProfile = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// ✅ SUPPRIMÉ : Plus de mock d'authService
// vi.mock('../../services/authService', () => ({
//   updateUserProfile: vi.fn(),
// }));

vi.mock('../../services/uploadServices', () => ({
  updateAvatarOnS3: vi.fn(),
}));

// Mock des images (inchangé)
vi.mock('../../images/library.webp', () => ({
  default: '/mocked-library.webp',
}));

vi.mock('../../images/avatar.webp', () => ({
  default: '/mocked-avatar.webp',
}));

vi.mock('../../images/feather.webp', () => ({
  default: '/mocked-feather.webp',
}));

// Mock du composant ChangePass (inchangé)
vi.mock('../../modals/ChangePass/ChangePass', () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="change-pass-modal">
      <button onClick={onClose} data-testid="close-modal">
        Close
      </button>
      <button onClick={onSuccess} data-testid="success-modal">
        Success
      </button>
    </div>
  ),
}));

// Mock des données utilisateur (inchangé)
const mockUser = {
  name: 'John Doe',
  mail: 'john@example.com',
  aboutMe: 'About me text',
  avatar: 'https://example.com/avatar.jpg',
  token: 'test-token',
  userId: 'user-123',
  repForum: true,
  addCom: false,
  addBook: true,
  news: false,
};

// ✅ CHANGEMENT : Import des mocks adaptés
const { useAuth } = await import('../../hooks/useAuth');
// ✅ SUPPRIMÉ : Plus d'import d'authService
// const { updateUserProfile } = await import('../../services/authService');
const { updateAvatarOnS3 } = await import('../../services/uploadServices');

// Mock des fonctions globales (inchangé)
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
});

Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});

// Wrapper pour les tests (inchangé)
const TestWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('Account Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ✅ CHANGEMENT : Configuration du mock useAuth
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      login: mockLogin,
      updateUserProfile: mockUpdateUserProfile, // ✅ NOUVEAU : Via useAuth
    });

    // ✅ CHANGEMENT : Mock de updateUserProfile via useAuth
    mockUpdateUserProfile.mockResolvedValue({
      success: true,
      user: { ...mockUser, name: 'Updated Name' },
    });

    vi.mocked(updateAvatarOnS3).mockResolvedValue('https://example.com/new-avatar.jpg');
  });

  describe('Rendu initial', () => {
    test('doit afficher le composant Account avec les informations utilisateur', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Vérifier que les champs sont remplis avec les données utilisateur
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('About me text')).toBeInTheDocument();
      });

      // Vérifier que le bouton "Éditer profil" est présent
      expect(screen.getByRole('button', { name: /Account\.EditProfile/i })).toBeInTheDocument();
    });

    test("doit rediriger vers la page d'accueil si aucun utilisateur n'est connecté", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        login: mockLogin,
        updateUserProfile: mockUpdateUserProfile,
      });

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );
    });
  });

  describe('Mode édition', () => {
    test('doit passer en mode édition quand on clique sur "Éditer profil"', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Account\.Finish/i })).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Account\.ChangePassword/i })
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Account\.Cancel/i })).toBeInTheDocument();
      });
    });

    test('doit permettre de modifier les champs en mode édition', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      // Modifier le nom
      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
    });

    test('doit annuler les modifications quand on clique sur "Annuler"', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      // Modifier le nom
      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      // Annuler
      const cancelButton = screen.getByRole('button', { name: /Account\.Cancel/i });
      fireEvent.click(cancelButton);

      // Vérifier que les modifications sont annulées
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Account\.EditProfile/i })).toBeInTheDocument();
    });
  });

  describe('Sauvegarde des modifications', () => {
    test('doit sauvegarder les modifications du profil', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      // Modifier le nom
      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      // Sauvegarder
      const finishButton = screen.getByRole('button', { name: /Account\.Finish/i });
      fireEvent.click(finishButton);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith('Account.ConfirmProfileUpdate');
        // ✅ CHANGEMENT : Vérifie mockUpdateUserProfile au lieu de updateUserProfile
        expect(mockUpdateUserProfile).toHaveBeenCalled();
      });
    });

    test("doit afficher une alerte si aucune modification n'est détectée", async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition sans rien modifier
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      // Essayer de sauvegarder sans modifications
      const finishButton = screen.getByRole('button', { name: /Account\.Finish/i });
      fireEvent.click(finishButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Account.NoChangesDetected');
      });
    });
  });

  describe("Changement d'avatar", () => {
    test("doit permettre de changer l'avatar", async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      // Simuler le changement d'avatar - chercher l'input file directement
      const fileInput = screen.getByDisplayValue(''); // L'input file a une valeur vide
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(vi.mocked(updateAvatarOnS3)).toHaveBeenCalledWith(
          file,
          'user-123',
          'https://example.com/avatar.jpg'
        );
      });
    });
  });

  describe('Changement de mot de passe', () => {
    test('doit ouvrir la modal de changement de mot de passe', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      // Cliquer sur "Changer mot de passe"
      const changePassButton = screen.getByRole('button', { name: /Account\.ChangePassword/i });
      fireEvent.click(changePassButton);

      expect(screen.getByTestId('change-pass-modal')).toBeInTheDocument();
    });

    test('doit fermer la modal après succès', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition et ouvrir la modal
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      const changePassButton = screen.getByRole('button', { name: /Account\.ChangePassword/i });
      fireEvent.click(changePassButton);

      // Simuler le succès
      const successButton = screen.getByTestId('success-modal');
      fireEvent.click(successButton);

      expect(screen.queryByTestId('change-pass-modal')).not.toBeInTheDocument();
    });
  });

  describe('Notifications', () => {
    test('doit permettre de basculer les paramètres de notification', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      // Trouver et cliquer sur un switch de notification
      const switches = screen.getAllByRole('checkbox');
      const firstSwitch = switches[0]; // repForum

      // Vérifier l'état initial (mockUser.repForum = true)
      expect(firstSwitch).toBeChecked();

      // Basculer le switch
      fireEvent.click(firstSwitch);
      expect(firstSwitch).not.toBeChecked();
    });
  });

  describe('Gestion des erreurs', () => {
    test('doit gérer les erreurs de mise à jour du profil', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // ✅ CHANGEMENT : Mock d'erreur via mockUpdateUserProfile
      mockUpdateUserProfile.mockRejectedValueOnce(new Error('Update failed'));

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition et modifier quelque chose
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      // Essayer de sauvegarder
      const finishButton = screen.getByRole('button', { name: /Account\.Finish/i });
      fireEvent.click(finishButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Account.ProfileUpdateError');
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    test("doit gérer les erreurs de mise à jour d'avatar", async () => {
      vi.mocked(updateAvatarOnS3).mockResolvedValueOnce(null); // Simuler un échec

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      // Essayer de changer l'avatar - chercher l'input file directement
      const fileInput = screen.getByDisplayValue(''); // L'input file a une valeur vide
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Account.ErrorUpdatingAvatar');
      });
    });
  });

  describe('Interface utilisateur', () => {
    test("doit afficher l'image de bannière", () => {
      const { container } = render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      const banner = container.querySelector('[style*="background-image"]');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveStyle('background-image: url(/mocked-library.webp)');
    });

    test("doit afficher l'avatar utilisateur ou l'avatar par défaut", async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await waitFor(() => {
        const avatarImg = screen.getByAltText('Avatar utilisateur');
        expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      });
    });
  });

  // ✅ NOUVEAU : Test spécifique pour la gestion des réponses d'erreur
  describe('Gestion des erreurs de réponse', () => {
    test('doit gérer les erreurs de mise à jour avec message personnalisé', async () => {
      // Mock d'une réponse d'erreur avec message
      mockUpdateUserProfile.mockResolvedValueOnce({
        success: false,
        error: 'Email already exists',
      });

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Passer en mode édition et modifier quelque chose
      const editButton = screen.getByRole('button', { name: /Account\.EditProfile/i });
      fireEvent.click(editButton);

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      // Essayer de sauvegarder
      const finishButton = screen.getByRole('button', { name: /Account\.Finish/i });
      fireEvent.click(finishButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Email already exists');
      });
    });
  });
});
