import { api } from "poke/trpc/server";
import PokemonDetailCard from "poke/components/PokemonDetail/PokemonDetailCard";
import EvolutionChain from "poke/components/PokemonDetail/EvolutionChain";
import StatsDisplay from "poke/components/PokemonDetail/StatsDisplay";
import { Link } from 'next-view-transitions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PokemonDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  // Validación robusta del ID
  const pokemonId = Number(resolvedParams.id);
  
  if (isNaN(pokemonId) || !Number.isInteger(pokemonId) || pokemonId <= 0) {
    throw new Error(`ID de Pokémon inválido: ${resolvedParams.id}`);
  }
  
  const pokemon = await api.pokemon.getById({ id: pokemonId });
  
  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 py-8">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md border border-gray-200 transition-all duration-200 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al listado
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="animate-fadeIn">
              <PokemonDetailCard pokemon={pokemon} />
            </div>
            
            <div className="mt-8">
              <div className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
                <StatsDisplay pokemon={pokemon} />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <EvolutionChain 
              pokemon={pokemon}
              evolutionChain={pokemon.fullEvolutionChain}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
