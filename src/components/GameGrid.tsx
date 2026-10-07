import { useState, useMemo } from 'react';
import { ArrowLeft, Users, Trophy, Zap, Crown, Search, Radio, TrendingUp } from 'lucide-react';
import type { SalaKey, GameMeta } from '@/lib/types';
import { GAMES_BY_SALA } from '@/lib/types';

interface GameGridProps {
  sala: SalaKey;
  onBack: () => void;
  onSelectGame: (game: GameMeta) => void;
  matchCounts: Record<string, number>;
}

const SALA_INFO: Record<SalaKey, { title: string; subtitle: string; icon: string }> = {
  gaming: { title: 'Sala Gaming', subtitle: 'eSports & Competitivo', icon: '⚔️' },
  destreza: { title: 'Sala Destreza', subtitle: 'Mente, Trivias & Estrategia', icon: '🧠' },
};

type FilterKey = 'todos' | '1v1' | 'masivos' | 'populares';

const FILTERS: { key: FilterKey; label: string; icon: typeof Zap }[] = [
  { key: 'todos', label: 'Todos', icon: Trophy },
  { key: '1v1', label: '1v1', icon: Zap },
  { key: 'masivos', label: 'Masivos / Torneos', icon: Crown },
  { key: 'populares', label: 'Populares', icon: TrendingUp },
];

export default function GameGrid({ sala, onBack, onSelectGame, matchCounts }: GameGridProps) {
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [search, setSearch] = useState('');
  const info = SALA_INFO[sala];
  const allGames = GAMES_BY_SALA[sala];

  const filtered = useMemo(() => {
    let games = allGames;
    if (filter === '1v1') games = games.filter((g) => !g.es_masiva);
    else if (filter === 'masivos') games = games.filter((g) => g.es_masiva);
    else if (filter === 'populares') games = [...games].sort((a, b) => (matchCounts[b.name] ?? 0) - (matchCounts[a.name] ?? 0));

    if (search) {
      const q = search.toLowerCase();
      games = games.filter((g) => g.name.toLowerCase().includes(q) || g.descripcion.toLowerCase().includes(q));
    }
    return games;
  }, [allGames, filter, search, matchCounts]);

  const totalActive = Object.values(matchCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Volver a Salas
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFC700]/10 border border-[#FFC700]/20 text-2xl">
            {info.icon}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{info.title}</h1>
            <p className="text-sm text-[#FFC700] font-semibold tracking-wide mt-0.5">{info.subtitle}</p>
          </div>
        </div>
        {totalActive > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <Radio size={14} className="text-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400">{totalActive} partidas en vivo</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar juego..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white placeholder-neutral-600 focus:border-[#FFC700]/50 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === f.key
                    ? 'bg-[#FFC700] text-black'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Icon size={13} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((game) => {
          const count = matchCounts[game.name] ?? 0;
          const isLive = count > 0;
          return (
            <button
              key={game.name}
              onClick={() => onSelectGame(game)}
              className="group relative overflow-hidden rounded-2xl border border-neutral-800 hover:border-[#FFC700]/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,199,0,0.12)] hover:scale-[1.02] text-left"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={game.banner}
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-15 group-hover:opacity-25 transition-opacity duration-300`} />

                {isLive && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">En vivo</span>
                  </div>
                )}

                {game.es_masiva && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFC700]/20 backdrop-blur-md border border-[#FFC700]/40">
                    <Crown size={11} className="text-[#FFC700]" />
                    <span className="text-[10px] font-bold text-[#FFC700] uppercase tracking-wide">Masivo</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-black/50 backdrop-blur-md text-lg">
                      {game.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white drop-shadow-lg">{game.name}</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                <p className="text-xs text-neutral-500">{game.descripcion}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {game.es_masiva ? (
                      <>
                        <div className="flex items-center gap-1 text-xs text-neutral-400">
                          <Users size={13} className="text-[#FFC700]" />
                          <span>Cap. {game.max_jugadores}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-neutral-400">
                          <Trophy size={13} className="text-[#FFC700]" />
                          <span>Pozo acumulado</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-neutral-400">
                        <Zap size={13} className="text-[#FFC700]" />
                        <span>1v1 Duelo</span>
                      </div>
                    )}
                  </div>
                  {count > 0 ? (
                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      {count} buscando
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-600">Sin partidas</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={36} className="text-neutral-700" />
          <p className="text-neutral-500 mt-3 text-sm">No se encontraron juegos</p>
        </div>
      )}
    </div>
  );
}
