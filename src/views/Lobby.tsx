import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Search, ArrowLeft, Gamepad2, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import type { Partida, SalaKey, GameMeta } from '@/lib/types';
import { GAMES_BY_SALA, getGameMeta } from '@/lib/types';
import PortalSelection from '@/components/PortalSelection';
import GameGrid from '@/components/GameGrid';
import MatchCard from '@/components/MatchCard';
import CreateMatchModal from '@/components/CreateMatchModal';

interface LobbyProps {
  onEnterMatch: (partidaId: string) => void;
}

type LobbyLevel = 'portals' | 'games' | 'matches';

export default function Lobby({ onEnterMatch }: LobbyProps) {
  const { currentUser, refreshUser } = useApp();
  const [level, setLevel] = useState<LobbyLevel>('portals');
  const [sala, setSala] = useState<SalaKey | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameMeta | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [joining, setJoining] = useState<string | null>(null);
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({});

  const loadPartidas = useCallback(async () => {
    if (!sala) return;
    setLoading(true);
    let query = supabase
      .from('partidas')
      .select(`
        *,
        creador:usuarios!partidas_creador_id_fkey(*),
        oponente:usuarios!partidas_oponente_id_fkey(*),
        ganador:usuarios!partidas_ganador_id_fkey(*)
      `)
      .eq('sala', sala)
      .order('creado_en', { ascending: false });

    if (selectedGame) {
      query = query.eq('juego', selectedGame.name);
    }

    const { data, error } = await query;

    if (!error && data) {
      setPartidas(data as unknown as Partida[]);
    }
    setLoading(false);
  }, [sala, selectedGame]);

  const loadMatchCounts = useCallback(async () => {
    if (!sala) return;
    const { data } = await supabase
      .from('partidas')
      .select('juego')
      .eq('sala', sala)
      .in('estado', ['esperando', 'en_curso']);

    const counts: Record<string, number> = {};
    (data ?? []).forEach((row: { juego: string }) => {
      counts[row.juego] = (counts[row.juego] ?? 0) + 1;
    });
    setMatchCounts(counts);
  }, [sala]);

  useEffect(() => {
    if (level === 'games' || level === 'matches') {
      loadMatchCounts();
    }
  }, [level, loadMatchCounts]);

  useEffect(() => {
    if (level === 'matches') {
      loadPartidas();
    }
  }, [level, loadPartidas]);

  useEffect(() => {
    if (level !== 'matches' || !sala) return;

    const channel = supabase
      .channel('partidas_changes_lobby')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas' }, () => {
        loadPartidas();
        loadMatchCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [level, sala, loadPartidas, loadMatchCounts]);

  const handleSelectSala = (s: SalaKey) => {
    setSala(s);
    setSelectedGame(null);
    setLevel('games');
  };

  const handleSelectGame = (g: GameMeta) => {
    setSelectedGame(g);
    setLevel('matches');
  };

  const handleBackToPortals = () => {
    setLevel('portals');
    setSala(null);
    setSelectedGame(null);
    setPartidas([]);
  };

  const handleBackToGames = () => {
    setLevel('games');
    setSelectedGame(null);
    setPartidas([]);
  };

  const handleJoin = async (partida: Partida) => {
    if (!currentUser || partida.creador_id === currentUser.id) return;
    if (currentUser.balance_clp < partida.monto_apuesta) return;

    setJoining(partida.id);
    try {
      if (partida.es_masiva) {
        const newJugadores = partida.jugadores_actuales + 1;
        const newPozo = partida.monto_apuesta * newJugadores;
        const isFull = newJugadores >= partida.max_jugadores;

        const { error: joinErr } = await supabase
          .from('partidas')
          .update({
            jugadores_actuales: newJugadores,
            pozo_total: newPozo,
            estado: isFull ? 'en_curso' : 'esperando',
            ...(isFull ? { iniciado_en: new Date().toISOString() } : {}),
          })
          .eq('id', partida.id);

        if (joinErr) throw joinErr;
      } else {
        const { error: joinErr } = await supabase
          .from('partidas')
          .update({
            oponente_id: currentUser.id,
            estado: 'en_curso',
            iniciado_en: new Date().toISOString(),
            jugadores_actuales: 2,
          })
          .eq('id', partida.id)
          .eq('estado', 'esperando');

        if (joinErr) throw joinErr;
      }

      await supabase.from('transacciones').insert({
        usuario_id: currentUser.id,
        tipo: 'apuesta',
        monto: -partida.monto_apuesta,
        moneda: 'CLP',
        partida_id: partida.id,
        descripcion: `Apuesta: ${partida.juego} ${partida.es_masiva ? 'Masivo' : '1v1'}`,
      });

      await supabase
        .from('usuarios')
        .update({ balance_clp: currentUser.balance_clp - partida.monto_apuesta })
        .eq('id', currentUser.id);

      await refreshUser();
      onEnterMatch(partida.id);
    } catch {
      // handled silently
    } finally {
      setJoining(null);
    }
  };

  const filtered = partidas.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.juego.toLowerCase().includes(q) &&
        !(p.creador?.username ?? '').toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const showCreateButton = level === 'matches' || (level === 'games' && sala);

  return (
    <div className="relative min-h-full">
      {/* Breadcrumb */}
      {level !== 'portals' && (
        <div className="flex items-center gap-2 mb-5 text-sm">
          <button
            onClick={handleBackToPortals}
            className={`flex items-center gap-1 transition-colors ${
              level === 'games' ? 'text-white font-semibold' : 'text-neutral-500 hover:text-white'
            }`}
          >
            <Home size={14} />
            Salas
          </button>
          {sala && (
            <>
              <span className="text-neutral-700">/</span>
              <button
                onClick={handleBackToGames}
                className={`transition-colors ${
                  level === 'games' ? 'text-neutral-500' : 'text-white font-semibold'
                }`}
              >
                {sala === 'gaming' ? 'Sala Gaming' : 'Sala Destreza'}
              </button>
            </>
          )}
          {selectedGame && (
            <>
              <span className="text-neutral-700">/</span>
              <span className="text-[#FFC700] font-semibold">{selectedGame.name}</span>
            </>
          )}
        </div>
      )}

      {level === 'portals' && <PortalSelection onSelectSala={handleSelectSala} />}

      {level === 'games' && sala && (
        <GameGrid
          sala={sala}
          onBack={handleBackToPortals}
          onSelectGame={handleSelectGame}
          matchCounts={matchCounts}
        />
      )}

      {level === 'matches' && sala && selectedGame && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/40 overflow-hidden">
                <img src={selectedGame.banner} alt={selectedGame.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{selectedGame.name}</h1>
                <p className="text-xs text-neutral-500">{selectedGame.descripcion}</p>
              </div>
            </div>
            <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white placeholder-neutral-600 focus:border-[#FFC700]/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="text-neutral-600 animate-spin" />
              <p className="text-sm text-neutral-500 mt-3">Cargando partidas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Gamepad2 size={40} className="text-neutral-700" />
              <p className="text-neutral-500 mt-3 text-sm">No hay partidas activas de {selectedGame.name}</p>
              <p className="text-neutral-600 text-xs mt-1">Crea una nueva partida para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-24">
              {filtered.map((p) => (
                <div key={p.id} className={joining === p.id ? 'opacity-60' : ''}>
                  <MatchCard
                    partida={p}
                    onJoin={() => handleJoin(p)}
                    onEnter={() => onEnterMatch(p.id)}
                    canJoin={
                      !!currentUser &&
                      currentUser.id !== p.creador_id &&
                      currentUser.balance_clp >= p.monto_apuesta &&
                      (p.es_masiva ? p.jugadores_actuales < p.max_jugadores : !p.oponente_id)
                    }
                    isParticipant={
                      !!currentUser &&
                      (currentUser.id === p.creador_id || currentUser.id === p.oponente_id)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showCreateButton && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#FFC700] text-black font-bold text-sm shadow-lg shadow-[#FFC700]/20 hover:bg-amber-400 hover:scale-105 transition-all"
        >
          <Plus size={22} />
          Crear Partida
        </button>
      )}

      {showCreate && sala && (
        <CreateMatchModal
          sala={sala}
          preselectedGame={selectedGame?.name}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            loadPartidas();
            loadMatchCounts();
          }}
        />
      )}
    </div>
  );
}
