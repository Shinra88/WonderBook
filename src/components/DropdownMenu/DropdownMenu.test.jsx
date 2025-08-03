import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DropdownMenu from './DropdownMenu'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'DropdownMenu.Categories': 'Categories',
      'DropdownMenu.Loading': 'Loading',
      'DropdownMenu.ErrorLoading': 'Error loading categories',
      'DropdownMenu.Filter': 'Filter',
      'DropdownMenu.And': 'And',
      'DropdownMenu.Or': 'Or'
    }[key] || key)
  })
}))

// Mocks globaux
const mockSetSelectedCategories = vi.fn()
const mockSetSelectedType = vi.fn()
const mockUseCategories = vi.fn()
const mockUseFilters = vi.fn()

// Hook mocks
vi.mock('../../hooks/useCategories', () => ({
  default: () => mockUseCategories()
}))
vi.mock('../../hooks/filterContext', () => ({
  useFilters: () => mockUseFilters()
}))

describe('DropdownMenu Component', () => {
  beforeEach(() => {
    mockSetSelectedCategories.mockReset()
    mockSetSelectedType.mockReset()
  })

  test('should render without crashing', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    const { container } = render(<DropdownMenu />)
    expect(container.firstChild).toBeTruthy()
  })

  test('should render closed dropdown by default', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.queryByText('Filter')).not.toBeInTheDocument()
  })

  test('should toggle dropdown when button is clicked', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    const button = screen.getByText('Categories')

    fireEvent.click(button)
    expect(screen.getByText('Filter')).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.queryByText('Filter')).not.toBeInTheDocument()
  })

  test('should render active filter styling when isActive is true', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu isActive={true} />)
    expect(screen.getByText('Categories').className).toContain('activeFilter')
  })

  test('should not render active filter styling when isActive is false', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu isActive={false} />)
    expect(screen.getByText('Categories').className).not.toContain('activeFilter')
  })

    test('should display loading state', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: true,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))

    const loadingMessages = screen.getAllByText('Loading...')
    expect(loadingMessages.length).toBeGreaterThan(0)
  })

  test('should display error state', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: 'Something went wrong'
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))

    const errorMessages = screen.getAllByText('Error loading categories')
    expect(errorMessages.length).toBeGreaterThan(0)
  })


  test('should display categories when loaded', () => {
    mockUseCategories.mockReturnValue({
      categories: [
        { name: 'Fiction' },
        { name: 'Science' },
        { name: 'History' }
      ],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))

    expect(screen.getByText('Fiction')).toBeInTheDocument()
    expect(screen.getByText('Science')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
  })

  test('should display filter radio buttons', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))

    expect(screen.getByText('And')).toBeInTheDocument()
    expect(screen.getByText('Or')).toBeInTheDocument()
  })

  test('should call setSelectedType when filter type changes', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))

    fireEvent.click(screen.getByDisplayValue('ou'))
    expect(mockSetSelectedType).toHaveBeenCalledWith('ou')
  })

  test('should handle category selection', () => {
    mockUseCategories.mockReturnValue({
      categories: [{ name: 'Fiction' }],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Fiction' }))

    expect(mockSetSelectedCategories).toHaveBeenCalledWith(['Fiction'])
  })

  test('should handle category deselection', () => {
    mockUseCategories.mockReturnValue({
      categories: [{ name: 'Fiction' }],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: ['Fiction'],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Fiction' }))

    expect(mockSetSelectedCategories).toHaveBeenCalledWith([])
  })

  test('should disable checkboxes when 2 categories are selected', () => {
    mockUseCategories.mockReturnValue({
      categories: [
        { name: 'Fiction' },
        { name: 'Science' },
        { name: 'History' }
      ],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: ['Fiction', 'Science'],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))

    const historyCheckbox = screen.getByRole('checkbox', { name: 'History' })
    expect(historyCheckbox.disabled).toBe(true)
  })

  test('should close dropdown when clicking outside', async () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))

    expect(screen.getByText('Filter')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    await waitFor(() => {
      expect(screen.queryByText('Filter')).not.toBeInTheDocument()
    })
  })

  test('should not close dropdown when clicking inside', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))

    const filterText = screen.getByText('Filter')
    fireEvent.mouseDown(filterText)

    expect(screen.getByText('Filter')).toBeInTheDocument()
  })

  test('should render with default isActive prop', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    expect(screen.getByText('Categories').className).not.toContain('activeFilter')
  })

  test('should handle multiple category selections up to limit', () => {
    mockUseCategories.mockReturnValue({
      categories: [
        { name: 'Fiction' },
        { name: 'Science' }
      ],
      loading: false,
      error: null
    })
    mockUseFilters.mockReturnValue({
      selectedCategories: [],
      setSelectedCategories: mockSetSelectedCategories,
      selectedType: 'et',
      setSelectedType: mockSetSelectedType
    })

    render(<DropdownMenu />)
    fireEvent.click(screen.getByText('Categories'))

    fireEvent.click(screen.getByRole('checkbox', { name: 'Fiction' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Science' }))

    expect(mockSetSelectedCategories).toHaveBeenCalledTimes(2)
  })
})
