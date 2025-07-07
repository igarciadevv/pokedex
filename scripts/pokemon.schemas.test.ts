import { describe, it, expect } from 'vitest'
import { GENERATIONS, PokemonSchema, SpeciesSchema } from './pokemon.schemas'

describe('Pokemon Schemas', () => {
  describe('GENERATIONS constant', () => {
    it('contains all expected generations', () => {
      expect(GENERATIONS).toHaveProperty('generation-i', 1)
      expect(GENERATIONS).toHaveProperty('generation-ii', 2)
      expect(GENERATIONS).toHaveProperty('generation-iii', 3)
      expect(GENERATIONS).toHaveProperty('generation-iv', 4)
      expect(GENERATIONS).toHaveProperty('generation-v', 5)
      expect(GENERATIONS).toHaveProperty('generation-vi', 6)
      expect(GENERATIONS).toHaveProperty('generation-vii', 7)
      expect(GENERATIONS).toHaveProperty('generation-viii', 8)
      expect(GENERATIONS).toHaveProperty('generation-ix', 9)
    })

    it('maps generation names to correct numbers', () => {
      expect(GENERATIONS['generation-i']).toBe(1)
      expect(GENERATIONS['generation-v']).toBe(5)
      expect(GENERATIONS['generation-ix']).toBe(9)
    })
  })

  describe('PokemonSchema', () => {
    it('validates correct Pokemon data', () => {
      const validPokemon = {
        id: 1,
        name: 'bulbasaur',
        height: 7,
        weight: 69,
        types: [
          { type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' } },
          { type: { name: 'poison', url: 'https://pokeapi.co/api/v2/type/4/' } }
        ],
        stats: [
          { base_stat: 45, stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1/' } },
          { base_stat: 49, stat: { name: 'attack', url: 'https://pokeapi.co/api/v2/stat/2/' } }
        ],
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
            }
          }
        },
        species: {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon-species/1/'
        }
      }

      const result = PokemonSchema.safeParse(validPokemon)
      expect(result.success).toBe(true)
    })

    it('rejects invalid Pokemon data', () => {
      const invalidPokemon = {
        id: 'not-a-number',
        name: 'bulbasaur'
        // missing required fields
      }

      const result = PokemonSchema.safeParse(invalidPokemon)
      expect(result.success).toBe(false)
    })
  })

  describe('SpeciesSchema', () => {
    it('validates correct Species data', () => {
      const validSpecies = {
        generation: {
          name: 'generation-i',
          url: 'https://pokeapi.co/api/v2/generation/1/'
        },
        evolution_chain: {
          url: 'https://pokeapi.co/api/v2/evolution-chain/1/'
        },
        is_legendary: false,
        is_mythical: false
      }

      const result = SpeciesSchema.safeParse(validSpecies)
      expect(result.success).toBe(true)
    })

    it('handles legendary and mythical flags correctly', () => {
      const legendarySpecies = {
        generation: {
          name: 'generation-i',
          url: 'https://pokeapi.co/api/v2/generation/1/'
        },
        evolution_chain: {
          url: 'https://pokeapi.co/api/v2/evolution-chain/1/'
        },
        is_legendary: true,
        is_mythical: false
      }

      const result = SpeciesSchema.safeParse(legendarySpecies)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.is_legendary).toBe(true)
        expect(result.data.is_mythical).toBe(false)
      }
    })
  })
})
