// src/components/Footer/Footer.test.jsx
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

// Mock de react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key, // Retourne la clé comme traduction
  }),
}));

describe('Footer Component', () => {
  test('should render footer content', () => {
    render(<Footer />);
    // Test des éléments du footer
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
