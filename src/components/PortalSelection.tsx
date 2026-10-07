import { Swords, Brain, ArrowRight, Users, Trophy, Zap } from 'lucide-react';
import type { SalaKey } from '@/lib/types';
import { SALA_GAMING_IMAGE, SALA_DESTREZA_IMAGE } from '@/lib/types';
import HeroCarousel from '@/components/HeroCarousel';

interface PortalSelectionProps {
  onSelectSala: (sala: SalaKey) => void;
}

export default function PortalSelection({ onSelectSala }: PortalSelectionProps) {
  return (
    <div className="space-y-6">
      <HeroCarousel />

      <div className="text-center pt-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Elige tu <span className="text-[#FFC700]">Arena</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Selecciona una sala para comenzar a competir y ganar dinero real
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Sala Gaming - Glassmorphism */}
        <button
          onClick={() => onSelectSala('gaming')}
          className="group relative overflow-hidden rounded-3xl border border-neutral-800 hover:border-[#FFC700]/60 transition-all duration-500 text-left
            hover:shadow-[0_0_30px_rgba(255,199,0,0.15)] hover:scale-[1.01]
            before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#FFC700]/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none"
        >
          <div className="relative h-72 sm:h-80 overflow-hidden">
            <img
              src={SALA_GAMING_IMAGE}
              alt="Sala Gaming"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-[#0F0F12]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFC700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="absolute inset-0 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-500" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:border-[#FFC700]/40 group-hover:bg-[#FFC700]/10 transition-all duration-300">
                <Swords size={24} className="text-[#FFC700]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">SALA GAMING</h2>
                <p className="text-xs text-[#FFC700] font-semibold tracking-wider uppercase">eSports & Competitivo</p>
              </div>
            </div>

            <p className="text-sm text-neutral-400 max-w-md">
              Enfrentamientos 1v1 en los mejores videojuegos competitivos. Fortnite, Valorant,
              Rocket League y mas.
            </p>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Trophy size={14} className="text-[#FFC700]" />
                <span>6 Juegos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Users size={14} className="text-[#FFC700]" />
                <span>1v1 Duelos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Zap size={14} className="text-[#FFC700]" />
                <span>En vivo</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 text-[#FFC700] font-bold text-sm">
              <span>Entrar a la Sala</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </div>
          </div>
        </button>

        {/* Sala Destreza - Glassmorphism */}
        <button
          onClick={() => onSelectSala('destreza')}
          className="group relative overflow-hidden rounded-3xl border border-neutral-800 hover:border-[#FFC700]/60 transition-all duration-500 text-left
            hover:shadow-[0_0_30px_rgba(255,199,0,0.15)] hover:scale-[1.01]
            before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#FFC700]/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none"
        >
          <div className="relative h-72 sm:h-80 overflow-hidden">
            <img
              src={SALA_DESTREZA_IMAGE}
              alt="Sala Destreza"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-[#0F0F12]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFC700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="absolute inset-0 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-500" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:border-[#FFC700]/40 group-hover:bg-[#FFC700]/10 transition-all duration-300">
                <Brain size={24} className="text-[#FFC700]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">SALA DESTREZA</h2>
                <p className="text-xs text-[#FFC700] font-semibold tracking-wider uppercase">Mente, Trivias & Estrategia</p>
              </div>
            </div>

            <p className="text-sm text-neutral-400 max-w-md">
              Desafia tu intelecto: ajedrez, damas, sudoku, trivias masivas y duelos de cartas.
              Hasta 200+ jugadores.
            </p>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Trophy size={14} className="text-[#FFC700]" />
                <span>5 Disciplinas</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Users size={14} className="text-[#FFC700]" />
                <span>1v1 y Masivo</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Zap size={14} className="text-[#FFC700]" />
                <span>200+ Jugadores</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 text-[#FFC700] font-bold text-sm">
              <span>Entrar a la Sala</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
