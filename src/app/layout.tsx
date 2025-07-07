import "poke/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "poke/trpc/react";
import { PokemonListProvider } from "poke/contexts/PokemonListContext";
import Header from "poke/components/Header";
import ErrorBoundary from "poke/components/ErrorBoundary";
import { ViewTransitions } from 'next-view-transitions';

export const metadata: Metadata = {
  title: "PokéDex",
  description: "Explora todos los Pokémon",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html lang="es" className={`${geist.variable}`}>
        <body className="min-h-screen">
          <ErrorBoundary>
            <Header />
            <TRPCReactProvider>
              <PokemonListProvider>
                <main className="container mx-auto px-4 py-6">
                  {children}
                </main>
              </PokemonListProvider>
            </TRPCReactProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ViewTransitions>
  );
}
