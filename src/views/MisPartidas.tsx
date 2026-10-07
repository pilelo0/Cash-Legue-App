import { useEffect, useState, useCallback } from 'react';
import { Loader2, Gamepad2, Trophy, ArrowRight, Crown, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import type { Partida } from '@/lib/types';
import { getGameMeta, formatCLP } from '@/lib/types';

interface MisPartidasProps {
  onEnterMatch: (partidaId: string) => void;
}

export default function MisPartidas({ onEnterMatch }: MisPartidasProps) {
  const { currentUser } = useApp();
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'activas' | 'finalizadas'>('activas');

  const loadPartidas = useCallback(async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('partidas')
      .select(`
        *,
        creador:usuarios!partidas_creador_id_fkey(*),
        oponente:usuarios!partidas_oponente_id_fkey(*),
        ganador:usuarios!partidas_ganador_id_fkey(*)
      `)
      .or(`creador_id.eq.${currentUser.id},oponente_id.eq.${currentUser.id}`)
      .order('creado_en', { ascending: false });

    if (!error && data) {
      setPartidas(data as unknown as Partida[]);
    }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    loadPartidas();
  }, [loadPartidas]);

  const activas = partidas.filter((p) => p.estado === 'esperando' || p.estado === 'en_curso');
  const finalizadas = partidas.filter((p) => p.estado === 'finalizada' || p.estado === 'cancelada');
  const displayed = tab === 'activas' ? activas : finalizadas;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="text-neutral-600 animate-spin" />
        <p className="text-sm text-neutral-500 mt-3">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Mis Partidas</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{partidas.length} partidas en total</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800 w-fit">
        {(['activas', 'finalizadas'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
              tab === t ? 'bg-[#FFC700] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t} ({t === 'activas' ? activas.length : finalizadas.length})
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Gamepad2 size={40} className="text-neutral-700" />
          <p className="text-neutral-500 mt-3 text-sm">
            No tienes partidas {tab === 'activas' ? 'activas' : 'finalizadas'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((p) => {
            const meta = getGameMeta(p.juego);
            const won = p.ganador_id === currentUser?.id;
            return (
              <button
                key={p.id}
                onClick={() => onEnterMatch(p.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all text-left group overflow-hidden"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  {meta?.banner && (
                    <img src={meta.banner} alt={p.juego} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center text-lg bg-black/40">
                    {meta?.icon ?? '🎮'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm truncate">{p.juego}</h3>
                    {p.es_masiva && (
                      <Crown size={12} className="text-[#FFC700] shrink-0" />
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        p.estado === 'en_curso'
                          ? 'text-green-400 bg-green-400/10'
                          : p.estado === 'esperando'
                            ? 'text-amber-400 bg-amber-400/10'
                            : p.estado === 'finalizada'
                              ? won
                                ? 'text-[#FFC700] bg-[#FFC700]/10'
                                : 'text-neutral-400 bg-neutral-400/10'
                              : 'text-red-400 bg-red-400/10'
                      }`}
                    >
                      {p.estado === 'finalizada' && won ? 'Ganaste' : p.estado === 'finalizada' ? 'Perdiste' : p.estado === 'en_curso' ? 'En curso' : p.estado === 'esperando' ? 'Esperando' : 'Cancelada'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {p.es_masiva ? (
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {p.jugadores_actuales}/{p.max_jugadores} jugadores
                      </span>
                    ) : (
                      <>vs {p.creador_id === currentUser?.id ? p.oponente?.username ?? 'Esperando...' : p.creador?.username ?? '???'}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {p.estado === 'finalizada' && won && (
                    <Trophy size={16} className="text-[#FFC700]" />
                  )}
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Pozo</p>
                    <p className="text-sm font-bold text-[#FFC700]">{formatCLP(p.pozo_total)}</p>
                  </div>
                  <ArrowRight size={16} className="text-neutral-600 group-hover:text-white transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
