import { useState, useEffect, useCallback } from 'react';
import { X, Trophy, Clock, RotateCcw, Flag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import type { GameMeta } from '@/lib/types';
import { formatCLP } from '@/lib/types';

interface ChessBoardModalProps {
  game: GameMeta;
  onClose: () => void;
}

type Phase = 'waiting' | 'playing' | 'result';
type Piece = 'wK' | 'wQ' | 'wR' | 'wB' | 'wN' | 'wP' | 'bK' | 'bQ' | 'bR' | 'bB' | 'bN' | 'bP' | null;
type Board = Piece[][];

const INITIAL_BOARD: Board = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR'],
];

const PIECE_ICONS: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

const MONTOS = [2000, 5000, 10000];

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function ChessBoardModal({ game, onClose }: ChessBoardModalProps) {
  const { currentUser, refreshUser } = useApp();
  const [monto, setMonto] = useState(MONTOS[0]);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [result, setResult] = useState<'ganador' | 'perdedor' | null>(null);

  const canAfford = currentUser ? currentUser.balance_clp >= monto : false;

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((t) => {
          if (t <= 1) { setResult('perdedor'); setPhase('result'); return 0; }
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) { setResult('ganador'); setPhase('result'); return 0; }
          return t - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, turn]);

  const handleStart = async () => {
    if (!currentUser || !canAfford) return;

    try {
      const { data: partida, error: insErr } = await supabase
        .from('partidas')
        .insert({
          creador_id: currentUser.id,
          juego: game.name,
          modalidad: '1v1',
          monto_apuesta: monto,
          pozo_total: monto * 2,
          estado: 'en_curso',
          sala: 'destreza',
          max_jugadores: 2,
          jugadores_actuales: 2,
          es_masiva: false,
          iniciado_en: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (insErr) throw insErr;

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
      // handled silently
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    if (phase !== 'playing') return;
    const piece = board[row][col];

    if (selected) {
      const [sr, sc] = selected;
      if (sr === row && sc === col) { setSelected(null); return; }

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = newBoard[sr][sc];
      newBoard[sr][sc] = null;
      setBoard(newBoard);
      setSelected(null);
      setTurn(turn === 'w' ? 'b' : 'w');
    } else if (piece) {
      const isWhite = piece.startsWith('w');
      if ((turn === 'w') === isWhite) {
        setSelected([row, col]);
      }
    }
  };

  const handleSurrender = () => {
    setResult('perdedor');
    setPhase('result');
  };

  const handleWin = async () => {
    if (!currentUser) return;
    setResult('ganador');
    setPhase('result');

    await supabase.from('usuarios')
      .update({ wins: currentUser.wins + 1, balance_clp: currentUser.balance_clp + monto })
      .eq('id', currentUser.id);
    await refreshUser();
  };

  const handleReset = () => {
    setBoard(INITIAL_BOARD);
    setSelected(null);
    setTurn('w');
    setWhiteTime(600);
    setBlackTime(600);
    setResult(null);
    setPhase('waiting');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-neutral-900/90 backdrop-blur-xl border border-[#FFC700]/20 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="relative h-20 overflow-hidden">
          <img src={game.banner} alt={game.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
          <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20`} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-white/80 hover:text-white hover:bg-black/40 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-2 left-4 flex items-center gap-2">
            <span className="text-lg">{game.icon}</span>
            <h2 className="text-base font-black text-white drop-shadow-lg">{game.name}</h2>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {phase === 'waiting' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/50 border border-neutral-700">
                  <span className="text-xs font-semibold text-neutral-400 uppercase">Apuesta</span>
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

              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-800/30 border border-neutral-700/50">
                <Clock size={20} className="text-[#FFC700]" />
                <div>
                  <p className="text-xs font-bold text-white">Reloj de Partida</p>
                  <p className="text-[11px] text-neutral-500">10 minutos por jugador</p>
                </div>
              </div>

              {canAfford ? (
                <button
                  onClick={handleStart}
                  className="w-full py-3 rounded-xl bg-[#FFC700] text-black font-black text-sm hover:bg-amber-400 transition-all hover:scale-[1.01]"
                >
                  Iniciar Partida 1v1
                </button>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 text-center">
                  Saldo insuficiente
                </div>
              )}
            </>
          )}

          {phase === 'playing' && (
            <>
              {/* Black timer (opponent) */}
              <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                turn === 'b' ? 'bg-neutral-800 border-[#FFC700]/30' : 'bg-neutral-900/50 border-neutral-800'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-xs font-bold text-white">R</div>
                  <span className="text-xs font-bold text-white">Rival</span>
                </div>
                <div className={`flex items-center gap-1.5 ${turn === 'b' ? 'text-[#FFC700]' : 'text-neutral-500'}`}>
                  <Clock size={14} />
                  <span className="text-sm font-black tabular-nums">{formatTime(blackTime)}</span>
                </div>
              </div>

              {/* Board */}
              <div className="relative mx-auto" style={{ perspective: '600px' }}>
                <div
                  className="grid grid-cols-8 gap-0 rounded-lg overflow-hidden border-2 border-neutral-700"
                  style={{ transform: 'rotateX(8deg)', transformStyle: 'preserve-3d' }}
                >
                  {board.map((row, r) =>
                    row.map((piece, c) => {
                      const isLight = (r + c) % 2 === 0;
                      const isSelected = selected && selected[0] === r && selected[1] === c;
                      return (
                        <button
                          key={`${r}-${c}`}
                          onClick={() => handleSquareClick(r, c)}
                          className={`relative aspect-square flex items-center justify-center text-2xl transition-all ${
                            isLight ? 'bg-neutral-200' : 'bg-neutral-500'
                          } ${isSelected ? 'ring-2 ring-[#FFC700] ring-inset' : ''} hover:brightness-110`}
                        >
                          {piece && (
                            <span
                              className={`leading-none ${
                                piece.startsWith('w') ? 'text-white drop-shadow-md' : 'text-neutral-900'
                              }`}
                              style={{ textShadow: piece.startsWith('b') ? '0 0 2px rgba(255,255,255,0.3)' : '0 0 2px rgba(0,0,0,0.5)' }}
                            >
                              {PIECE_ICONS[piece]}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-b from-neutral-700/40 to-transparent rounded-b-lg" />
              </div>

              {/* White timer (you) */}
              <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                turn === 'w' ? 'bg-neutral-800 border-[#FFC700]/30' : 'bg-neutral-900/50 border-neutral-800'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FFC700] to-amber-700 flex items-center justify-center text-xs font-bold text-black">
                    {currentUser?.username.charAt(0) ?? 'P'}
                  </div>
                  <span className="text-xs font-bold text-white">{currentUser?.username ?? 'Tu'}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${turn === 'w' ? 'text-[#FFC700]' : 'text-neutral-500'}`}>
                  <Clock size={14} />
                  <span className="text-sm font-black tabular-nums">{formatTime(whiteTime)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleWin}
                  className="flex-1 py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-bold text-xs hover:bg-green-500/30 transition-all"
                >
                  <Trophy size={14} className="inline mr-1" /> Declarar Victoria
                </button>
                <button
                  onClick={handleSurrender}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-xs hover:bg-red-500/30 transition-all"
                >
                  <Flag size={14} className="inline mr-1" /> Rendirse
                </button>
              </div>
            </>
          )}

          {phase === 'result' && (
            <div className="flex flex-col items-center py-8 space-y-3">
              {result === 'ganador' ? (
                <>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FFC700]/20 border border-[#FFC700]/40">
                    <Trophy size={32} className="text-[#FFC700]" />
                  </div>
                  <p className="text-xl font-black text-[#FFC700]">Victoria!</p>
                  <p className="text-sm text-neutral-400">Has ganado {formatCLP(monto * 2)}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-neutral-700/40 border border-neutral-600">
                    <Flag size={32} className="text-neutral-400" />
                  </div>
                  <p className="text-xl font-black text-neutral-300">Derrota</p>
                  <p className="text-sm text-neutral-500">Mejor suerte la proxima</p>
                </>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-white font-bold text-sm hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Revancha
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-white font-bold text-sm hover:bg-neutral-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
