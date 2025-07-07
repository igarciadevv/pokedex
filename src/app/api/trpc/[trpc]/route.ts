import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import crypto from "crypto";

import { appRouter } from "poke/server/api/root";
import { createTRPCContext } from "poke/server/api/trpc";

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const POKEMON_CACHE_TIME = 24 * 60 * 60; // 24 horas
const DEFAULT_CACHE_TIME = 5 * 60; // 5 minutos

const createCacheHeaders = (maxAge: number) => ({
  'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}, max-age=${maxAge}`,
  'CDN-Cache-Control': `public, s-maxage=${maxAge}`,
  'Vary': 'Accept-Encoding',
});

const generateETag = (content: string): string => {
  return `"${crypto.createHash('md5').update(content).digest('hex')}"`;
};

const isPokemonQuery = (procedures: readonly string[]): boolean => {
  return procedures.some(proc => 
    proc.includes('pokemon.getAll') || 
    proc.includes('pokemon.getById')
  );
};

const handler = async (req: NextRequest) => {
  const requestBody = req.method === 'POST' ? await req.text() : '';
  
  const newRequest = new Request(req.url, {
    method: req.method,
    headers: req.headers,
    body: requestBody || undefined,
  });

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: newRequest,
    router: appRouter,
    createContext: () => createContext(req),
    responseMeta: ({ type, errors, data, paths }) => {
      if (type !== 'query' || errors.length > 0) {
        return {};
      }

      const isPokemon = isPokemonQuery(paths ?? []);
      const cacheTime = isPokemon ? POKEMON_CACHE_TIME : DEFAULT_CACHE_TIME;
      
      const etag = data ? generateETag(JSON.stringify(data)) : undefined;
      
      const headers = {
        ...createCacheHeaders(cacheTime),
        ...(etag && { 'ETag': etag }),
      };

      return {
        status: 200,
        headers,
      };
    },
  });

  if (req.headers.get('if-none-match')) {
    const clientETag = req.headers.get('if-none-match');
    const responseETag = response.headers.get('etag');
    
    if (clientETag === responseETag) {
      return new Response(null, {
        status: 304,
        headers: {
          'Cache-Control': response.headers.get('cache-control') ?? '',
          'ETag': responseETag ?? '',
        },
      });
    }
  }

  return response;
};

export { handler as GET, handler as POST };
