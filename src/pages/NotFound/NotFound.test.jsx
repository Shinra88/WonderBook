import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NotFound from './NotFound';
import styles from './NotFound.module.css';
import Banner from '../../images/library.webp';

// Mock de react-i18next avec une fonction mockée
const mockT = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT
  })
}));

// Mock de l'image Banner
vi.mock('../../images/library.webp', () => ({
  default: '/mocked-banner-path.webp'
}));

describe('NotFound Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Configuration par défaut du mock de traduction
    mockT.mockImplementation((key) => {
      const translations = {
        'NotFound.Error404': '404 - Erreur',
        'NotFound.PageNotFound': 'Page non trouvée'
      };
      return translations[key] || key;
    });
  });
  describe('Rendu initial', () => {
    it('doit afficher les éléments principaux de la page 404', () => {
      render(<NotFound />);

      // Vérifier la présence des textes traduits
      expect(screen.getByText('404 - Erreur')).toBeInTheDocument();
      expect(screen.getByText('Page non trouvée')).toBeInTheDocument();

      // Vérifier la structure HTML
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('404 - Erreur');
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Page non trouvée');
    });

    it('doit avoir la structure CSS correcte', () => {
      const { container } = render(<NotFound />);

      // Vérifier la div principale avec id et classe
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveAttribute('id', 'topPage');
      expect(mainDiv).toHaveClass(styles.NotFound);

      // Vérifier la structure interne
      const bannerDiv = container.querySelector(`.${styles.banner}`);
      const mainElement = container.querySelector(`.${styles.main}`);
      const errorSection = container.querySelector(`.${styles.errorNotice}`);

      expect(bannerDiv).toBeInTheDocument();
      expect(mainElement).toBeInTheDocument();
      expect(errorSection).toBeInTheDocument();
    });

    it('doit avoir la balise main avec le bon rôle sémantique', () => {
      render(<NotFound />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass(styles.main);
    });
  });

  describe('Image de fond', () => {
    it('doit appliquer le style backgroundImage avec la bonne image', () => {
      const { container } = render(<NotFound />);

      const bannerDiv = container.querySelector(`.${styles.banner}`);
      expect(bannerDiv).toHaveStyle({
        backgroundImage: `url(${Banner})`
      });
    });

    it('doit utiliser l\'image Banner importée', () => {
      const { container } = render(<NotFound />);

      const bannerDiv = container.querySelector(`.${styles.banner}`);
      
      // Vérifier que le style contient le chemin de l'image mockée
      expect(bannerDiv.style.backgroundImage).toBe('url(/mocked-banner-path.webp)');
    });
  });

  describe('Internationalisation (i18n)', () => {
    it('doit utiliser les clés de traduction correctes', () => {
      render(<NotFound />);

      // Vérifier que les textes affichés correspondent aux traductions mockées
      expect(screen.getByText('404 - Erreur')).toBeInTheDocument();
      expect(screen.getByText('Page non trouvée')).toBeInTheDocument();
    });

    it('doit gérer le cas où les traductions ne sont pas trouvées', () => {
      // Redéfinir temporairement le mock pour retourner les clés
      mockT.mockImplementation((key) => key);

      render(<NotFound />);

      // Devrait afficher les clés directement
      expect(screen.getByText('NotFound.Error404')).toBeInTheDocument();
      expect(screen.getByText('NotFound.PageNotFound')).toBeInTheDocument();
    });
  });

  describe('Structure HTML et sémantique', () => {
    it('doit avoir une structure HTML correcte', () => {
      const { container } = render(<NotFound />);

      // Vérifier la hiérarchie des éléments
      const topDiv = container.querySelector('#topPage');
      expect(topDiv).toBeInTheDocument();

      const bannerDiv = topDiv.querySelector(`.${styles.banner}`);
      const mainElement = topDiv.querySelector('main');

      expect(bannerDiv).toBeInTheDocument();
      expect(mainElement).toBeInTheDocument();

      // Vérifier que main contient la section d'erreur
      const errorSection = mainElement.querySelector(`.${styles.errorNotice}`);
      expect(errorSection).toBeInTheDocument();
    });

    it('doit avoir les bons niveaux de titres', () => {
      render(<NotFound />);

      const h2 = screen.getByRole('heading', { level: 2 });
      const h4 = screen.getByRole('heading', { level: 4 });

      expect(h2).toBeInTheDocument();
      expect(h4).toBeInTheDocument();

      // Vérifier la hiérarchie (h2 avant h4)
      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toBe(h2);
      expect(headings[1]).toBe(h4);
    });

    it('doit avoir exactement deux titres', () => {
      render(<NotFound />);

      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);
    });
  });

  describe('Classes CSS et styles', () => {
    it('doit appliquer toutes les classes CSS nécessaires', () => {
      const { container } = render(<NotFound />);

      // Vérifier chaque classe CSS Module
      expect(container.querySelector(`.${styles.NotFound}`)).toBeInTheDocument();
      expect(container.querySelector(`.${styles.banner}`)).toBeInTheDocument();
      expect(container.querySelector(`.${styles.main}`)).toBeInTheDocument();
      expect(container.querySelector(`.${styles.errorNotice}`)).toBeInTheDocument();
    });

    it('doit avoir l\'attribut id sur l\'élément racine', () => {
      const { container } = render(<NotFound />);

      const rootElement = container.firstChild;
      expect(rootElement).toHaveAttribute('id', 'topPage');
    });
  });

  describe('Accessibilité', () => {
    it('doit avoir une structure accessible', () => {
      render(<NotFound />);

      // Vérifier la présence d'un élément main
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Vérifier que les titres sont accessibles
      expect(screen.getByRole('heading', { level: 2, name: '404 - Erreur' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: 'Page non trouvée' })).toBeInTheDocument();
    });

    it('doit avoir des titres avec un contenu descriptif', () => {
      render(<NotFound />);

      const h2 = screen.getByRole('heading', { level: 2 });
      const h4 = screen.getByRole('heading', { level: 4 });

      // Vérifier que les titres ont du contenu non vide
      expect(h2.textContent).toBeTruthy();
      expect(h4.textContent).toBeTruthy();
      expect(h2.textContent.length).toBeGreaterThan(0);
      expect(h4.textContent.length).toBeGreaterThan(0);
    });
  });

  describe('Robustesse', () => {
    it('doit fonctionner même si l\'image Banner est indisponible', () => {
      // Mock temporaire avec image indisponible  
      vi.doMock('../../images/library.webp', () => ({
        default: undefined
      }));

      const { container } = render(<NotFound />);

      // Le composant devrait toujours s'afficher
      expect(screen.getByText('404 - Erreur')).toBeInTheDocument();
      expect(screen.getByText('Page non trouvée')).toBeInTheDocument();

      // La div banner devrait exister même sans image
      const bannerDiv = container.querySelector(`.${styles.banner}`);
      expect(bannerDiv).toBeInTheDocument();
    });

    it('doit gérer les styles inline correctement', () => {
      const { container } = render(<NotFound />);

      const bannerDiv = container.querySelector(`.${styles.banner}`);
      
      // Vérifier que le style inline est appliqué
      expect(bannerDiv).toHaveAttribute('style');
      expect(bannerDiv.getAttribute('style')).toContain('background-image');
    });
  });
});