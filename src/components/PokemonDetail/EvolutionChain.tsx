import Image from "next/image";
import { Link } from 'next-view-transitions';
import type { Pokemon } from "@prisma/client";
import { env } from "poke/env";

interface EvolutionChainProps {
  pokemon: Pokemon;
  evolutionChain: Array<{
    id: number;
    name: string;
    stage: number;
  }>;
}

export default function EvolutionChain({ pokemon, evolutionChain }: EvolutionChainProps) {
  // Si no hay cadena de evolución o solo hay 1 Pokemon, no mostrar nada
  if (!evolutionChain || evolutionChain.length <= 1) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          Evoluciones
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Este Pokémon no tiene evoluciones conocidas</p>
        </div>
      </div>
    );
  }

  // Agrupar por etapa
  const evolutionsByStage = evolutionChain.reduce((acc, evo) => {
    const stage = evo.stage || 1;
    acc[stage] ??= [];
    acc[stage].push(evo);
    return acc;
  }, {} as Record<number, typeof evolutionChain>);

  const stages = Object.keys(evolutionsByStage).map(Number).sort();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Cadena de Evolución
        </h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {stages.map((stage, stageIndex) => (
            <div key={stage}>
              {/* Indicador de etapa */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full font-bold text-sm">
                  {stage}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {getStageLabel(stage)}
                </span>
              </div>

              {/* Pokemon de esta etapa */}
              <div className="grid gap-3">
                {(evolutionsByStage[stage] ?? []).map((evo) => {
                  const isCurrentPokemon = evo.id === pokemon.id;
                  
                  return (
                    <div key={evo.id}>
                      {isCurrentPokemon ? (
                        <div className="w-full p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50 cursor-default">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-indigo-400">
                                <Image 
                                  src={`${env.NEXT_PUBLIC_POKE_IMAGE_BASE_URL}${evo.id}.png`} 
                                  alt={evo.name} 
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-contain bg-white"
                                  unoptimized
                                />
                              </div>
                              
                              {/* Indicador de Pokemon actual */}
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center">
                              </div>
                            </div>

                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold capitalize text-indigo-700">
                                  {evo.name}
                                </h3>
                                <span className="px-2 py-1 bg-indigo-500 text-white text-xs rounded-full font-medium">
                                  Actual
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">#{evo.id} • Etapa {evo.stage || 1}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Link 
                          href={`/pokemon/${evo.id}`}
                          className="block w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 hover:shadow-md"
                            scroll={false} // Importante para conservar posicion de scroll
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-16 h-16 rounded-xl overflow-hidden">
                                <Image 
                                  src={`${env.NEXT_PUBLIC_POKE_IMAGE_BASE_URL}${evo.id}.png`} 
                                  alt={evo.name} 
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-contain bg-white"
                                  unoptimized
                                  style={{ 
                                    viewTransitionName: `pokemon-image-${evo.id}`
                                  }}
                                />
                              </div>
                            </div>

                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 
                                  className="font-semibold capitalize text-gray-800"
                                  style={{ 
                                    viewTransitionName: `pokemon-name-${evo.id}`
                                  }}
                                >
                                  {evo.name}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-500">#{evo.id} • Etapa {evo.stage || 1}</p>
                            </div>

                            <div className="text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {stageIndex < stages.length - 1 && (
                <div className="flex justify-center my-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-8 border-t border-gray-300"></div>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <div className="w-8 border-t border-gray-300"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getStageLabel(stage: number): string {
  switch (stage) {
    case 1:
      return 'Forma Base';
    case 2:
      return 'Primera Evolución';
    case 3:
      return 'Evolución Final';
    default:
      return `Etapa ${stage}`;
  }
}
