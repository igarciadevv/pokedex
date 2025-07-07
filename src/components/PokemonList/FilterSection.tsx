import { memo, useMemo, useCallback } from "react";
import SearchInput from "./SearchInput";
import FilterSelect, { type FilterOption } from "./FilterSelect";
import { usePokemonListContext } from "poke/contexts/PokemonListContext";
import { type PokemonWithSearchMatch } from "poke/components/PokemonList/PokemonRow";
import type { Pokemon } from "@prisma/client";

type PokemonWithEvolution = Omit<Pokemon, 'createdAt' | 'updatedAt'> & {
  fullEvolutionChain: string[]
};

interface FilterSectionProps {
  allPokemon: PokemonWithEvolution[] | undefined;
  filteredPokemon: PokemonWithSearchMatch[];
  isLoading: boolean;
}

const FilterSection = memo<FilterSectionProps>(({
  allPokemon,
  filteredPokemon,
  isLoading
}) => {
  const {
    state: { searchQuery, selectedType, selectedGeneration },
    setSearchQuery,
    setSelectedType,
    setSelectedGeneration,
    removeFilter
  } = usePokemonListContext();

  const filterOptions = useMemo(() => {
    if (!allPokemon) return { typeOptions: [], generationOptions: [] };
    
    const types = new Set<string>();
    const generations = new Set<number>();
    
    allPokemon.forEach(pokemon => {
      pokemon.types.forEach(type => types.add(type));
      generations.add(pokemon.generation);
    });
    
    const typeOptions: FilterOption[] = Array.from(types)
      .sort()
      .map(type => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1)
      }));

    const generationOptions: FilterOption[] = Array.from(generations)
      .sort((a, b) => a - b)
      .map(gen => ({
        value: gen,
        label: `Generación ${gen}`
      }));
    
    return { typeOptions, generationOptions };
  }, [allPokemon]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  }, [setSelectedType]);

  const handleGenerationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGeneration(e.target.value);
  }, [setSelectedGeneration]);

  const handleRemoveFilter = useCallback((type: 'search' | 'type' | 'generation') => {
    removeFilter(type);
    // Reset scroll when filters change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [removeFilter]);

  return (
    <div className="mb-6">
      {/* Controles de filtro */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre..."
        />
        
        <FilterSelect
          value={selectedType}
          onChange={handleTypeChange}
          options={isLoading ? [] : filterOptions.typeOptions}
          placeholder="Todos los tipos"
          width="sm:w-56"
        />
        
        <FilterSelect
          value={selectedGeneration}
          onChange={handleGenerationChange}
          options={isLoading ? [] : filterOptions.generationOptions}
          placeholder="Todas las generaciones"
          width="sm:w-60"
        />
      </div>
      
      {/* Info de resultados y filtros activos */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span>{filteredPokemon.length} de {allPokemon?.length ?? 0} Pokemon</span>
        
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-4 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
              Nombre: {searchQuery}
              <button 
                onClick={() => handleRemoveFilter('search')} 
                className="text-lg text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          )}
          {selectedType && (
            <span className="inline-flex items-center gap-1 px-4 py-1 bg-green-100 text-green-700 rounded-md text-xs capitalize">
              Tipo: {selectedType}
              <button 
                onClick={() => handleRemoveFilter('type')} 
                className="text-lg text-green-500 hover:text-green-700"
              >
                ×
              </button>
            </span>
          )}
          {selectedGeneration && (
            <span className="inline-flex items-center gap-1 px-4 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">
              Gen: {selectedGeneration}
              <button 
                onClick={() => handleRemoveFilter('generation')} 
                className="text-lg text-purple-500 hover:text-purple-700"
              >
                ×
              </button>
            </span>
          )}
        </div>
        
      </div>
    </div>
  );
});

FilterSection.displayName = 'FilterSection';

export default FilterSection;
