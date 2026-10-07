import { Users, Clock, Coins, Crown, ArrowRight } from 'lucide-react';
import type { Partida } from '@/lib/types';
import { getGameMeta } from '@/lib/types';
import { formatCLP } from '@/lib/types';

interface MatchCardProps {
  partida: Partida;
  onJoin: () => void;
  onEnter: () => void;
  canJoin: boolean;
  isParticipant: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  return `hace ${hours}h ${mins % 60}m`;
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  esperando: { label: 'Esperando', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  en_curso: { label: 'En curso', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  finalizada: { label: 'Finalizada', color: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/30' },
  cancelada: { label: 'Cancelada', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

export default function MatchCard({ partida, onJoin, onEnter, canJoin, isParticipant }: MatchCardProps) {
  const estado = ESTADO_LABELS[partida.estado] ?? ESTADO_LABELS.esperando;
  const meta = getGameMeta(partida.juego);
  const banner = meta?.banner;
  const icon = meta?.icon ?? '🎮';
  const gradient = meta?.color ?? 'from-neutral-700 to-neutral-800';
  const esMasiva = partida.es_masiva;

  return (
    <div className="group relative bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all duration-200 hover:shadow-lg hover:shadow-black/30">
      <div className="relative h-28 overflow-hidden">
        {banner && (
          <img
            src={banner}
            alt={partida.juego}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />

        {esMasiva && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFC700]/20 backdrop-blur-sm border border-[#FFC700]/40">
            <Crown size={11} className="text-[#FFC700]" />
            <span className="text-[10px] font-bold text-[#FFC700] uppercase tracking-wide">Masivo</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex items-center justify-center w-9 h-9 rounded-xl bg-black/50 backdrop-blur-sm text-lg">
          {icon}
        </div>

        <div className="absolute bottom-2.5 left-2.5">
          <h3 className="text-white font-bold text-sm">{partida.juego}</h3>
          <p className="text-[10px] text-neutral-400">{partida.modalidad}</p>
        </div>

        <span className={`absolute bottom-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${estado.color}`}>
          {estado.label}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-[#FFC700]" />
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide">
                {esMasiva ? 'Pozo Acumulado' : 'Pozo Total'}
              </p>
              <p className="text-sm font-bold text-[#FFC700]">{formatCLP(partida.pozo_total)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide">
              {esMasiva ? 'Entrada' : 'Apuesta'}
            </p>
            <p className="text-sm font-semibold text-neutral-300">{formatCLP(partida.monto_apuesta)}</p>
          </div>
        </div>

        {esMasiva && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Users size={14} className="text-[#FFC700]" />
              <span className="font-semibold text-white">{partida.jugadores_actuales}</span>
              <span className="text-neutral-500">/ {partida.max_jugadores} jugadores</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500">
              <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFC700] rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (partida.jugadores_actuales / partida.max_jugadores) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>{partida.creador?.username ?? '???'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{timeAgo(partida.creado_en)}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          {isParticipant ? (
            <button
              onClick={onEnter}
              className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-white font-semibold text-sm hover:bg-neutral-700 transition-colors flex items-center justify-center gap-1.5"
            >
              Entrar a la sala
              <ArrowRight size={15} />
            </button>
          ) : partida.estado === 'esperando' ? (
            <button
              onClick={onJoin}
              disabled={!canJoin}
              className="flex-1 py-2.5 rounded-xl bg-[#FFC700] text-black font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {canJoin ? 'Unirse' : 'Saldo insuficiente'}
            </button>
          ) : (
            <button
              onClick={onEnter}
              className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-400 font-semibold text-sm hover:bg-neutral-700 transition-colors"
            >
              Ver partida
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
