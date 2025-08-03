import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Spoiler from './Spoiler';
import styles from './Spoiler.module.css';

describe('Spoiler Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu initial', () => {
    test('doit afficher le message de révélation par défaut', () => {
      render(<Spoiler content="Contenu secret" />);

      expect(screen.getByText('🔒 Cliquez pour révéler')).toBeInTheDocument();
      expect(screen.queryByText('Contenu secret')).not.toBeInTheDocument();
    });

    test('doit appliquer la classe CSS spoiler', () => {
      const { container } = render(<Spoiler content="Test" />);

      const spoilerElement = container.firstChild;
      expect(spoilerElement).toHaveClass(styles.spoiler);
    });
  });

  describe('Interaction - révélation du contenu', () => {
    test('doit révéler le contenu au clic', () => {
      render(<Spoiler content="Contenu secret" />);

      const spoilerElement = screen.getByText('🔒 Cliquez pour révéler');
      fireEvent.click(spoilerElement);

      expect(screen.getByText('Contenu secret')).toBeInTheDocument();
      expect(screen.queryByText('🔒 Cliquez pour révéler')).not.toBeInTheDocument();
    });

    test('doit cacher le contenu au second clic', () => {
      const { container } = render(<Spoiler content="Contenu secret" />);
      const wrapper = container.firstChild;

      // Premier clic - révéler
      fireEvent.click(wrapper);
      expect(screen.getByText('Contenu secret')).toBeInTheDocument();

      // Second clic - cacher
      fireEvent.click(wrapper);
      expect(screen.getByText('🔒 Cliquez pour révéler')).toBeInTheDocument();
      expect(screen.queryByText('Contenu secret')).not.toBeInTheDocument();
    });

    test('doit basculer plusieurs fois entre visible et caché', () => {
      const { container } = render(<Spoiler content="Test toggle" />);
      const wrapper = container.firstChild;

      // Cycle: caché -> visible -> caché -> visible
      for (let i = 0; i < 4; i++) {
        fireEvent.click(wrapper);

        if (i % 2 === 0) {
          // Après clic impair (1,3): contenu visible
          expect(screen.getByText('Test toggle')).toBeInTheDocument();
        } else {
          // Après clic pair (2,4): contenu caché
          expect(screen.getByText('🔒 Cliquez pour révéler')).toBeInTheDocument();
        }
      }
    });
  });

  describe('Types de contenu', () => {
    test('doit afficher du contenu texte simple', () => {
      render(<Spoiler content="Texte simple" />);

      fireEvent.click(screen.getByText('🔒 Cliquez pour révéler'));
      expect(screen.getByText('Texte simple')).toBeInTheDocument();
    });

    test('doit afficher du contenu JSX complexe', () => {
      const complexContent = (
        <div>
          <h3>Titre secret</h3>
          <p>Paragraphe secret</p>
        </div>
      );

      render(<Spoiler content={complexContent} />);

      fireEvent.click(screen.getByText('🔒 Cliquez pour révéler'));
      expect(screen.getByText('Titre secret')).toBeInTheDocument();
      expect(screen.getByText('Paragraphe secret')).toBeInTheDocument();
    });

    test('doit afficher un tableau de chaînes', () => {
      const arrayContent = ['Premier élément', 'Second élément'];
      const { container } = render(<Spoiler content={arrayContent} />);
      const wrapper = container.firstChild;

      fireEvent.click(wrapper);

      // Les éléments du tableau sont rendus côte à côte sans séparateur
      const combinedText = screen.getByText('Premier élémentSecond élément');
      expect(combinedText).toBeInTheDocument();
    });

    test('doit afficher un tableau mixte avec JSX', () => {
      const mixedContent = [
        'Texte',
        <strong key="bold">Gras</strong>,
        <em key="italic">Italique</em>,
      ];

      render(<Spoiler content={mixedContent} />);

      fireEvent.click(screen.getByText('🔒 Cliquez pour révéler'));
      expect(screen.getByText('Texte')).toBeInTheDocument();
      expect(screen.getByText('Gras')).toBeInTheDocument();
      expect(screen.getByText('Italique')).toBeInTheDocument();
    });
  });

  describe('Choix du wrapper (span vs div)', () => {
    test('doit utiliser un span pour du contenu texte simple', () => {
      const { container } = render(<Spoiler content="Texte simple" />);

      const wrapper = container.firstChild;
      expect(wrapper.tagName).toBe('SPAN');
    });

    test('doit utiliser un span pour un tableau de chaînes', () => {
      const { container } = render(<Spoiler content={['Texte 1', 'Texte 2']} />);

      const wrapper = container.firstChild;
      expect(wrapper.tagName).toBe('SPAN');
    });

    test('doit utiliser un div pour du contenu JSX', () => {
      const { container } = render(<Spoiler content={<div>JSX Content</div>} />);

      const wrapper = container.firstChild;
      expect(wrapper.tagName).toBe('DIV');
    });

    test('doit utiliser un div pour un tableau avec JSX', () => {
      const mixedContent = ['Texte', <span key="jsx">JSX</span>];
      const { container } = render(<Spoiler content={mixedContent} />);

      const wrapper = container.firstChild;
      expect(wrapper.tagName).toBe('DIV');
    });
  });

  describe('Classes CSS', () => {
    test('doit appliquer la classe clickToReveal au message de révélation', () => {
      render(<Spoiler content="Test" />);

      const revealMessage = screen.getByText('🔒 Cliquez pour révéler');
      expect(revealMessage).toHaveClass(styles.clickToReveal);
    });

    test('doit maintenir la classe spoiler après révélation', () => {
      const { container } = render(<Spoiler content="Test" />);

      const spoilerElement = container.firstChild;
      fireEvent.click(spoilerElement);

      expect(spoilerElement).toHaveClass(styles.spoiler);
    });
  });

  describe('Cas limites', () => {
    test('doit gérer un contenu vide', () => {
      const { container } = render(<Spoiler content="" />);
      const wrapper = container.firstChild;

      // Vérifier l'état initial
      expect(screen.getByText('🔒 Cliquez pour révéler')).toBeInTheDocument();

      // Cliquer pour révéler
      fireEvent.click(wrapper);

      // Le contenu vide devrait être révélé (mais invisible)
      // On vérifie que le message de révélation n'est plus là
      expect(screen.queryByText('🔒 Cliquez pour révéler')).not.toBeInTheDocument();
    });

    test('doit gérer un tableau vide', () => {
      const { container } = render(<Spoiler content={[]} />);
      const wrapper = container.firstChild;

      // Vérifier l'état initial
      expect(screen.getByText('🔒 Cliquez pour révéler')).toBeInTheDocument();

      // Cliquer pour révéler
      fireEvent.click(wrapper);

      // Le tableau vide devrait être révélé
      expect(screen.queryByText('🔒 Cliquez pour révéler')).not.toBeInTheDocument();
    });

    test('doit gérer du contenu null', () => {
      const { container } = render(<Spoiler content={null} />);
      const wrapper = container.firstChild;

      // Vérifier l'état initial
      expect(screen.getByText('🔒 Cliquez pour révéler')).toBeInTheDocument();

      // Cliquer pour révéler
      fireEvent.click(wrapper);

      // Le contenu null devrait être révélé
      expect(screen.queryByText('🔒 Cliquez pour révéler')).not.toBeInTheDocument();
    });

    test('doit gérer des nombres', () => {
      const { container } = render(<Spoiler content={42} />);
      const wrapper = container.firstChild;

      // Cliquer pour révéler
      fireEvent.click(wrapper);
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('Événements multiples', () => {
    test("doit maintenir l'état correct avec des clics rapides", () => {
      const { container } = render(<Spoiler content="Contenu rapide" />);
      const wrapper = container.firstChild;

      // Clics rapides multiples
      fireEvent.click(wrapper); // 1 - visible
      fireEvent.click(wrapper); // 2 - caché
      fireEvent.click(wrapper); // 3 - visible

      // Devrait être visible après 3 clics (impair)
      expect(screen.getByText('Contenu rapide')).toBeInTheDocument();
      expect(screen.queryByText('🔒 Cliquez pour révéler')).not.toBeInTheDocument();
    });
  });
});
