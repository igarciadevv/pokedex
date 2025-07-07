import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePokemonFilters } from './usePokemonFilters'
import type { ReactNode } from 'react'

// Mock directo del contexto
const mockContextState = {
  searchQuery: '',
  selectedType: '',
  selectedGeneration: '',
  scrollPosition: 0,
}

const mockContextActions = {
  setSearchQuery: vi.fn(),
  setSelectedType: vi.fn(),
  setSelectedGeneration: vi.fn(),
  setScrollPosition: vi.fn(),
  clearSearch: vi.fn(),
  clearType: vi.fn(),
  clearGeneration: vi.fn(),
  resetAll: vi.fn(),
  removeFilter: vi.fn(),
}

// Mock del hook del contexto
vi.mock('poke/contexts/PokemonListContext', () => ({
  usePokemonListContext: () => ({
    state: mockContextState,
    ...mockContextActions,
  }),
  PokemonListProvider: ({ children }: { children: ReactNode }) => children,
}))

// Helper para configurar el estado del mock
const setMockState = (searchQuery = '', selectedType = '', selectedGeneration = '') => {
  mockContextState.searchQuery = searchQuery
  mockContextState.selectedType = selectedType
  mockContextState.selectedGeneration = selectedGeneration
}

// Mock Pokemon data
const mockPokemon = [
  {
    id: 1,
    name: 'bulbasaur',
    types: ['grass', 'poison'],
    generation: 1,
    height: 7,
    weight: 69,
    isLegendary: false,
    isMythical: false,
    stats: [45, 49, 49, 65, 65, 45],
    fullEvolutionChain: ['bulbasaur', 'ivysaur', 'venusaur']
  },
  {
    id: 172,
    name: 'pichu',
    types: ['electric'],
    generation: 2,
    height: 3,
    weight: 20,
    isLegendary: false,
    isMythical: false,
    stats: [20, 40, 15, 35, 35, 60],
    fullEvolutionChain: ['pichu', 'pikachu', 'raichu']
  },
  {
    id: 25,
    name: 'pikachu',
    types: ['electric'],
    generation: 1,
    height: 4,
    weight: 60,
    isLegendary: false,
    isMythical: false,
    stats: [35, 55, 40, 50, 50, 90],
    fullEvolutionChain: ['pichu', 'pikachu', 'raichu']
  },
  {
    id: 26,
    name: 'raichu',
    types: ['electric'],
    generation: 1,
    height: 8,
    weight: 300,
    isLegendary: false,
    isMythical: false,
    stats: [60, 90, 55, 90, 80, 110],
    fullEvolutionChain: ['pichu', 'pikachu', 'raichu']
  },
  {
    id: 150,
    name: 'mewtwo',
    types: ['psychic'],
    generation: 1,
    height: 20,
    weight: 1220,
    isLegendary: true,
    isMythical: false,
    stats: [106, 110, 90, 154, 90, 130],
    fullEvolutionChain: ['mewtwo']
  },
  {
    id: 144,
    name: 'articuno',
    types: ['ice', 'flying'],
    generation: 1,
    height: 17,
    weight: 554,
    isLegendary: true,
    isMythical: false,
    stats: [90, 85, 100, 95, 125, 85],
    fullEvolutionChain: ['articuno']
  },
  {
    id: 155,
    name: 'cyndaquil',
    types: ['fire'],
    generation: 2,
    height: 5,
    weight: 79,
    isLegendary: false,
    isMythical: false,
    stats: [39, 52, 43, 60, 50, 65],
    fullEvolutionChain: ['cyndaquil', 'quilava', 'typhlosion']
  }
]

describe('usePokemonFilters Hook', () => {
  beforeEach(() => {
    // Reset del estado del mock antes de cada test
    setMockState('', '', '')
  })

  it('returns all pokemon when no filters are applied', () => {
    setMockState() // Sin filtros
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    expect(result.current.filteredPokemon).toHaveLength(7)
    expect(result.current.filteredPokemon.map(p => p.name)).toEqual([
      'bulbasaur', 'pichu', 'pikachu', 'raichu', 'mewtwo', 'articuno', 'cyndaquil'
    ])
  })

  it('returns empty array when no pokemon data is provided', () => {
    const { result } = renderHook(() => usePokemonFilters(undefined))
    
    expect(result.current.filteredPokemon).toEqual([])
  })

  it('filters pokemon by search query (name match)', () => {
    setMockState('pika') // Solo búsqueda
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    expect(result.current.filteredPokemon).toHaveLength(1)
    expect(result.current.filteredPokemon[0]?.name).toBe('pikachu')
    expect(result.current.filteredPokemon[0]?._searchMatch?.isDirectMatch).toBe(true)
  })

  it('filters pokemon by search query (evolution chain match)', () => {
    setMockState('ivysaur') // Búsqueda por evolución
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    expect(result.current.filteredPokemon).toHaveLength(1)
    expect(result.current.filteredPokemon[0]?.name).toBe('bulbasaur')
    expect(result.current.filteredPokemon[0]?._searchMatch?.isDirectMatch).toBe(false)
    expect(result.current.filteredPokemon[0]?._searchMatch?.evolutionMatch).toBe('ivysaur')
  })

  it('finds entire evolution line when searching for any member (pikachu line)', () => {
    setMockState('pikachu') // Búsqueda que debe encontrar toda la línea
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    // Debería encontrar pichu, pikachu y raichu porque todos tienen "pikachu" en su cadena evolutiva
    expect(result.current.filteredPokemon).toHaveLength(3)
    
    const pokemonNames = result.current.filteredPokemon.map(p => p.name).sort()
    
    expect(pokemonNames).toEqual(['pichu', 'pikachu', 'raichu'])
    // Verificar que pikachu es match directo
    const pikachu = result.current.filteredPokemon.find(p => p.name === 'pikachu')
    expect(pikachu?._searchMatch?.isDirectMatch).toBe(true)
    
    // Verificar que pichu y raichu son matches por evolución
    const pichu = result.current.filteredPokemon.find(p => p.name === 'pichu')
    expect(pichu?._searchMatch?.isDirectMatch).toBe(false)
    expect(pichu?._searchMatch?.evolutionMatch).toBe('pikachu')
    
    const raichu = result.current.filteredPokemon.find(p => p.name === 'raichu')
    expect(raichu?._searchMatch?.isDirectMatch).toBe(false)
    expect(raichu?._searchMatch?.evolutionMatch).toBe('pikachu')
  })

  it('finds entire evolution line when searching for any member (pichu search)', () => {
    setMockState('pichu') // Búsqueda desde el primer eslabón
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    // Debería encontrar pichu, pikachu y raichu porque todos tienen "pichu" en su cadena evolutiva
    expect(result.current.filteredPokemon).toHaveLength(3)
    
    const pokemonNames = result.current.filteredPokemon.map(p => p.name).sort()
    expect(pokemonNames).toEqual(['pichu', 'pikachu', 'raichu'])
    
    // Verificar que pichu es match directo
    const pichu = result.current.filteredPokemon.find(p => p.name === 'pichu')
    expect(pichu?._searchMatch?.isDirectMatch).toBe(true)
    
    // Verificar que pikachu y raichu son matches por evolución
    const pikachu = result.current.filteredPokemon.find(p => p.name === 'pikachu')
    expect(pikachu?._searchMatch?.isDirectMatch).toBe(false)
    expect(pikachu?._searchMatch?.evolutionMatch).toBe('pichu')
  })

  it('filters pokemon by type', () => {
    setMockState('', 'fire') // Solo filtro de tipo
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    expect(result.current.filteredPokemon).toHaveLength(1)
    expect(result.current.filteredPokemon[0]?.name).toBe('cyndaquil')
    expect(result.current.filteredPokemon[0]?.types).toContain('fire')
  })

  it('filters pokemon by generation', () => {
    setMockState('', '', '2') // Solo filtro de generación
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    expect(result.current.filteredPokemon).toHaveLength(2)
    const names = result.current.filteredPokemon.map(p => p.name).sort()
    expect(names).toEqual(['cyndaquil', 'pichu'])
  })

  it('filters pokemon with multiple criteria', () => {
    setMockState('', 'psychic', '1') // Tipo + generación
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    expect(result.current.filteredPokemon).toHaveLength(1)
    expect(result.current.filteredPokemon[0]?.name).toBe('mewtwo')
  })

  it('returns empty array when filters match no pokemon', () => {
    setMockState('', 'dragon') // Tipo que no existe
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    expect(result.current.filteredPokemon).toHaveLength(0)
  })

  it('filters pokemon by search query with case insensitivity', () => {
    setMockState('MEWTWO') // Búsqueda en mayúsculas
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    expect(result.current.filteredPokemon).toHaveLength(1)
    expect(result.current.filteredPokemon[0]?.name).toBe('mewtwo')
  })

  it('filters pokemon with dual types correctly', () => {
    setMockState('', 'poison') // Tipo poison (bulbasaur es grass/poison)
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    expect(result.current.filteredPokemon).toHaveLength(1)
    expect(result.current.filteredPokemon[0]?.name).toBe('bulbasaur')
    expect(result.current.filteredPokemon[0]?.types).toEqual(['grass', 'poison'])
  })

  it('combines search and type filters correctly', () => {
    setMockState('aur', 'grass') // Búsqueda + tipo
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    expect(result.current.filteredPokemon).toHaveLength(1)
    expect(result.current.filteredPokemon[0]?.name).toBe('bulbasaur')
  })

  it('combines evolution search with type filter correctly', () => {
    setMockState('pikachu', 'electric') // Búsqueda evolución + tipo
    
    const { result } = renderHook(() => usePokemonFilters(mockPokemon))
    
    // Buscar "pikachu" + tipo "electric" debería devolver toda la línea evolutiva
    expect(result.current.filteredPokemon).toHaveLength(3)
    const names = result.current.filteredPokemon.map(p => p.name).sort()
    expect(names).toEqual(['pichu', 'pikachu', 'raichu'])
    
    // Todos deberían ser tipo electric
    result.current.filteredPokemon.forEach(pokemon => {
      expect(pokemon.types).toContain('electric')
    })
  })
})
