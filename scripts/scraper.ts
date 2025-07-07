import { PrismaClient, type Prisma } from '@prisma/client';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import { type z } from 'zod';

import {
  PokemonSchema,
  SpeciesSchema,
  EvolutionChainSchema,
  PokemonListSchema,
  GENERATIONS,
  type EvolutionChainLink,
  type PokemonAPIData,
} from './pokemon.schemas';

const prisma = new PrismaClient();

const CONFIG = {
  CONCURRENCY_LIMIT: parseInt(process.env.SCRAPER_CONCURRENCY ?? '10', 10),
  BATCH_SIZE: parseInt(process.env.SCRAPER_BATCH_SIZE ?? '50', 10),
  POKEMON_LIMIT: parseInt(process.env.SCRAPER_POKEMON_LIMIT ?? '2000', 10),
  REQUEST_DELAY: parseInt(process.env.SCRAPER_REQUEST_DELAY ?? '100', 10),
} as const;

const processedChains = new Map<string, number>();
let nextChainId = 1;

function logProgress(current: number, total: number, label: string): void {
  const percentage = Math.floor((current / total) * 100);
  if (percentage > 0 && percentage % 10 === 0 && current % Math.ceil(total / 10) === 0) {
    console.log(`Progress: ${percentage}% - ${current}/${total} ${label} processed`);
  }
}

async function fetchAPI<T>(url: string, schema: z.ZodSchema<T>): Promise<T> {
  return pRetry(async () => {
    await new Promise(resolve => setTimeout(resolve, CONFIG.REQUEST_DELAY));
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return schema.parse(await response.json());
  }, {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    onFailedAttempt: (error) => console.warn(`Retry ${error.attemptNumber} for ${url}`)
  });
}

function extractStats(stats: PokemonAPIData['stats']): number[] {
  const statMap = {
    'hp': 0, 'attack': 1, 'defense': 2,
    'special-attack': 3, 'special-defense': 4, 'speed': 5
  } as const;
  
  const statsArray: number[] = new Array(6).fill(0) as number[];
  stats.forEach(stat => {
    const index = statMap[stat.stat.name as keyof typeof statMap];
    if (index !== undefined) statsArray[index] = stat.base_stat;
  });
  
  return statsArray;
}

function extractEvolutionPokemon(chain: EvolutionChainLink, stage = 1): Array<{id: number, stage: number}> {
  const result: Array<{id: number, stage: number}> = [];
  const match = /\/pokemon-species\/(\d+)\//.exec(chain.species.url);
  const id = match?.[1] ? parseInt(match[1], 10) : null;
  
  if (id && id > 0) result.push({ id, stage });
  chain.evolves_to.forEach(evolution => result.push(...extractEvolutionPokemon(evolution, stage + 1)));
  
  return result;
}

async function processPokemon(pokemon: { name: string; url: string }): Promise<{pokemon: Prisma.PokemonCreateInput, evolutionUrl: string} | null> {
  try {
    const pokemonData = await fetchAPI(pokemon.url, PokemonSchema);
    const speciesData = await fetchAPI(pokemonData.species.url, SpeciesSchema);
    
    return {
      pokemon: {
        id: pokemonData.id,
        name: pokemonData.name,
        height: pokemonData.height,
        weight: pokemonData.weight,
        generation: GENERATIONS[speciesData.generation.name] ?? 1,
        types: pokemonData.types.map(t => t.type.name),
        isLegendary: speciesData.is_legendary,
        isMythical: speciesData.is_mythical,
        stats: extractStats(pokemonData.stats),
      },
      evolutionUrl: speciesData.evolution_chain.url
    };
  } catch (error) {
    console.error(`Error processing ${pokemon.name}:`, error);
    return null;
  }
}

async function processEvolutionChain(chainUrl: string): Promise<Prisma.EvolutionChainUncheckedCreateInput[]> {
  try {
    if (processedChains.has(chainUrl)) return [];
    
    const evolutionData = await fetchAPI(chainUrl, EvolutionChainSchema);
    const pokemonInChain = extractEvolutionPokemon(evolutionData.chain);
    const currentChainId = nextChainId++;
    
    processedChains.set(chainUrl, currentChainId);
    
    return pokemonInChain.map(pokemon => ({
      chainId: currentChainId,
      pokemonId: pokemon.id,
      stage: pokemon.stage,
      minLevel: null,
    }));
  } catch (error) {
    console.error(`Error processing evolution chain:`, error);
    return [];
  }
}

async function saveBatch<T>(items: T[], batchSize: number, saveFn: (batch: T[]) => Promise<void>): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await saveFn(batch);
  }
}

async function scrapeBasicData(): Promise<Array<{pokemon: Prisma.PokemonCreateInput, evolutionUrl: string}>> {
  const limitConcurrency = pLimit(CONFIG.CONCURRENCY_LIMIT);
  
  console.log('Fetching Pokemon list...');
  const pokemonList = await fetchAPI(
    `https://pokeapi.co/api/v2/pokemon?limit=${CONFIG.POKEMON_LIMIT}`, 
    PokemonListSchema
  );
  
  console.log(`Processing ${pokemonList.results.length} Pokemon...`);
  
  const results = await Promise.allSettled(
    pokemonList.results.map((pokemon, index) => 
      limitConcurrency(async () => {
        const result = await processPokemon(pokemon);
        logProgress(index + 1, pokemonList.results.length, 'Pokemon');
        return result;
      })
    )
  );
  
  const processedResults = results
    .filter((result): result is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof processPokemon>>>> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value);
  
  console.log(`Pokemon processed: ${processedResults.length}/${pokemonList.results.length}`);
  return processedResults;
}

async function savePokemon(pokemonData: Array<{pokemon: Prisma.PokemonCreateInput, evolutionUrl: string}>): Promise<void> {
  console.log('Saving Pokemon to database...');
  
  await saveBatch(
    pokemonData.map(r => r.pokemon),
    CONFIG.BATCH_SIZE,
    async (batch) => {
      await prisma.$transaction(
        batch.map(pokemon => 
          prisma.pokemon.upsert({
            where: { id: pokemon.id },
            update: pokemon,
            create: pokemon,
          })
        )
      );
    }
  );
  
  console.log(`Saved ${pokemonData.length} Pokemon`);
}

async function scrapeEvolutions(evolutionUrls: string[]): Promise<Prisma.EvolutionChainUncheckedCreateInput[]> {
  const limitConcurrency = pLimit(CONFIG.CONCURRENCY_LIMIT);
  const uniqueEvolutionUrls = [...new Set(evolutionUrls)];
  
  console.log(`Processing ${uniqueEvolutionUrls.length} evolution chains...`);
  
  const evolutionResults = await Promise.allSettled(
    uniqueEvolutionUrls.map((url, index) => 
      limitConcurrency(async () => {
        const result = await processEvolutionChain(url);
        logProgress(index + 1, uniqueEvolutionUrls.length, 'evolution chains');
        return result;
      })
    )
  );
  
  const allEvolutions = evolutionResults
    .filter((result): result is PromiseFulfilledResult<Prisma.EvolutionChainUncheckedCreateInput[]> => 
      result.status === 'fulfilled'
    )
    .flatMap(result => result.value);
  
  console.log(`Evolution chains processed: ${allEvolutions.length} records`);
  return allEvolutions;
}

async function saveEvolutions(evolutionData: Prisma.EvolutionChainUncheckedCreateInput[]): Promise<void> {
  if (evolutionData.length === 0) {
    console.log('No evolution data to save');
    return;
  }
  
  console.log('Saving evolution chains to database...');
  
  await saveBatch(
    evolutionData,
    CONFIG.BATCH_SIZE,
    async (batch) => {
      await prisma.$transaction(
        batch.map(evolution => 
          prisma.evolutionChain.upsert({
            where: { pokemonId: evolution.pokemonId },
            update: evolution,
            create: evolution,
          })
        )
      );
    }
  );
  
  console.log(`Saved ${evolutionData.length} evolution records`);
}

export async function scrapePokemon(): Promise<void> {
  try {
    console.log('Starting Pokemon scraping...');
    console.log(`Config: ${CONFIG.CONCURRENCY_LIMIT} concurrency, ${CONFIG.BATCH_SIZE} batch size, ${CONFIG.POKEMON_LIMIT} limit`);
    
    // 1. Scrape datos básicos de Pokemon
    const pokemonData = await scrapeBasicData();
    
    // 2. Guardar Pokemon en DB
    await savePokemon(pokemonData);
    
    // 3. Scrape cadenas de evolución
    const evolutionUrls = pokemonData.map(r => r.evolutionUrl);
    const evolutionData = await scrapeEvolutions(evolutionUrls);
    
    // 4. Guardar evoluciones en DB
    await saveEvolutions(evolutionData);
    
    console.log('Scraping completed successfully!');
    console.log(`Summary: ${pokemonData.length} Pokemon, ${evolutionData.length} evolutions`);
    
  } catch (error) {
    console.error('Critical error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    await scrapePokemon();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

void main();

// Exportar funciones para testing
export { fetchAPI, extractStats, extractEvolutionPokemon };

// Exportar CONFIG para tests
export { CONFIG };
