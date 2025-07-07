import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock environment variables
process.env.NEXT_PUBLIC_POKE_IMAGE_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'

// Types for mocks
interface MockLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
  [key: string]: unknown;
}

interface MockImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  unoptimized?: boolean;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

interface MockViewTransitionsProps {
  children: React.ReactNode;
}

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock next-view-transitions
vi.mock('next-view-transitions', () => ({
  Link: ({ href, children, scroll, ...props }: MockLinkProps) => {
    // Filtrar scroll que no es válido en elementos <a>
    const filteredProps = { ...props }
    delete filteredProps.scroll

    void scroll;
    return React.createElement('a', { href, ...filteredProps }, children)
  },
  ViewTransitions: ({ children }: MockViewTransitionsProps) => children,
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, priority, unoptimized, ...props }: MockImageProps) => {
    // Filtrar atributos específicos de Next.js que no son HTML válidos
    const filteredProps = { ...props }
    delete filteredProps.priority
    delete filteredProps.unoptimized

    void priority;
    void unoptimized;
    
    return React.createElement('img', { 
      src, 
      alt, 
      ...filteredProps 
    })
  },
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
})

// Mock para fetch global (útil para tests del scraper)
global.fetch = vi.fn()
