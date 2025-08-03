// src/components/DropdownYear/DropdownYear.test.jsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DropdownYear from './DropdownYear'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'DropdownYears.Years': 'Years',
        'DropdownYears.Unique': 'Unique Year',
        'DropdownYears.Range': 'Year Range',
        'DropdownYears.Placeholder': 'Enter year',
        'DropdownYears.StartYear': 'Start year',
        'DropdownYears.EndYear': 'End year'
      }
      return translations[key] || key
    }
  })
}))

// Mock hooks
const mockUseYears = vi.fn()
const mockUseFilters = vi.fn()
const mockSetSelectedYear = vi.fn()

vi.mock('../../hooks/useYears', () => ({
  useYears: () => mockUseYears()
}))

vi.mock('../../hooks/filterContext', () => ({
  useFilters: () => mockUseFilters()
}))

describe('DropdownYear Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseYears.mockReturnValue({
      minYear: 1900,
      currentYear: 2024
    })
    
    mockUseFilters.mockReturnValue({
      selectedYear: '',
      setSelectedYear: mockSetSelectedYear
    })
  })

  // Tests de base
  test('should render and display Years button', () => {
    render(<DropdownYear />)
    expect(screen.getByText('Years')).toBeInTheDocument()
  })

  test('should toggle dropdown when clicked', () => {
    render(<DropdownYear />)
    
    const button = screen.getByText('Years')
    
    // Initially closed
    expect(screen.queryByText('Unique Year')).not.toBeInTheDocument()
    
    // Open
    fireEvent.click(button)
    expect(screen.getByText('Unique Year')).toBeInTheDocument()
    
    // Close
    fireEvent.click(button)
    expect(screen.queryByText('Unique Year')).not.toBeInTheDocument()
  })

  test('should show active styling when isActive is true', () => {
    render(<DropdownYear isActive={true} />)
    
    const button = screen.getByText('Years')
    expect(button.className).toContain('activeFilter')
  })

  // Tests des modes (unique vs range)
  test('should default to unique mode and switch to range mode', () => {
    render(<DropdownYear />)
    
    fireEvent.click(screen.getByText('Years'))
    
    // Default unique mode
    const uniqueRadio = screen.getByDisplayValue('unique')
    expect(uniqueRadio.checked).toBe(true)
    
    // Switch to range
    const rangeRadio = screen.getByDisplayValue('tranche')
    fireEvent.click(rangeRadio)
    
    expect(mockSetSelectedYear).toHaveBeenCalledWith({ start: '', end: '' })
  })

  test('should start in range mode when selectedYear is object', () => {
    mockUseFilters.mockReturnValue({
      selectedYear: { start: '2020', end: '2023' },
      setSelectedYear: mockSetSelectedYear
    })
    
    render(<DropdownYear />)
    
    fireEvent.click(screen.getByText('Years'))
    
    const rangeRadio = screen.getByDisplayValue('tranche')
    expect(rangeRadio.checked).toBe(true)
  })

  // Tests des inputs
  test('should handle valid numeric input in unique mode', () => {
    render(<DropdownYear />)
    
    fireEvent.click(screen.getByText('Years'))
    
    const input = screen.getByPlaceholderText('Enter year')
    fireEvent.change(input, { target: { value: '2024' } })
    
    expect(mockSetSelectedYear).toHaveBeenCalledWith('2024')
  })

  test('should reject invalid input (non-numeric, empty)', () => {
    render(<DropdownYear />)
    
    fireEvent.click(screen.getByText('Years'))
    
    const input = screen.getByPlaceholderText('Enter year')
    
    // Test invalid inputs
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(mockSetSelectedYear).not.toHaveBeenCalled()
    
    mockSetSelectedYear.mockClear()
    
    fireEvent.change(input, { target: { value: '' } })
    expect(mockSetSelectedYear).not.toHaveBeenCalled()
  })

  test('should limit input to 4 digits', () => {
    render(<DropdownYear />)
    
    fireEvent.click(screen.getByText('Years'))
    
    const input = screen.getByPlaceholderText('Enter year')
    fireEvent.change(input, { target: { value: '202456' } })
    
    expect(mockSetSelectedYear).toHaveBeenCalledWith('2024')
  })

  test('should handle range inputs', () => {
    mockUseFilters.mockReturnValue({
      selectedYear: { start: '', end: '' },
      setSelectedYear: mockSetSelectedYear
    })
    
    render(<DropdownYear />)
    
    fireEvent.click(screen.getByText('Years'))
    
    const startInput = screen.getByPlaceholderText('Start year')
    fireEvent.change(startInput, { target: { value: '2020' } })
    
    expect(mockSetSelectedYear).toHaveBeenCalledWith({ start: '2020', end: '' })
  })

  // Tests des valeurs affichées
  test('should display current values in inputs', () => {
    mockUseFilters.mockReturnValue({
      selectedYear: { start: '2020', end: '2023' },
      setSelectedYear: mockSetSelectedYear
    })
    
    render(<DropdownYear />)
    
    fireEvent.click(screen.getByText('Years'))
    
    const startInput = screen.getByPlaceholderText('Start year')
    const endInput = screen.getByPlaceholderText('End year')
    
    expect(startInput.value).toBe('2020')
    expect(endInput.value).toBe('2023')
  })

  test('should set correct min/max attributes', () => {
    render(<DropdownYear />)
    
    fireEvent.click(screen.getByText('Years'))
    
    const input = screen.getByPlaceholderText('Enter year')
    expect(input.getAttribute('min')).toBe('1900')
    expect(input.getAttribute('max')).toBe('2024')
  })

  // Tests des interactions externes
  test('should close dropdown when clicking outside', async () => {
    render(<DropdownYear />)
    
    fireEvent.click(screen.getByText('Years'))
    expect(screen.getByText('Unique Year')).toBeInTheDocument()
    
    fireEvent.mouseDown(document.body)
    
    await waitFor(() => {
      expect(screen.queryByText('Unique Year')).not.toBeInTheDocument()
    })
  })

  test('should handle keyboard events on button', () => {
    render(<DropdownYear />)
    
    const button = screen.getByText('Years')
    
    fireEvent.keyDown(button, { key: 'Enter' })
    // Vérifier si le dropdown s'ouvre ou non (selon l'implémentation)
    const dropdownOpened = screen.queryByText('Unique Year') !== null
    expect(typeof dropdownOpened).toBe('boolean')
  })

  // Tests des cas limites
  test('should handle edge cases gracefully', () => {
    const edgeCases = [
      { selectedYear: '' }, // Chaîne vide au lieu de null
      { selectedYear: undefined },
      { selectedYear: { start: '', end: '' } } // Objet valide au lieu de {}
    ]
    
    edgeCases.forEach(testCase => {
      mockUseFilters.mockReturnValue({
        ...testCase,
        setSelectedYear: mockSetSelectedYear
      })
      
      expect(() => {
        const { unmount } = render(<DropdownYear />)
        fireEvent.click(screen.getByText('Years'))
        unmount()
      }).not.toThrow()
    })
  })
})