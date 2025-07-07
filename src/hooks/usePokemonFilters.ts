import { useMemo } from "react";
import type { Pokemon } from "@prisma/client";
import { type PokemonWithSearchMatch } from "poke/components/PokemonList/PokemonRow";
import { usePokemonListContext } from "poke/contexts/PokemonListContext";

// Extender el tipo Pokemon para incluir fullEvolutionChain y eliminar fechas...
type PokemonWithEvolution = Omit<Pokemon, 'createdAt' | 'updatedAt'> & {
  fullEvolutionChain: string[]
};

export function usePokemonFilters(allPokemon: PokemonWithEvolution[] | undefined) {
  const { state: { searchQuery, selectedType, selectedGeneration } } = usePokemonListContext();

  const filteredPokemon = useMemo(() => {
    if (!allPokemon) return [];
    
    return allPokemon
      .filter(pokemon => {
        // Búsqueda
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesName = pokemon.name.toLowerCase().includes(query);
          const matchesEvolution = pokemon.fullEvolutionChain.some(evo => 
            evo.toLowerCase() === query
          );
          if (!matchesName && !matchesEvolution) return false;
        }
        
        // Tipo
        if (selectedType && !pokemon.types.includes(selectedType)) return false;
        
        // Generación
        if (selectedGeneration && pokemon.generation !== parseInt(selectedGeneration)) return false;
        
        return true;
      })
      .map(pokemon => {
        if (!searchQuery) {
          return pokemon as PokemonWithSearchMatch & PokemonWithEvolution;
        }
        
        const query = searchQuery.toLowerCase();
        const matchesCurrentName = pokemon.name.toLowerCase().includes(query);
        const evolutionMatch = pokemon.fullEvolutionChain.find((evo: string) => 
          evo.toLowerCase() === query
        );
        
        return {
          ...pokemon,
          _searchMatch: {
            isDirectMatch: matchesCurrentName,
            evolutionMatch: evolutionMatch ?? null
          }
        } as PokemonWithSearchMatch & PokemonWithEvolution;
      });
  }, [allPokemon, searchQuery, selectedType, selectedGeneration]);

  return { filteredPokemon };
}
