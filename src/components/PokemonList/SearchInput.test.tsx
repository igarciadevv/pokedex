import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import SearchInput from './SearchInput'

describe('SearchInput Component', () => {
  it('renders with placeholder text', () => {
    const mockOnChange = vi.fn()
    
    render(
      <SearchInput 
        value="" 
        onChange={mockOnChange} 
        placeholder="Buscar pokemon..." 
      />
    )
    
    const input = screen.getByPlaceholderText('Buscar pokemon...')
    expect(input).toBeInTheDocument()
  })

  it('displays the current value', () => {
    const mockOnChange = vi.fn()
    
    render(
      <SearchInput 
        value="pikachu" 
        onChange={mockOnChange} 
        placeholder="Buscar..." 
      />
    )
    
    const input = screen.getByDisplayValue('pikachu')
    expect(input).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    
    render(
      <SearchInput 
        value="" 
        onChange={mockOnChange} 
        placeholder="Buscar..." 
      />
    )
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'p')
    
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const mockOnChange = vi.fn()
    
    render(
      <SearchInput 
        value="" 
        onChange={mockOnChange} 
        className="custom-class"
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('has correct default styling', () => {
    const mockOnChange = vi.fn()
    
    render(
      <SearchInput 
        value="" 
        onChange={mockOnChange} 
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border', 'rounded-lg', 'focus:ring-2')
  })
})
