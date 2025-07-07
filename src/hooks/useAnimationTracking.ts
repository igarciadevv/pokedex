import { useState, useMemo, useEffect, useCallback } from "react";
import { type PokemonWithSearchMatch } from "poke/components/PokemonList/PokemonRow";
import { type VirtualScrollData } from "poke/components/PokemonList/PokemonTable";

export function useAnimationTracking(
  filteredPokemon: PokemonWithSearchMatch[],
  virtualScrollData: VirtualScrollData
) {
  const [animatedItems, setAnimatedItems] = useState(new Set<number>());
  
  // Memoizar las IDs de los Pokemon filtrados para optimizar animaciones
  const filteredPokemonIds = useMemo(() => 
    new Set(filteredPokemon.map(p => p.id)), 
    [filteredPokemon]
  );
  
  // Función para añadir nuevos elementos animados
  const addAnimatedItem = useCallback((id: number) => {
    setAnimatedItems(prev => {
      if (prev.has(id)) return prev; // Ya está animado
      return new Set([...prev, id]);
    });
  }, []);
  
  // Limpiar elementos que ya no están en la lista filtrada
  useEffect(() => {
    setAnimatedItems(prev => {
      const filtered = new Set<number>();
      prev.forEach(id => {
        if (filteredPokemonIds.has(id)) {
          filtered.add(id);
        }
      });
      return filtered;
    });
  }, [filteredPokemonIds]);
  
  // Animar nuevos elementos en viewport
  useEffect(() => {
    const { itemsInViewport } = virtualScrollData;
    
    itemsInViewport.forEach(id => {
      if (filteredPokemonIds.has(id)) {
        setTimeout(() => {
          addAnimatedItem(id);
        }, 50);
      }
    });
  }, [virtualScrollData, filteredPokemonIds, addAnimatedItem]);
  
  return {
    animatedItems
  };
}
