"use client";
import { api } from "poke/trpc/react";
import PokemonTable from "poke/components/PokemonList/PokemonTable";
import FilterSection from "poke/components/PokemonList/FilterSection";
import LoadingTablePlaceholder from "poke/components/PokemonList/LoadingTablePlaceholder";
import { usePokemonFilters } from "poke/hooks/usePokemonFilters";
import { useVirtualScroll } from "poke/hooks/useVirtualScroll";
import { useAnimationTracking } from "poke/hooks/useAnimationTracking";

export default function PokemonListPage() {
  const { data: allPokemon, isLoading: loadingAll } = api.pokemon.getAll.useQuery();
  const { filteredPokemon } = usePokemonFilters(allPokemon);
  const { containerRef, virtualScrollData } = useVirtualScroll(filteredPokemon);
  const { animatedItems } = useAnimationTracking(filteredPokemon, virtualScrollData);

  return (
    <div>
      <FilterSection
        allPokemon={allPokemon}
        filteredPokemon={filteredPokemon}
        isLoading={loadingAll}
      />

      {loadingAll ? (
        <LoadingTablePlaceholder />
      ) : (
        <PokemonTable
          ref={containerRef}
          virtualScrollData={virtualScrollData}
          animatedItems={animatedItems}
          filteredPokemon={filteredPokemon}
          isLoading={false}
        />
      )}
    </div>
  );
}

