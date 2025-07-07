import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { Pokemon } from "@prisma/client";

type PokemonWithoutTimestamps = Omit<Pokemon, 'createdAt' | 'updatedAt'>;

// Aqui buscamos devolver todo lo necesario para el listado optimizado en tamaño
export const pokemonRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const allPokemon = await ctx.db.pokemon.findMany({
      orderBy: { id: 'asc' },
    });
    
    const evolutionChains = await ctx.db.evolutionChain.findMany();
    
    const pokemonWithEvolutions = allPokemon.map(poke => {
      const myChain = evolutionChains.find(ec => ec.pokemonId === poke.id);
      
      let evolutionNames: string[] = [];
      
      if (myChain) {
        const sameChainPokemons = evolutionChains
          .filter(ec => ec.chainId === myChain.chainId)
          .map(ec => ec.pokemonId);
        
        evolutionNames = allPokemon
          .filter(p => sameChainPokemons.includes(p.id))
          .map(p => p.name);
      }
       
      const { createdAt, updatedAt, ...pokemonData } = poke;

      // evitar warning
      void createdAt;      void updatedAt;

      return {
        ...pokemonData as PokemonWithoutTimestamps,
        fullEvolutionChain: evolutionNames
      };
    });
    
    return pokemonWithEvolutions;
  }),

  // Aqui devolvemos toda la info de un Pokemon y sus evoluciones, no importa tanto optimizar tamaño al ser menor
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const pokemon = await ctx.db.pokemon.findUnique({
        where: { id: input.id },
        include: { evolutionChain: true },
      });
      
      if (!pokemon) {
        throw new Error("Pokemon no encontrado");
      }
      
      if (!pokemon.evolutionChain) {
        return { 
          ...pokemon, 
          fullEvolutionChain: [] 
        };
      }
      
      const fullChain = await ctx.db.pokemon.findMany({
        where: { evolutionChain: { chainId: pokemon.evolutionChain.chainId } },
        select: {
          id: true,
          name: true,
          evolutionChain: { select: { stage: true } }
        },
        orderBy: { evolutionChain: { stage: 'asc' } },
      });
      
      return {
        ...pokemon,
        fullEvolutionChain: fullChain.map(evo => ({
          id: evo.id,
          name: evo.name,
          stage: evo.evolutionChain?.stage ?? 1
        }))
      };
    }),
});
