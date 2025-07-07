"use client";
import { memo } from "react";
import Image from "next/image";
import { Link } from 'next-view-transitions';
import type { Pokemon } from "@prisma/client";
import { env } from "poke/env";

interface PokemonWithSearchMatch extends Pokemon {
  _searchMatch?: {
    isDirectMatch: boolean;
    evolutionMatch: string | null;
  } | null;
}

interface PokemonRowProps {
  pokemon: PokemonWithSearchMatch;
  isAnimated: boolean;
  isInViewport: boolean;
  style: React.CSSProperties;
}

const PokemonRow = memo<PokemonRowProps>(({ 
  pokemon, 
  isAnimated, 
  isInViewport, 
  style
}) => {
  const rowClass = pokemon.isMythical ? 'mythical-row' : 
                  pokemon.isLegendary ? 'legendary-row' : 
                  'hover:bg-gray-50';
  
  // Diferentes tipos de animaciones para efecto más logrado
  const animationTypes = ['', 'slide-left', 'slide-right', 'scale-up', 'fade-blur'];
  const animationType = animationTypes[pokemon.id % animationTypes.length];
  
  // Solo animar si el elemento está realmente en el viewport y ha sido marcado para animación
  const shouldAnimate = isInViewport && isAnimated;
  const animationClass = `pokemon-row ${animationType} ${shouldAnimate ? 'animate-in' : ''}`;
  
  
  return (
    <Link 
      href={`/pokemon/${pokemon.id}`}
      className={`block px-6 py-3 border-b grid grid-cols-9 gap-4 items-center transition-all duration-200 cursor-pointer ${rowClass} ${animationClass} hover:shadow-sm hover:border-gray-300 relative group`}
      style={style}
    >
      <div className="font-mono text-sm text-gray-600">#{pokemon.id}</div>

      <div>
        <Image 
          src={`${env.NEXT_PUBLIC_POKE_IMAGE_BASE_URL}${pokemon.id}.png`} 
          alt={pokemon.name} 
          width={48}
          height={48}
          className="w-12 h-12 object-contain"
          loading="lazy"
          unoptimized
          style={{ 
            viewTransitionName: `pokemon-image-${pokemon.id}`
          }}
        />
      </div>

      <div className="col-span-2">
        <div className="flex items-center gap-2 flex-wrap">
          <p 
            className="font-semibold capitalize group-hover:text-blue-600 transition-colors"
            style={{ 
              viewTransitionName: `pokemon-name-${pokemon.id}`
            }}
          >
            {pokemon.name}
          </p>
          {pokemon.isMythical && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-medium">
              Mítico
            </span>
          )}
          {pokemon.isLegendary && !pokemon.isMythical && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              Legendario
            </span>
          )}
          {pokemon._searchMatch && !pokemon._searchMatch.isDirectMatch && pokemon._searchMatch.evolutionMatch && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
              🔗 Línea de {pokemon._searchMatch.evolutionMatch}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{pokemon.height / 10}m • {pokemon.weight / 10}kg</p>
      </div>

      <div className="text-sm">
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
          Gen {pokemon.generation}
        </span>
      </div>

      <div className="col-span-2">
        <div className="flex gap-1 flex-wrap">
          {pokemon.types.map(type => (
            <span 
              key={type} 
              className="px-2 py-1 border border-slate-300 text-slate-700 text-xs rounded-md capitalize bg-white/60 backdrop-blur-sm font-medium"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="col-span-2 text-xs">
        <div className="grid grid-cols-2 grid-rows-3 gap-x-2 gap-y-0.5">
          {[
            { icon: "❤️", value: pokemon.stats[0], color: "text-red-600" },
            { icon: "⚔️", value: pokemon.stats[1], color: "text-orange-600" },
            { icon: "🛡️", value: pokemon.stats[2], color: "text-blue-600" },
            { icon: "✨", value: pokemon.stats[3], color: "text-purple-600" },
            { icon: "💎", value: pokemon.stats[4], color: "text-indigo-600" },
            { icon: "⚡", value: pokemon.stats[5], color: "text-yellow-600" }
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span>{stat.icon}</span>
              <span className={`font-medium ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
});

PokemonRow.displayName = 'PokemonRow';

export default PokemonRow;
export type { PokemonWithSearchMatch };
