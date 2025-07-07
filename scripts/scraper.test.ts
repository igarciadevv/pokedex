import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('process', () => ({
  env: {
    SCRAPER_CONCURRENCY: '10',
    SCRAPER_BATCH_SIZE: '50',
    SCRAPER_POKEMON_LIMIT: '100',
    SCRAPER_REQUEST_DELAY: '100',
  }
}))

// Importar después de los mocks
import { extractStats, extractEvolutionPokemon } from './scraper'
import { PokemonSchema, SpeciesSchema, EvolutionChainSchema } from './pokemon.schemas'

describe('Pokemon Scraper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  describe('extractStats function', () => {
    it('should extract stats in correct order', () => {
      const mockStats = [
        { base_stat: 45, stat: { name: 'hp', url: 'test' } },
        { base_stat: 49, stat: { name: 'attack', url: 'test' } },
        { base_stat: 49, stat: { name: 'defense', url: 'test' } },
        { base_stat: 65, stat: { name: 'special-attack', url: 'test' } },
        { base_stat: 65, stat: { name: 'special-defense', url: 'test' } },
        { base_stat: 45, stat: { name: 'speed', url: 'test' } },
      ]

      const result = extractStats(mockStats)
      
      expect(result).toEqual([45, 49, 49, 65, 65, 45])
      expect(result).toHaveLength(6)
    })

    it('should handle missing stats with zeros', () => {
      const mockStats = [
        { base_stat: 45, stat: { name: 'hp', url: 'test' } },
        { base_stat: 49, stat: { name: 'attack', url: 'test' } },
      ]

      const result = extractStats(mockStats)
      
      expect(result).toEqual([45, 49, 0, 0, 0, 0])
      expect(result).toHaveLength(6)
    })

    it('should handle empty stats array', () => {
      const result = extractStats([])
      
      expect(result).toEqual([0, 0, 0, 0, 0, 0])
      expect(result).toHaveLength(6)
    })
  })

  describe('extractEvolutionPokemon function', () => {
    it('should extract pokemon from simple evolution chain', () => {
      const mockChain = {
        species: {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon-species/1/'
        },
        evolves_to: [
          {
            species: {
              name: 'ivysaur',
              url: 'https://pokeapi.co/api/v2/pokemon-species/2/'
            },
            evolves_to: []
          }
        ]
      }

      const result = extractEvolutionPokemon(mockChain)
      
      expect(result).toEqual([
        { id: 1, stage: 1 },
        { id: 2, stage: 2 }
      ])
    })

    it('should handle three-stage evolution', () => {
      const mockChain = {
        species: {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon-species/1/'
        },
        evolves_to: [
          {
            species: {
              name: 'ivysaur',
              url: 'https://pokeapi.co/api/v2/pokemon-species/2/'
            },
            evolves_to: [
              {
                species: {
                  name: 'venusaur',
                  url: 'https://pokeapi.co/api/v2/pokemon-species/3/'
                },
                evolves_to: []
              }
            ]
          }
        ]
      }

      const result = extractEvolutionPokemon(mockChain)
      
      expect(result).toEqual([
        { id: 1, stage: 1 },
        { id: 2, stage: 2 },
        { id: 3, stage: 3 }
      ])
    })

  })

  describe('Schema validation', () => {
    it('should validate correct Pokemon data', () => {
      const validPokemon = {
        id: 1,
        name: 'bulbasaur',
        height: 7,
        weight: 69,
        types: [
          { type: { name: 'grass', url: 'test' } }
        ],
        stats: [
          { base_stat: 45, stat: { name: 'hp', url: 'test' } }
        ],
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'test-url'
            }
          }
        },
        species: {
          name: 'bulbasaur',
          url: 'test'
        }
      }

      const result = PokemonSchema.safeParse(validPokemon)
      expect(result.success).toBe(true)
    })

    it('should reject invalid Pokemon data', () => {
      const invalidPokemon = {
        id: 'not-a-number',
        name: 'bulbasaur'
      }

      const result = PokemonSchema.safeParse(invalidPokemon)
      expect(result.success).toBe(false)
    })

    it('should validate correct Species data', () => {
      const validSpecies = {
        generation: {
          name: 'generation-i',
          url: 'test'
        },
        evolution_chain: {
          url: 'test'
        },
        is_legendary: false,
        is_mythical: false
      }

      const result = SpeciesSchema.safeParse(validSpecies)
      expect(result.success).toBe(true)
    })

    it('should validate Evolution Chain data', () => {
      const validEvolution = {
        chain: {
          species: {
            name: 'bulbasaur',
            url: 'test'
          },
          evolves_to: []
        }
      }

      const result = EvolutionChainSchema.safeParse(validEvolution)
      expect(result.success).toBe(true)
    })
  })

  // TODO añadir tests para comprobar que se llaman a ciertos endpoints durante el scraping etc
})
