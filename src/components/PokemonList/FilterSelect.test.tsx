import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FilterSelect from './FilterSelect'

const mockOptions = [
  { value: 'fire', label: 'Fire' },
  { value: 'water', label: 'Water' },
  { value: 'grass', label: 'Grass' }
]

describe('FilterSelect Component', () => {
  it('renders with placeholder option', () => {
    const mockOnChange = vi.fn()
    
    render(
      <FilterSelect
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        placeholder="Select a type"
      />
    )
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    
    const placeholder = screen.getByText('Select a type')
    expect(placeholder).toBeInTheDocument()
  })

  it('renders all options', () => {
    const mockOnChange = vi.fn()
    
    render(
      <FilterSelect
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        placeholder="Select a type"
      />
    )
    
    expect(screen.getByText('Fire')).toBeInTheDocument()
    expect(screen.getByText('Water')).toBeInTheDocument()
    expect(screen.getByText('Grass')).toBeInTheDocument()
  })

  it('shows selected value', () => {
    const mockOnChange = vi.fn()
    
    render(
      <FilterSelect
        value="fire"
        onChange={mockOnChange}
        options={mockOptions}
        placeholder="Select a type"
      />
    )
    
    const select: HTMLSelectElement = screen.getByRole('combobox');
    expect(select.value).toBe('fire')
  })

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    
    render(
      <FilterSelect
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        placeholder="Select a type"
      />
    )
    
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'water')
    
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('applies custom width class', () => {
    const mockOnChange = vi.fn()
    
    render(
      <FilterSelect
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        placeholder="Select a type"
        width="w-64"
      />
    )
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('w-64')
  })
})
