import { memo } from "react";
import type { Pokemon } from "@prisma/client";

interface StatsDisplayProps {
  pokemon: Pokemon;
}

interface Stat {
  name: string;
  value: number | undefined;
  color: string;
  bgColor: string;
  icon: string;
  shortName: string;
}

const StatsDisplay = memo<StatsDisplayProps>(({ pokemon }) => {
  const stats: Stat[] = [
    {
      name: "Puntos de Vida",
      shortName: "HP",
      value: pokemon.stats[0],
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: "❤️"
    },
    {
      name: "Ataque",
      shortName: "ATK",
      value: pokemon.stats[1],
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      icon: "⚔️"
    },
    {
      name: "Defensa", 
      shortName: "DEF",
      value: pokemon.stats[2],
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      icon: "🛡️"
    },
    {
      name: "Ataque Especial",
      shortName: "SP.ATK",
      value: pokemon.stats[3],
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      icon: "✨"
    },
    {
      name: "Defensa Especial",
      shortName: "SP.DEF", 
      value: pokemon.stats[4],
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      icon: "💎"
    },
    {
      name: "Velocidad",
      shortName: "SPD",
      value: pokemon.stats[5],
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      icon: "⚡"
    }
  ];

  // Calcular el total y el máximo valor para comparaciones relativas
  const maxStatValue = Math.max(...stats.map(stat => stat.value ?? 0));
  const totalStats = stats.reduce((sum, stat) => sum + (stat.value ?? 0), 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Estadísticas Base</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => {
            return (
              <div key={stat.shortName} className="group">
                <div className={`${stat.bgColor} rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="font-medium text-gray-700 text-sm">{stat.shortName}</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                      {stat.value ?? 0}
                    </div>
                    <div className="text-xs text-gray-500">{stat.name}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen estadístico */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Resumen del Pokémon</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{totalStats}</div>
              <div className="text-xs text-gray-500">Total Base</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{maxStatValue}</div>
              <div className="text-xs text-gray-500">Stat Máximo</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Math.round(totalStats / 6)}</div>
              <div className="text-xs text-gray-500">Promedio</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.findIndex(s => s.value === maxStatValue) !== -1 ? stats[stats.findIndex(s => s.value === maxStatValue)]?.shortName : 'N/A'}
              </div>
              <div className="text-xs text-gray-500">Fortaleza</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

StatsDisplay.displayName = 'StatsDisplay';
export default StatsDisplay;
