import { useRef } from 'react';
import { Swords, Brain, ArrowRight, Users, Trophy, Zap, Crown, Radio, Eye, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SalaKey, GameMeta } from '@/lib/types';
import { SALA_GAMING_IMAGE, SALA_DESTREZA_IMAGE } from '@/lib/types';
import TournamentCard from '@/components/TournamentCard';
import LiveStreamWidget from '@/components/LiveStreamWidget';
import LeaderboardWidget from '@/components/LeaderboardWidget';

interface PortalSelectionProps {
  onSelectSala: (sala: SalaKey) => void;
  onSelectGame: (game: GameMeta) => void;
}

const PROMOTED_STREAMS = [
  {
    id: 1,
    streamer: 'ProGamer_CL',
    title: 'FINAL COPA CHILE - Semifinal 1v1',
    viewers: '12,483',
    badge: 'EN VIVO DESTACADO',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&h=150&w=150',
    thumb: 'https://images.pexels.com/photos/7915226/pexels-photo-7915226.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 2,
    streamer: 'PixelWarrior',
    title: 'Subiendo Rango | Desafio Boveda $50 USD',
    viewers: '1,250',
    badge: 'ALGORITMO ORGANICO CL',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&h=150&w=150',
    thumb: 'https://images.pexels.com/photos/9072394/pexels-photo-9072394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 3,
    streamer: 'NeoFighter',
    title: 'Practicando Combos | Torneo Semanal',
    viewers: '840',
    badge: 'NUEVO TALENTO',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&h=150&w=150',
    thumb: 'https://images.pexels.com/photos/18512919/pexels-photo-18512919.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export default function PortalSelection({ onSelectSala, onSelectGame }: PortalSelectionProps) {
  const streamRef = useRef<HTMLDivElement>(null);

  const scrollStreams = (direction: 'left' | 'right') => {
    if (streamRef.current) {
      streamRef.current.scrollBy({
        left: direction === 'left' ? -350 : 350,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* TRIPLE HERO BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-auto lg:h-72">
        {/* Cuadro 1 - Torneo Destacado */}
        <div className="h-64 lg:h-full">
          <TournamentCard />
        </div>

        {/* Cuadro 2 - Live Stream */}
        <div className="h-64 lg:h-full">
          <LiveStreamWidget />
        </div>

        {/* Cuadro 3 - Leaderboard */}
        <div className="h-64 lg:h-full sm:col-span-2 lg:col-span-1">
          <LeaderboardWidget />
        </div>
      </div>

      {/* Section title */}
      <div className="text-center pt-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Elige tu <span className="text-[#FFC700]">Arena</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Selecciona una sala para comenzar a competir y ganar dinero real
        </p>
      </div>

      {/* ARENA 1 - Full Width - Torneos Activos */}
      <button
        onClick={() => onSelectSala('gaming')}
        className="group relative w-full overflow-hidden rounded-3xl border border-[#FFC700]/20 hover:border-[#FFC700]/50 transition-all duration-500 text-left
          hover:shadow-[0_0_40px_rgba(255,199,0,0.15)] hover:scale-[1.005]
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#FFC700]/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none"
      >
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/36899796/pexels-photo-36899796.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Torneos Activos"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0C] via-[#0A0A0C]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center px-6 sm:px-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFC700]/15 backdrop-blur-md border border-[#FFC700]/30 group-hover:border-[#FFC700]/50 group-hover:bg-[#FFC700]/20 transition-all duration-300">
                <Crown size={28} className="text-[#FFC700]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFC700] animate-pulse" />
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">SALA DE TORNEOS ACTIVOS</h2>
                </div>
                <p className="text-xs sm:text-sm text-[#FFC700] font-semibold tracking-wide uppercase">Copas masivas y ligas con pozos acumulados</p>
              </div>
            </div>

            <div className="ml-auto hidden sm:flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Torneos Activos</p>
                <p className="text-2xl font-black text-[#FFC700]">3</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Pozo Total</p>
                <p className="text-lg font-black text-white">$2.2M</p>
              </div>
              <div className="flex items-center gap-2 text-[#FFC700] font-bold text-sm">
                <span>Entrar</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* ARENA 2 & 3 - Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arena 2 - Sala Gaming */}
        <button
          onClick={() => onSelectSala('gaming')}
          className="group relative overflow-hidden rounded-3xl border border-neutral-800 hover:border-[#FFC700]/50 transition-all duration-500 text-left
            hover:shadow-[0_0_30px_rgba(255,199,0,0.12)] hover:scale-[1.01]
            before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#FFC700]/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none"
        >
          <div className="relative h-64 overflow-hidden">
            <img
              src={SALA_GAMING_IMAGE}
              alt="Sala Gaming"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFC700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-500" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:border-[#FFC700]/40 group-hover:bg-[#FFC700]/10 transition-all duration-300">
                <Swords size={22} className="text-[#FFC700]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">SALA GAMING</h2>
                <p className="text-[11px] text-[#FFC700] font-semibold tracking-wider uppercase">eSports & Competitivo</p>
              </div>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm">
              Rocket League, Fortnite, Valorant, EA FC 24 y mas. Duelos 1v1 en vivo.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Trophy size={12} className="text-[#FFC700]" /><span>6 Juegos</span></div>
              <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Zap size={12} className="text-[#FFC700]" /><span>1v1</span></div>
              <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Radio size={12} className="text-[#FFC700]" /><span>En vivo</span></div>
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-[#FFC700] font-bold text-xs">
              <span>Entrar a la Sala</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
            </div>
          </div>
        </button>

        {/* Arena 3 - Sala Destreza */}
        <button
          onClick={() => onSelectSala('destreza')}
          className="group relative overflow-hidden rounded-3xl border border-neutral-800 hover:border-[#FFC700]/50 transition-all duration-500 text-left
            hover:shadow-[0_0_30px_rgba(255,199,0,0.12)] hover:scale-[1.01]
            before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#FFC700]/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none"
        >
          <div className="relative h-64 overflow-hidden">
            <img
              src={SALA_DESTREZA_IMAGE}
              alt="Sala Destreza"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFC700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-500" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:border-[#FFC700]/40 group-hover:bg-[#FFC700]/10 transition-all duration-300">
                <Brain size={22} className="text-[#FFC700]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">SALA DESTREZA</h2>
                <p className="text-[11px] text-[#FFC700] font-semibold tracking-wider uppercase">Mente, Trivias & Estrategia</p>
              </div>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm">
              Ajedrez 3D, Damas, Sudoku, Trivias Masivas y Duelos de Cartas.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Trophy size={12} className="text-[#FFC700]" /><span>5 Disciplinas</span></div>
              <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Users size={12} className="text-[#FFC700]" /><span>1v1 y Masivo</span></div>
              <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Crown size={12} className="text-[#FFC700]" /><span>200+</span></div>
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-[#FFC700] font-bold text-xs">
              <span>Entrar a la Sala</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
            </div>
          </div>
        </button>
      </div>

      {/* SCROLLABLE STREAMS CAROUSEL */}
      <div className="bg-[#141418] border border-[#D4AF37]/30 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              EN VIVO
            </h3>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              El algoritmo de Cash League premia a nuevos talentos
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollStreams('left')}
              className="neon-gold-arrow w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollStreams('right')}
              className="neon-gold-arrow w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={streamRef}
          className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2"
        >
          {PROMOTED_STREAMS.map((s) => (
            <div
              key={s.id}
              className="min-w-[300px] h-64 relative rounded-xl overflow-hidden border border-[#D4AF37]/40 flex flex-col justify-between group shrink-0"
            >
              <img
                src={s.thumb}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-black/40 to-transparent" />

              <div className="relative z-10 flex justify-between items-center p-3">
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                  <Radio size={10} className="animate-pulse" /> EN VIVO
                </span>
                <span className="bg-black/70 text-neutral-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                  <Eye size={10} /> {s.viewers}
                </span>
              </div>

              <div className="relative z-10 space-y-2 p-4">
                <span className="bg-[#FFC700] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                  {s.badge}
                </span>
                <div className="flex items-center gap-2">
                  <img
                    src={s.avatar}
                    alt={s.streamer}
                    className="w-7 h-7 rounded-full border border-[#FFC700] object-cover"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white">{s.streamer}</h5>
                    <p className="text-[10px] text-neutral-300 truncate max-w-[220px]">{s.title}</p>
                  </div>
                </div>
                <button className="green-gold-btn w-full py-2 rounded-lg text-xs uppercase flex items-center justify-center gap-2">
                  <Play size={12} className="fill-black" /> Ver Transmision
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
