import { z } from 'zod';

export const NamedAPIResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),  
  weight: z.number(), 
  types: z.array(z.object({
    type: NamedAPIResourceSchema,
  })),
  stats: z.array(z.object({
    base_stat: z.number(),
    stat: NamedAPIResourceSchema,
  })),
  sprites: z.object({
    other: z.object({
      'official-artwork': z.object({
        front_default: z.string().nullable(),
      }),
    }),
  }),
  species: NamedAPIResourceSchema,
});


export const SpeciesSchema = z.object({
  generation: NamedAPIResourceSchema,
  evolution_chain: z.object({
    url: z.string(),
  }),
  is_legendary: z.boolean(),
  is_mythical: z.boolean(),
});

export interface EvolutionChainLink {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChainLink[];
}

// Esquema recursivo para la cadena de evolución
export const ChainLinkSchema: z.ZodType<EvolutionChainLink> = z.lazy(() => z.object({
  species: NamedAPIResourceSchema,
  evolves_to: z.array(ChainLinkSchema),
}));

// Esquema para la cadena de evolución completa
export const EvolutionChainSchema = z.object({
  chain: ChainLinkSchema,
});

// Esquema para la lista de Pokemon
export const PokemonListSchema = z.object({
  results: z.array(NamedAPIResourceSchema),
});

// Tipos inferidos de los esquemas (para uso interno)
export type PokemonAPIData = z.infer<typeof PokemonSchema>;
export type SpeciesAPIData = z.infer<typeof SpeciesSchema>;
export type EvolutionChainAPIData = z.infer<typeof EvolutionChainSchema>;
export type PokemonListAPIData = z.infer<typeof PokemonListSchema>;

export const GENERATIONS: Record<string, number> = {
  'generation-i': 1,
  'generation-ii': 2,
  'generation-iii': 3,
  'generation-iv': 4,
  'generation-v': 5,
  'generation-vi': 6,
  'generation-vii': 7,
  'generation-viii': 8,
  'generation-ix': 9,
} as const;


