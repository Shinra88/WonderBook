// src/components/ToastSuccess/ToastSuccess.test.jsx
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ToastSuccess from './ToastSuccess'

describe('ToastSuccess Component', () => {
  test('should render without crashing', () => {
    const { container } = render(<ToastSuccess />)
    expect(container.firstChild).toBeTruthy()
  })

  test('should display success message with emoji', () => {
    const message = 'Operation successful!'
    render(<ToastSuccess message={message} />)
    
    // Chercher le texte avec l'emoji - utilisation de regex plus flexible
    expect(screen.getByText(/Operation successful!/)).toBeInTheDocument()
  })

  test('should render with custom message', () => {
    const customMessage = 'Custom success message'
    render(<ToastSuccess message={customMessage} />)
    
    // Test avec regex pour ignorer l'emoji
    expect(screen.getByText(/Custom success message/)).toBeInTheDocument()
  })

  test('should handle empty/undefined message gracefully', () => {
    render(<ToastSuccess />)
    
    // Vérifier que le composant se rend même sans message
    const toast = document.querySelector('[class*="toast"]')
    expect(toast).toBeTruthy()
    
    // Vérifier que l'emoji est présent même sans message
    expect(screen.getByText(/✅/)).toBeInTheDocument()
  })

  test('should have correct CSS class structure', () => {
    render(<ToastSuccess message="Test" />)
    
    // Vérifier la structure CSS (important pour SonarCube coverage)
    const toast = document.querySelector('[class*="toast"]')
    expect(toast).toBeTruthy()
    
    // Vérifier que le span existe
    const span = toast.querySelector('span')
    expect(span).toBeTruthy()
  })

  test('should display emoji and message together', () => {
    const message = 'Success!'
    render(<ToastSuccess message={message} />)
    
    // Vérifier que l'emoji ET le message sont présents
    const span = document.querySelector('span')
    expect(span.textContent).toContain('✅')
    expect(span.textContent).toContain('Success!')
  })

  test('should render span element correctly', () => {
    render(<ToastSuccess message="Test message" />)
    
    // Test de la structure DOM pour coverage
    const spans = document.querySelectorAll('span')
    expect(spans.length).toBe(1)
    expect(spans[0].textContent).toBe('✅ Test message')
  })

  test('should handle special characters in message', () => {
    const specialMessage = 'Message with "quotes" & symbols!'
    render(<ToastSuccess message={specialMessage} />)
    
    expect(screen.getByText(/Message with "quotes" & symbols!/)).toBeInTheDocument()
  })
})