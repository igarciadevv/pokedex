import { forwardRef } from "react";
import PokemonRow, { type PokemonWithSearchMatch } from "./PokemonRow";
import { usePokemonListContext } from "poke/contexts/PokemonListContext";

const ITEM_HEIGHT = 72;

interface VirtualScrollData {
  visibleItems: PokemonWithSearchMatch[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  itemsInViewport: Set<number>;
  viewportStartIdx: number;
  viewportEndIdx: number;
}

interface PokemonTableProps {
  virtualScrollData: VirtualScrollData;
  animatedItems: Set<number>;
  filteredPokemon: PokemonWithSearchMatch[];
  isLoading: boolean;
}

const PokemonTable = forwardRef<HTMLDivElement, PokemonTableProps>(({
  virtualScrollData,
  animatedItems,
  filteredPokemon,
  isLoading
}, ref) => {
  const { state: { searchQuery, selectedType, selectedGeneration } } = usePokemonListContext();
  
  const hasActiveFilters = !!(searchQuery || selectedType || selectedGeneration);

  return (
    <div ref={ref} className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 px-6 py-4 border-b font-medium text-sm text-gray-700 grid grid-cols-9 gap-4 sticky top-0 z-10">
        <div>ID</div>
        <div>Imagen</div>
        <div className="col-span-2">Nombre</div>
        <div>Gen</div>
        <div className="col-span-2">Tipos</div>
        <div className="col-span-2 relative group">
          Stats (?)
          <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span>❤️</span>
                <span>HP (Health Points)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚔️</span>
                <span>Attack (Ataque)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🛡️</span>
                <span>Defense (Defensa)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✨</span>
                <span>Special Attack (Ataque Especial)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔰</span>
                <span>Special Defense (Defensa Especial)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Speed (Velocidad)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista virtualizada */}
      <div style={{ height: virtualScrollData.totalHeight, position: 'relative' }}>
        <div style={{ 
          position: 'absolute',
          top: virtualScrollData.startIndex * ITEM_HEIGHT,
          left: 0,
          right: 0
        }}>
          {virtualScrollData.visibleItems.map((pokemon) => (
            <PokemonRow
              key={pokemon.id}
              pokemon={pokemon}
              isAnimated={animatedItems.has(pokemon.id)}
              isInViewport={virtualScrollData.itemsInViewport.has(pokemon.id)}
              style={{ height: ITEM_HEIGHT }}
            />
          ))}
        </div>
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredPokemon.length === 0 && !isLoading && (
        <div className="px-6 py-8 text-center text-gray-500">
          <p className="mb-2">No se encontraron Pokemon</p>
          {hasActiveFilters && (
            <div className="text-sm">
              <p>Con los filtros aplicados:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {searchQuery && <span className="px-2 py-1 bg-gray-100 rounded">{searchQuery}</span>}
                {selectedType && <span className="px-2 py-1 bg-gray-100 rounded capitalize">Tipo: {selectedType}</span>}
                {selectedGeneration && <span className="px-2 py-1 bg-gray-100 rounded">Gen: {selectedGeneration}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

PokemonTable.displayName = 'PokemonTable';

export default PokemonTable;
export type { VirtualScrollData };
