// src/components/BackArrow/BackArrow.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BackArrow from './BackArrow';

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }) => (
    <span data-testid="fontawesome-icon" data-icon={icon.iconName}></span>
  ),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('BackArrow Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('should render without crashing', () => {
    const { container } = render(<BackArrow />);
    expect(container.firstChild).toBeTruthy();
  });

  test('should render button with correct aria-label', () => {
    render(<BackArrow />);

    const backButton = screen.getByLabelText('Back');
    expect(backButton).toBeInTheDocument();
    expect(backButton.tagName).toBe('BUTTON');
  });

  test('should render FontAwesome chevron left icon', () => {
    render(<BackArrow />);

    const icon = screen.getByTestId('fontawesome-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute('data-icon')).toBe('chevron-left');
  });

  test('should have correct CSS class', () => {
    render(<BackArrow />);

    const button = screen.getByLabelText('Back');
    expect(button.className).toContain('backArrow');
  });

  test('should call navigate(-1) when clicked', () => {
    render(<BackArrow />);

    const backButton = screen.getByLabelText('Back');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  test('should be clickable (not disabled)', () => {
    render(<BackArrow />);

    const backButton = screen.getByLabelText('Back');
    expect(backButton.disabled).toBe(false);
  });

  test('should have button element with onClick handler', () => {
    render(<BackArrow />);

    const backButton = screen.getByLabelText('Back');
    expect(backButton.onclick).toBeTruthy();
  });

  test('should call handleBack function on click', () => {
    render(<BackArrow />);

    const backButton = screen.getByLabelText('Back');

    // Simuler plusieurs clics pour tester la fonction
    fireEvent.click(backButton);
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    expect(mockNavigate).toHaveBeenNthCalledWith(2, -1);
  });

  test('should render with correct structure', () => {
    render(<BackArrow />);

    // Vérifier la structure : button > FontAwesome icon
    const button = screen.getByLabelText('Back');
    const icon = screen.getByTestId('fontawesome-icon');

    expect(button.contains(icon)).toBe(true);
  });

  test('should be accessible via keyboard', () => {
    render(<BackArrow />);

    const backButton = screen.getByLabelText('Back');

    // Test focus
    backButton.focus();
    expect(document.activeElement).toBe(backButton);

    // Test Enter key
    fireEvent.keyDown(backButton, { key: 'Enter', code: 'Enter' });
    // Note: fireEvent.keyDown ne déclenche pas le click automatiquement sur un button
    // mais vérifie que l'élément peut recevoir le focus
  });

  test('should handle multiple rapid clicks', () => {
    render(<BackArrow />);

    const backButton = screen.getByLabelText('Back');

    // Simuler des clics rapides
    for (let i = 0; i < 5; i++) {
      fireEvent.click(backButton);
    }

    expect(mockNavigate).toHaveBeenCalledTimes(5);
  });
});
