import { memo } from "react";
import Image from "next/image";
import type { Pokemon } from "@prisma/client";
import { env } from "poke/env";

interface PokemonDetailCardProps {
  pokemon: Pokemon;
}

const PokemonDetailCard = memo<PokemonDetailCardProps>(({ pokemon }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className={`px-8 py-6 ${
        pokemon.isMythical 
          ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
          : pokemon.isLegendary 
          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
          : 'bg-gradient-to-r from-blue-500 to-blue-600'
      }`}>
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 
              className="text-3xl font-bold capitalize mb-2"
              style={{ 
                viewTransitionName: `pokemon-name-${pokemon.id}` 
              }}
            >
              {pokemon.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-lg font-mono opacity-90">#{pokemon.id}</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                Generación {pokemon.generation}
              </span>
            </div>
          </div>
          
          {/* Para el caso de mitico o legendario */}
          <div className="flex flex-col gap-2">
            {pokemon.isMythical && (
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium text-center">
               Mítico
              </span>
            )}
            {pokemon.isLegendary && !pokemon.isMythical && (
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium text-center">
               Legendario
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20 scale-110"></div>
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <Image 
                  src={`${env.NEXT_PUBLIC_POKE_IMAGE_BASE_URL}${pokemon.id}.png`} 
                  alt={pokemon.name} 
                  width={240}
                  height={240}
                  className="w-60 h-60 object-contain drop-shadow-lg"
                  priority
                  unoptimized
                  style={{ 
                    viewTransitionName: `pokemon-image-${pokemon.id}`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Información detallada */}
          <div className="space-y-6">
            {/* Tipos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Tipos</h3>
              <div className="flex gap-2 flex-wrap">
                {pokemon.types.map(type => (
                  <span 
                    key={type} 
                    className={`px-4 py-2 rounded-xl text-white font-medium text-sm capitalize shadow-lg bg-gray-400`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Datos físicos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Altura</div>
                <div className="text-2xl font-bold text-gray-800">{(pokemon.height / 10).toFixed(1)}m</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Peso</div>
                <div className="text-2xl font-bold text-gray-800">{(pokemon.weight / 10).toFixed(1)}kg</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

PokemonDetailCard.displayName = 'PokemonDetailCard';

export default PokemonDetailCard;
