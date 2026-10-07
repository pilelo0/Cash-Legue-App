import { useState } from 'react';
import { X, Trophy, Crown, Users, Coins, Swords, Brain } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import type { SalaKey, GameMeta } from '@/lib/types';
import { GAMES_BY_SALA, MONTOS_1V1, MONTOS_MASIVOS, formatCLP, getGameMeta } from '@/lib/types';

interface CreateMatchModalProps {
  sala: SalaKey;
  preselectedGame?: string;
  onClose: () => void;
  onCreated: () => void;
}

type MatchMode = '1v1' | 'masivo';

export default function CreateMatchModal({ sala, preselectedGame, onClose, onCreated }: CreateMatchModalProps) {
  const { currentUser, refreshUser } = useApp();
  const games = GAMES_BY_SALA[sala];
  const initialGame = preselectedGame
    ? getGameMeta(preselectedGame) ?? games[0]
    : games[0];

  const [juego, setJuego] = useState<GameMeta>(initialGame);
  const [mode, setMode] = useState<MatchMode>(juego.es_masiva ? 'masivo' : '1v1');
  const [monto, setMonto] = useState<number>(juego.es_masiva ? MONTOS_MASIVOS[0] : MONTOS_1V1[1]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esMasiva = mode === 'masivo';
  const montos = esMasiva ? MONTOS_MASIVOS : MONTOS_1V1;
  const maxJugadores = esMasiva ? (juego.max_jugadores ?? 200) : 2;
  const pozoTotal = esMasiva ? monto * maxJugadores : monto * 2;
  const canAfford = currentUser ? currentUser.balance_clp >= monto : false;

  const handleGameSelect = (g: GameMeta) => {
    setJuego(g);
    if (g.es_masiva) {
      setMode('masivo');
      setMonto(MONTOS_MASIVOS[0]);
    } else {
      setMode('1v1');
      setMonto(MONTOS_1V1[1]);
    }
  };

  const handleModeChange = (m: MatchMode) => {
    setMode(m);
    setMonto(m === 'masivo' ? MONTOS_MASIVOS[0] : MONTOS_1V1[1]);
  };

  const handleCreate = async () => {
    if (!currentUser || !canAfford) return;
    setSubmitting(true);
    setError(null);

    try {
      const { data: partida, error: insertError } = await supabase
        .from('partidas')
        .insert({
          creador_id: currentUser.id,
          juego: juego.name,
          modalidad: esMasiva ? 'Masivo' : '1v1',
          monto_apuesta: monto,
          pozo_total: monto * (esMasiva ? 1 : 2),
          estado: 'esperando',
          sala,
          max_jugadores: maxJugadores,
          jugadores_actuales: 1,
          es_masiva: esMasiva,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      const { error: txError } = await supabase.from('transacciones').insert({
        usuario_id: currentUser.id,
        tipo: 'apuesta',
        monto: -monto,
        moneda: 'CLP',
        partida_id: partida.id,
        descripcion: `Apuesta creada: ${juego.name} ${esMasiva ? 'Masivo' : '1v1'}`,
      });

      if (txError) throw txError;

      const { error: balanceError } = await supabase
        .from('usuarios')
        .update({ balance_clp: currentUser.balance_clp - monto })
        .eq('id', currentUser.id);

      if (balanceError) throw balanceError;

      await refreshUser();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la partida');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Banner preview */}
        <div className="relative h-32 overflow-hidden">
          <img src={juego.banner} alt={juego.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
          <div className={`absolute inset-0 bg-gradient-to-br ${juego.color} opacity-20`} />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md text-xl">
              {juego.icon}
            </div>
            <div>
              <h2 className="text-lg font-black text-white drop-shadow-lg">{juego.name}</h2>
              <p className="text-[10px] text-neutral-400">{juego.descripcion}</p>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/60 backdrop-blur-md border border-white/10">
            {sala === 'gaming' ? <Swords size={12} className="text-[#FFC700]" /> : <Brain size={12} className="text-[#FFC700]" />}
            <span className="text-[10px] font-bold text-[#FFC700] uppercase tracking-wide">
              {sala === 'gaming' ? 'Gaming' : 'Destreza'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="absolute bottom-4 right-4 p-1.5 text-neutral-300 hover:text-white hover:bg-black/40 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
              Seleccionar Juego
            </label>
            <div className="grid grid-cols-3 gap-2">
              {games.map((g) => (
                <button
                  key={g.name}
                  onClick={() => handleGameSelect(g)}
                  className={`relative flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                    juego.name === g.name
                      ? `bg-gradient-to-br ${g.color} border-transparent text-white shadow-lg`
                      : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                  }`}
                >
                  {g.es_masiva && (
                    <Crown size={11} className="absolute top-1 right-1 text-[#FFC700]" />
                  )}
                  <span className="text-lg">{g.icon}</span>
                  <span className="text-[9px] font-semibold text-center leading-tight">{g.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode toggle */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
              Tipo de Partida
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleModeChange('1v1')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all border ${
                  mode === '1v1'
                    ? 'bg-[#FFC700]/15 border-[#FFC700]/50 text-[#FFC700]'
                    : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                <Swords size={16} />
                1v1 Estandar
              </button>
              <button
                onClick={() => handleModeChange('masivo')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all border ${
                  mode === 'masivo'
                    ? 'bg-[#FFC700]/15 border-[#FFC700]/50 text-[#FFC700]'
                    : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                <Crown size={16} />
                Evento Masivo
              </button>
            </div>
          </div>

          {esMasiva && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFC700]/5 border border-[#FFC700]/20">
              <Users size={14} className="text-[#FFC700]" />
              <span className="text-xs text-neutral-300">
                Capacidad maxima: <span className="font-bold text-[#FFC700]">{maxJugadores} jugadores</span>
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
              {esMasiva ? 'Costo de Entrada' : 'Monto de Apuesta'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {montos.map((m) => (
                <button
                  key={m}
                  onClick={() => setMonto(m)}
                  className={`p-2.5 rounded-xl border text-sm font-bold transition-all ${
                    monto === m
                      ? 'bg-[#FFC700] text-black border-transparent'
                      : 'bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  {formatCLP(m)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/50">
            <div>
              <p className="text-xs text-neutral-500 flex items-center gap-1">
                <Coins size={12} />
                {esMasiva ? 'Pozo Maximo Acumulado' : 'Pozo Total'}
              </p>
              <p className="text-xl font-bold text-[#FFC700]">{formatCLP(pozoTotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Tu Saldo</p>
              <p className={`text-sm font-semibold ${canAfford ? 'text-white' : 'text-red-400'}`}>
                {formatCLP(currentUser?.balance_clp ?? 0)}
              </p>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={submitting || !canAfford}
            className="w-full py-3 rounded-xl bg-[#FFC700] text-black font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting
              ? 'Creando...'
              : !canAfford
                ? 'Saldo insuficiente'
                : `Crear ${esMasiva ? 'Evento Masivo' : 'Partida 1v1'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
