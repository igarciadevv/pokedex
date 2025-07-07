"use client";
import { createContext, useContext, useReducer, type ReactNode } from 'react';

// Componente para conservar el estado entre navegaciones
// Ya que el estado de filtros y scroll es complejo, se opta por Reducer

interface PokemonListState {
  searchQuery: string;
  selectedType: string;
  selectedGeneration: string;
  scrollPosition: number;
}

type PokemonListAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_TYPE'; payload: string }
  | { type: 'SET_SELECTED_GENERATION'; payload: string }
  | { type: 'SET_SCROLL_POSITION'; payload: number }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'CLEAR_TYPE' }
  | { type: 'CLEAR_GENERATION' }
  | { type: 'RESET_ALL' };

const initialState: PokemonListState = {
  searchQuery: '',
  selectedType: '',
  selectedGeneration: '',
  scrollPosition: 0,
};

function pokemonListReducer(state: PokemonListState, action: PokemonListAction): PokemonListState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_TYPE':
      return { ...state, selectedType: action.payload };
    case 'SET_SELECTED_GENERATION':
      return { ...state, selectedGeneration: action.payload };
    case 'SET_SCROLL_POSITION':
      return { ...state, scrollPosition: action.payload };
    case 'CLEAR_SEARCH':
      return { ...state, searchQuery: '' };
    case 'CLEAR_TYPE':
      return { ...state, selectedType: '' };
    case 'CLEAR_GENERATION':
      return { ...state, selectedGeneration: '' };
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
}

interface PokemonListContextType {
  state: PokemonListState;
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: string) => void;
  setSelectedGeneration: (generation: string) => void;
  setScrollPosition: (position: number) => void;
  clearSearch: () => void;
  clearType: () => void;
  clearGeneration: () => void;
  resetAll: () => void;
  removeFilter: (type: 'search' | 'type' | 'generation') => void;
}

const PokemonListContext = createContext<PokemonListContextType | undefined>(undefined);

export function PokemonListProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pokemonListReducer, initialState);

  const contextValue: PokemonListContextType = {
    state,
    setSearchQuery: (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    setSelectedType: (type: string) => dispatch({ type: 'SET_SELECTED_TYPE', payload: type }),
    setSelectedGeneration: (generation: string) => dispatch({ type: 'SET_SELECTED_GENERATION', payload: generation }),
    setScrollPosition: (position: number) => dispatch({ type: 'SET_SCROLL_POSITION', payload: position }),
    clearSearch: () => dispatch({ type: 'CLEAR_SEARCH' }),
    clearType: () => dispatch({ type: 'CLEAR_TYPE' }),
    clearGeneration: () => dispatch({ type: 'CLEAR_GENERATION' }),
    resetAll: () => dispatch({ type: 'RESET_ALL' }),
    removeFilter: (type: 'search' | 'type' | 'generation') => {
      switch (type) {
        case 'search':
          dispatch({ type: 'CLEAR_SEARCH' });
          break;
        case 'type':
          dispatch({ type: 'CLEAR_TYPE' });
          break;
        case 'generation':
          dispatch({ type: 'CLEAR_GENERATION' });
          break;
      }
    },
  };

  return (
    <PokemonListContext.Provider value={contextValue}>
      {children}
    </PokemonListContext.Provider>
  );
}

export function usePokemonListContext() {
  const context = useContext(PokemonListContext);
  if (context === undefined) {
    throw new Error('usePokemonListContext must be used within a PokemonListProvider');
  }
  return context;
}
