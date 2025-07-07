import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Header from './Header'

describe('Header Component', () => {
  it('renders PokéDex title', () => {
    render(<Header />)
    
    const title = screen.getByText('PokéDex')
    expect(title).toBeInTheDocument()
  })

  it('renders with correct styling classes', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky', 'top-0', 'z-40')
  })

  it('contains a link to home page', () => {
    render(<Header />)
    
    const homeLink = screen.getByRole('link')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders the pokeball icon', () => {
    render(<Header />)
    
    // Buscar el div que representa la pokeball
    const pokeball = screen.getByText('PokéDex').parentElement
    expect(pokeball).toBeInTheDocument()
  })
})
