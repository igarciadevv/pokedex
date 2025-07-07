import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PokemonDetailPage from 'poke/app/pokemon/[id]/page'
import { api } from 'poke/trpc/server'

// Mock del API (específico para este test)
vi.mock('poke/trpc/server', () => ({
  api: {
    pokemon: {
      getById: vi.fn(),
    },
  },
}))

// Pokemon de prueba completo
const mockPokemon = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  generation: 1,
  types: ['electric'],
  isLegendary: false,
  isMythical: false,
  stats: [35, 55, 40, 50, 50, 90],
  createdAt: new Date(),
  updatedAt: new Date(),
  evolutionChain: {
    id: 1,
    createdAt: new Date(),
    chainId: 10,
    pokemonId: 25,
    stage: 2,
    minLevel: null,
  },
  fullEvolutionChain: [
    { id: 172, name: 'pichu', stage: 1 },
    { id: 25, name: 'pikachu', stage: 2 },
    { id: 26, name: 'raichu', stage: 3 },
  ],
}

const mockLegendaryPokemon = {
  ...mockPokemon,
  id: 150,
  name: 'mewtwo',
  types: ['psychic'],
  isLegendary: true,
  isMythical: false,
  fullEvolutionChain: [
    { id: 150, name: 'mewtwo', stage: 1 }
  ],
}

const mockMythicalPokemon = {
  ...mockPokemon,
  id: 151,
  name: 'mew',
  types: ['psychic'],
  isLegendary: false,
  isMythical: true,
  fullEvolutionChain: [
    { id: 151, name: 'mew', stage: 1 }
  ],
}

describe('Pokemon Detail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders pokemon details correctly', async () => {
    vi.mocked(api.pokemon.getById).mockResolvedValue(mockPokemon)

    const mockParams = Promise.resolve({ id: '25' })

    const result = await PokemonDetailPage({ params: mockParams })
    
    render(result)

    // Verificar que se muestra el nombre del pokemon. dos veces: cadena evolución y detalle
    expect(screen.getAllByText('pikachu')).toHaveLength(2)
    
    // Verificar que se muestra el ID
    expect(screen.getByText('#25')).toBeInTheDocument()
    
    // Verificar que se muestra la generación
    expect(screen.getByText('Generación 1')).toBeInTheDocument()
    
    // Verificar que se muestran los tipos
    expect(screen.getByText('electric')).toBeInTheDocument()
    
    // Verificar que se muestran las medidas
    expect(screen.getByText('0.4m')).toBeInTheDocument() // height / 10
    expect(screen.getByText('6.0kg')).toBeInTheDocument() // weight / 10
    
    // Verificar que existe el botón de volver
    expect(screen.getByText('Volver al listado')).toBeInTheDocument()
  })

  it('displays legendary badge for legendary pokemon', async () => {
    vi.mocked(api.pokemon.getById).mockResolvedValue(mockLegendaryPokemon)
    
    const mockParams = Promise.resolve({ id: '150' })
    const result = await PokemonDetailPage({ params: mockParams })
    
    render(result)

    expect(screen.getByText('Legendario')).toBeInTheDocument()
    expect(screen.queryByText('Mítico')).not.toBeInTheDocument()
  })

  it('displays mythical badge for mythical pokemon', async () => {
    vi.mocked(api.pokemon.getById).mockResolvedValue(mockMythicalPokemon)
    
    const mockParams = Promise.resolve({ id: '151' })
    const result = await PokemonDetailPage({ params: mockParams })
    
    render(result)

    expect(screen.getByText('Mítico')).toBeInTheDocument()
    expect(screen.queryByText('Legendario')).not.toBeInTheDocument()
  })

  it('displays evolution chain correctly', async () => {
    vi.mocked(api.pokemon.getById).mockResolvedValue(mockPokemon)
    
    const mockParams = Promise.resolve({ id: '25' })
    const result = await PokemonDetailPage({ params: mockParams })
    
    render(result)

    // Verificar que se muestran las evoluciones
    expect(screen.getByText('pichu')).toBeInTheDocument()
    expect(screen.getAllByText('pikachu')).toHaveLength(2)
    expect(screen.getByText('raichu')).toBeInTheDocument()
    
    // Verificar que el pokemon actual está marcado
    expect(screen.getByText('Actual')).toBeInTheDocument()
  })

  it('displays stats correctly', async () => {
    vi.mocked(api.pokemon.getById).mockResolvedValue(mockPokemon)
    
    const mockParams = Promise.resolve({ id: '25' })
    const result = await PokemonDetailPage({ params: mockParams })
    
    render(result)

    // Verificar que se muestran las estadísticas
    expect(screen.getByText('35')).toBeInTheDocument() // HP
    expect(screen.getByText('55')).toBeInTheDocument() // Attack
    expect(screen.getByText('40')).toBeInTheDocument() // Defense
    expect(screen.getAllByText('50')).toHaveLength(2) // Sp.Attack (aparece 2 veces)
    expect(screen.getAllByText('90')).toHaveLength(2) // Speed (aparece 2 veces)
    
    // Verificar sección de estadísticas
    expect(screen.getByText('Estadísticas Base')).toBeInTheDocument()
  })

  it('validates pokemon ID correctly', async () => {
    // Test con ID inválido
    const invalidParams = Promise.resolve({ id: 'invalid' })
    
    await expect(async () => {
      await PokemonDetailPage({ params: invalidParams })
    }).rejects.toThrow('ID de Pokémon inválido: invalid')
  })

  it('validates negative pokemon ID', async () => {
    const negativeParams = Promise.resolve({ id: '-1' })
    
    await expect(async () => {
      await PokemonDetailPage({ params: negativeParams })
    }).rejects.toThrow('ID de Pokémon inválido: -1')
  })

  it('validates zero pokemon ID', async () => {
    const zeroParams = Promise.resolve({ id: '0' })
    
    await expect(async () => {
      await PokemonDetailPage({ params: zeroParams })
    }).rejects.toThrow('ID de Pokémon inválido: 0')
  })

  it('handles pokemon not found', async () => {
    // Mock del API que lanza error
    vi.mocked(api.pokemon.getById).mockRejectedValue(new Error('Pokemon no encontrado'))
    
    const validParams = Promise.resolve({ id: '999' })
    
    await expect(async () => {
      await PokemonDetailPage({ params: validParams })
    }).rejects.toThrow('Pokemon no encontrado')
  })

  it('renders back link with correct href', async () => {
    vi.mocked(api.pokemon.getById).mockResolvedValue(mockPokemon)
    
    const mockParams = Promise.resolve({ id: '25' })
    const result = await PokemonDetailPage({ params: mockParams })
    
    render(result)

    const backLink = screen.getByText('Volver al listado').closest('a')
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('displays correct image src', async () => {
    vi.mocked(api.pokemon.getById).mockResolvedValue(mockPokemon)
    
    const mockParams = Promise.resolve({ id: '25' })
    const result = await PokemonDetailPage({ params: mockParams })
    
    render(result)

    const images = screen.getAllByAltText('pikachu')
    // La imagen principal debería tener el src correcto
    const mainImage = images.find(img => 
      img.getAttribute('src')?.includes('25.png')
    )
    expect(mainImage).toBeInTheDocument()
  })

  it('handles multiple types correctly', async () => {
    const dualTypePokemon = {
      ...mockPokemon,
      id: 1,
      name: 'bulbasaur',
      types: ['grass', 'poison'],
    }

    vi.mocked(api.pokemon.getById).mockResolvedValue(dualTypePokemon)
    
    const mockParams = Promise.resolve({ id: '1' })
    const result = await PokemonDetailPage({ params: mockParams })
    
    render(result)

    expect(screen.getByText('grass')).toBeInTheDocument()
    expect(screen.getByText('poison')).toBeInTheDocument()
  })

  it('calculates total stats correctly', async () => {
    vi.mocked(api.pokemon.getById).mockResolvedValue(mockPokemon)
    
    const mockParams = Promise.resolve({ id: '25' })
    const result = await PokemonDetailPage({ params: mockParams })
    
    render(result)

    // Total de stats de Pikachu: 35+55+40+50+50+90 = 320
    expect(screen.getByText('320')).toBeInTheDocument()
    
    // Promedio: 320/6 = 53.33 → 53
    expect(screen.getByText('53')).toBeInTheDocument()
  })
})
