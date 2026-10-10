import { useState, useEffect, useCallback } from 'react';
import { X, Users, Trophy, Shield, Upload, Check, Loader2, Gamepad2, KeyRound, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import type { GameMeta, Partida } from '@/lib/types';
import { formatCLP } from '@/lib/types';

interface GameLobbyModalProps {
  game: GameMeta;
  onClose: () => void;
  onEnterMatch: (partidaId: string) => void;
}

type LobbyPhase = 'matchmaking' | 'found' | 'playing' | 'result';

const MONTOS = [2000, 5000, 10000, 20000];

export default function GameLobbyModal({ game, onClose, onEnterMatch }: GameLobbyModalProps) {
  const { currentUser, refreshUser } = useApp();
  const [monto, setMonto] = useState(MONTOS[1]);
  const [phase, setPhase] = useState<LobbyPhase>('matchmaking');
  const [playersIn, setPlayersIn] = useState(1);
  const [createdPartida, setCreatedPartida] = useState<Partida | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [result, setResult] = useState<'ganador' | 'perdedor' | null>(null);
  const [capturaUrl, setCapturaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetPlayers = 2;
  const canAfford = currentUser ? currentUser.balance_clp >= monto : false;

  // Simulate matchmaking progress
  useEffect(() => {
    if (phase !== 'matchmaking') return;
    const timer = setInterval(() => {
      setPlayersIn((p) => {
        if (p >= targetPlayers) {
          clearInterval(timer);
          setPhase('found');
          return p;
        }
        return p + 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [phase]);

  const generateRoomCode = useCallback(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  const handleStartMatch = async () => {
    if (!currentUser || !canAfford) return;
    setSubmitting(true);
    setError(null);

    try {
      const code = generateRoomCode();
      const { data: partida, error: insErr } = await supabase
        .from('partidas')
        .insert({
          creador_id: currentUser.id,
          juego: game.name,
          modalidad: '1v1',
          monto_apuesta: monto,
          pozo_total: monto * 2,
          estado: 'en_curso',
          sala: game.sala,
          max_jugadores: 2,
          jugadores_actuales: 2,
          es_masiva: false,
          iniciado_en: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (insErr) throw insErr;
      setCreatedPartida(partida as unknown as Partida);
      setRoomCode(code);

      await supabase.from('transacciones').insert({
        usuario_id: currentUser.id,
        tipo: 'apuesta',
        monto: -monto,
        moneda: 'CLP',
        partida_id: partida.id,
        descripcion: `Apuesta: ${game.name} 1v1`,
      });

      await supabase.from('usuarios')
        .update({ balance_clp: currentUser.balance_clp - monto })
        .eq('id', currentUser.id);

      await refreshUser();
      setPhase('playing');
    } catch {
      setError('Error al crear la partida');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitResult = async () => {
    if (!result || !createdPartida || !currentUser) return;
    setSubmitting(true);
    try {
      await supabase.from('reportes_resultados').insert({
        partida_id: createdPartida.id,
        usuario_id: currentUser.id,
        resultado: result,
        captura_url: capturaUrl || null,
      });

      if (result === 'ganador') {
        await supabase.from('partidas')
          .update({
            estado: 'finalizada',
            ganador_id: currentUser.id,
            finalizado_en: new Date().toISOString(),
          })
          .eq('id', createdPartida.id);

        await supabase.from('transacciones').insert({
          usuario_id: currentUser.id,
          tipo: 'ganancia',
          monto: createdPartida.pozo_total,
          moneda: 'CLP',
          partida_id: createdPartida.id,
          descripcion: `Ganancia: ${game.name} 1v1`,
        });

        await supabase.from('usuarios')
          .update({
            balance_clp: (currentUser.balance_clp - monto) + createdPartida.pozo_total,
            wins: currentUser.wins + 1,
          })
          .eq('id', currentUser.id);
      } else {
        await supabase.from('usuarios')
          .update({ losses: currentUser.losses + 1 })
          .eq('id', currentUser.id);
      }

      await refreshUser();
      setPhase('result');
    } catch {
      setError('Error al enviar resultado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-neutral-900/90 backdrop-blur-xl border border-[#FFC700]/20 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header with game banner */}
        <div className="relative h-28 overflow-hidden">
          <img src={game.banner} alt={game.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
          <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20`} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-white/80 hover:text-white hover:bg-black/40 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="text-xl">{game.icon}</span>
            <div>
              <h2 className="text-lg font-black text-white drop-shadow-lg">{game.name}</h2>
              <p className="text-[10px] text-neutral-300">Lobby de Coordinacion - 1v1</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Matchmaking phase */}
          {phase === 'matchmaking' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/50 border border-neutral-700">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Monto de Apuesta</span>
                  <div className="flex gap-1.5">
                    {MONTOS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMonto(m)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          monto === m ? 'bg-[#FFC700] text-black' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                        }`}
                      >
                        {formatCLP(m)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFC700]/5 border border-[#FFC700]/20">
                  <span className="text-xs text-neutral-400">Pozo Total</span>
                  <span className="text-lg font-black text-[#FFC700]">{formatCLP(monto * 2)}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-[#FFC700]/30 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-[#FFC700] border-t-transparent animate-spin" />
                  </div>
                  <Gamepad2 size={28} className="text-[#FFC700] absolute inset-0 m-auto" />
                </div>

                <div className="text-center">
                  <p className="text-sm font-bold text-white">Buscando rivales...</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    <span className="text-[#FFC700] font-bold">{playersIn}</span> / {targetPlayers} unidos
                  </p>
                </div>

                <div className="w-full max-w-xs">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {Array.from({ length: targetPlayers }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full transition-all ${
                          i < playersIn ? 'bg-[#FFC700]' : 'bg-neutral-700'
                        }`}
                        style={i < playersIn ? { boxShadow: '0 0 6px rgba(255,199,0,0.4)' } : {}}
                      />
                    ))}
                  </div>
                </div>

                {canAfford ? (
                  <button
                    onClick={handleStartMatch}
                    disabled={playersIn < targetPlayers || submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#FFC700] text-black font-black text-sm hover:bg-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {playersIn < targetPlayers ? 'Esperando jugadores...' : 'Comenzar Partida'}
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                    Saldo insuficiente
                  </div>
                )}
              </div>
            </>
          )}

          {/* Found phase */}
          {phase === 'found' && (
            <div className="flex flex-col items-center py-8 space-y-3">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40">
                <Check size={32} className="text-green-400" />
              </div>
              <p className="text-lg font-bold text-white">Rival encontrado!</p>
              <button
                onClick={handleStartMatch}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#FFC700] text-black font-black text-sm hover:bg-amber-400 transition-all disabled:opacity-50"
              >
                {submitting ? 'Creando partida...' : 'Entrar a la Sala'}
              </button>
            </div>
          )}

          {/* Playing phase */}
          {phase === 'playing' && createdPartida && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-700">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Pozo</p>
                  <p className="text-base font-black text-[#FFC700]">{formatCLP(createdPartida.pozo_total)}</p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-700">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Estado</p>
                  <p className="text-sm font-bold text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> En curso
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700 space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound size={16} className="text-[#FFC700]" />
                  <p className="text-xs font-bold text-white">Codigo de Sala Privada</p>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-neutral-700">
                  <code className="text-lg font-black text-[#FFC700] tracking-widest">{roomCode}</code>
                  <button
                    onClick={() => navigator.clipboard?.writeText(roomCode)}
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500">Comparte este codigo con tu rival para entrar a la sala privada del juego.</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/30 border border-neutral-700/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-[#FFC700]" />
                  <p className="text-xs font-bold text-white">Reglas de Juego</p>
                </div>
                <ul className="text-[11px] text-neutral-400 space-y-1 list-disc list-inside">
                  <li>Partida 1v1 - Sin equipos externos</li>
                  <li>El ganador debe subir captura de pantalla como prueba</li>
                  <li>Prohibido el uso de hacks o cheats</li>
                  <li>Tiempo maximo: 30 minutos por partida</li>
                  <li>En caso de empate, se repite la partida</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Trophy size={14} className="text-[#FFC700]" /> Reportar Resultado
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResult('ganador')}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
                      result === 'ganador' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    <Trophy size={14} className="inline mr-1" /> Gane
                  </button>
                  <button
                    onClick={() => setResult('perdedor')}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
                      result === 'perdedor' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    Perdi
                  </button>
                </div>

                {result && (
                  <>
                    <div className="relative">
                      <Upload size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                      <input
                        type="url"
                        value={capturaUrl}
                        onChange={(e) => setCapturaUrl(e.target.value)}
                        placeholder="URL de captura de pantalla (prueba)"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700 text-xs text-white placeholder-neutral-600 focus:border-[#FFC700]/50 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleSubmitResult}
                      disabled={submitting}
                      className="w-full py-2.5 rounded-xl bg-[#FFC700] text-black font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-40"
                    >
                      {submitting ? 'Enviando...' : 'Confirmar Resultado'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Result phase */}
          {phase === 'result' && (
            <div className="flex flex-col items-center py-10 space-y-3">
              {result === 'ganador' ? (
                <>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FFC700]/20 border border-[#FFC700]/40">
                    <Trophy size={32} className="text-[#FFC700]" />
                  </div>
                  <p className="text-xl font-black text-[#FFC700]">Victoria!</p>
                  <p className="text-sm text-neutral-400">Has ganado {formatCLP(createdPartida?.pozo_total ?? 0)}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-neutral-700/40 border border-neutral-600">
                    <Users size={32} className="text-neutral-400" />
                  </div>
                  <p className="text-xl font-black text-neutral-300">Derrota</p>
                  <p className="text-sm text-neutral-500">Mejor suerte la proxima vez</p>
                </>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-neutral-800 text-white font-bold text-sm hover:bg-neutral-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}

          {error && (
            <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
