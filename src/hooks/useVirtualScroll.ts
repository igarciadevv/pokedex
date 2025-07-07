import { useState, useMemo, useRef, useEffect } from "react";
import { type PokemonWithSearchMatch } from "poke/components/PokemonList/PokemonRow";
import { type VirtualScrollData } from "poke/components/PokemonList/PokemonTable";
import { usePokemonListContext } from "poke/contexts/PokemonListContext";

// Nota: utilizando react-virtual o similar, la busqueda tenia algo de delay

const ITEM_HEIGHT = 72;
const OVERSCAN = 4; 

export function useVirtualScroll(filteredPokemon: PokemonWithSearchMatch[]) {
  const [scrollY, setScrollY] = useState(0);
  const [containerTop, setContainerTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state: { scrollPosition }, setScrollPosition } = usePokemonListContext();
  
  // Flag para controlar si debemos restaurar el scroll
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(true);

  const virtualScrollData: VirtualScrollData = useMemo(() => {
    const viewportStart = scrollY;
    const viewportEnd = scrollY + (typeof window !== 'undefined' ? window.innerHeight : 800);
    const listStart = Math.max(0, viewportStart - containerTop);
    const listEnd = Math.max(0, viewportEnd - containerTop);
    
    // Renderizado expandido
    const renderStartIdx = Math.max(0, Math.floor(listStart / ITEM_HEIGHT) - OVERSCAN);
    const renderEndIdx = Math.min(filteredPokemon.length, Math.ceil(listEnd / ITEM_HEIGHT) + OVERSCAN);
    
    // Elementos realmente visibles en viewport
    const viewportStartIdx = Math.max(0, Math.floor(listStart / ITEM_HEIGHT));
    const viewportEndIdx = Math.min(filteredPokemon.length, Math.ceil(listEnd / ITEM_HEIGHT) + 1);
    
    // IDs de elementos en viewport (incluyendo el elemento anterior al primero)
    const inViewport = new Set<number>();
    
    // Añadir el elemento inmediatamente anterior al primero del viewport (si existe)
    const previousIdx = viewportStartIdx - 1;
    if (previousIdx >= 0 && filteredPokemon[previousIdx]) {
      inViewport.add(filteredPokemon[previousIdx].id);
    }
    
    // Añadir los elementos del viewport actual
    for (let i = viewportStartIdx; i < viewportEndIdx; i++) {
      if (filteredPokemon[i]) {
        inViewport.add(filteredPokemon[i]!.id);
      }
    }
    
    return {
      visibleItems: filteredPokemon.slice(renderStartIdx, renderEndIdx),
      startIndex: renderStartIdx,
      endIndex: renderEndIdx,
      totalHeight: filteredPokemon.length * ITEM_HEIGHT,
      itemsInViewport: inViewport,
      viewportStartIdx,
      viewportEndIdx
    };
  }, [filteredPokemon, scrollY, containerTop]);

  // Effect para actualizar posición del container
  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerTop(window.scrollY + rect.top);
      }
    };
    
    updatePosition();
    const resizeObserver = new ResizeObserver(updatePosition);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [filteredPokemon]);

  // Effect para manejar scroll y guardar posición en contexto
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Guardar la posición en el contexto 
      setScrollPosition(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollPosition]);

  // Restaurar el scroll si volvemos desde pagina de detalle
  // TODO: con esta forma de hacer scroll no hay view transitions si estan muy abajo
  useEffect(() => {
    if (shouldRestoreScroll && scrollPosition > 0 && typeof window !== 'undefined') {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'instant'
        });
        setShouldRestoreScroll(false);
    }
  }, [scrollPosition, shouldRestoreScroll]);

  return {
    containerRef,
    virtualScrollData
  };
}
