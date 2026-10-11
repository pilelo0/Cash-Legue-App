import { useState, useEffect, useCallback, useRef } from 'react';
import { Crown, Swords, Brain, ArrowRight, Users, Trophy, Zap, Radio, Eye, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SalaKey, GameMeta, Torneo } from '@/lib/types';
import { formatCLP } from '@/lib/types';
import LeaderboardWidget from '@/components/LeaderboardWidget';

interface PortalSelectionProps {
  onSelectSala: (sala: SalaKey) => void;
  onSelectGame: (game: GameMeta) => void;
}

const PROMOTED_STREAMS = [
  {
    id: 1,
    streamer: 'ProGamer_CL',
    title: 'FINAL COPA CHILE - Semifinal EA Sports FC',
    viewers: '12,483',
    badge: 'EN VIVO DESTACADO',
    avatar: 'https://images.pexels.com/photos/35240886/pexels-photo-35240886.jpeg?auto=compress&cs=tinysrgb&h=150&w=150',
    thumb: 'https://images.pexels.com/photos/9072293/pexels-photo-9072293.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 2,
    streamer: 'PixelWarrior',
    title: 'Desafio Boveda Valorant 1v1',
    viewers: '1,250',
    badge: 'PROMESAS CL',
    avatar: 'https://images.pexels.com/photos/10408397/pexels-photo-10408397.png?auto=compress&cs=tinysrgb&h=150&w=150',
    thumb: 'https://images.pexels.com/photos/9072373/pexels-photo-9072373.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 3,
    streamer: 'NeoFighter',
    title: 'Torneo Fortnite Modo Cero Construccion',
    viewers: '3,840',
    badge: 'TALENTO EN ASCENSO',
    avatar: 'https://images.pexels.com/photos/14785828/pexels-photo-14785828.jpeg?auto=compress&cs=tinysrgb&h=150&w=150',
    thumb: 'https://images.pexels.com/photos/7915241/pexels-photo-7915241.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 4,
    streamer: 'Grandmaster_Chess',
    title: 'Ajedrez 3D | Retos de Destreza y Apostado',
    viewers: '950',
    badge: 'SALA DESTREZA LIVE',
    avatar: 'https://images.pexels.com/photos/35240848/pexels-photo-35240848.jpeg?auto=compress&cs=tinysrgb&h=150&w=150',
    thumb: 'https://images.pexels.com/photos/4800923/pexels-photo-4800923.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

const TOURNAMENT_BANNER_IMG = 'https://images.pexels.com/photos/14266493/pexels-photo-14266493.jpeg?auto=compress&cs=tinysrgb&h=650&w=1400';
const GAMING_SALA_IMG = 'https://images.pexels.com/photos/9072336/pexels-photo-9072336.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const DESTREZA_SALA_IMG = 'https://images.pexels.com/photos/4800923/pexels-photo-4800923.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function PortalSelection({ onSelectSala }: PortalSelectionProps) {
  const [tournaments, setTournaments] = useState<Torneo[]>([]);
  const streamRef = useRef<HTMLDivElement>(null);

  const loadTournaments = useCallback(async () => {
    const { data } = await supabase
      .from('torneos')
      .select('*')
      .order('creado_en', { ascending: true });
    if (data) setTournaments(data as Torneo[]);
  }, []);

  useEffect(() => {
    loadTournaments();
    const channel = supabase
      .channel('portal_tournaments_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'torneos' }, () => loadTournaments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadTournaments]);

  const totalPozo = tournaments.reduce((sum, t) => sum + (t.pozo || 0), 0);
  const activeCount = tournaments.filter((t) => t.estado === 'abierto').length || 3;

  const scrollLive = (direction: 'left' | 'right') => {
    if (streamRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      streamRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. FULL-WIDTH TOURNAMENT BANNER */}
      <div className="relative bg-gradient-to-r from-[#14141C] via-[#1A1A26] to-[#0A0A0E] border-2 border-[#D4AF37] rounded-2xl p-6 sm:p-8 overflow-hidden group gold-border-glow">
        <img
          src={TOURNAMENT_BANNER_IMG}
          alt="Torneos Activos"
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/85 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFC700]/15 border border-[#FFC700] flex items-center justify-center shadow-[0_0_10px_rgba(255,199,0,0.3)]">
                <Crown size={24} className="text-[#FFC700]" />
              </div>
              <span className="bg-[#FFC700] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                {activeCount} TORNEOS ACTIVOS EN CURSO
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">SALA DE TORNEOS ACTIVOS</h2>
            <p className="text-xs text-[#FFC700] font-bold uppercase tracking-wide">FORTNITE • EA SPORTS FC 24 • VALORANT • ROCKET LEAGUE</p>
            <p className="text-xs text-neutral-300 leading-relaxed">Enfrentate a cientos de jugadores en llaves oficiales verificadas en tiempo real por la IA de Cash League.</p>
          </div>

          <div className="bg-[#070709]/95 border border-[#D4AF37]/60 backdrop-blur-md p-5 rounded-2xl flex flex-col items-end gap-3 min-w-[240px] shadow-2xl">
            <div className="text-right">
              <p className="text-[10px] text-neutral-400 font-bold uppercase">Pozo Total en Juego</p>
              <p className="text-2xl sm:text-3xl font-black text-[#FFC700]">
                {totalPozo > 0 ? formatCLP(totalPozo) : '$2.2M CLP'}
              </p>
            </div>
            <button
              onClick={() => onSelectSala('gaming')}
              className="green-gold-btn w-full py-3 px-6 rounded-xl text-xs uppercase tracking-wider font-black flex items-center justify-center gap-2"
            >
              Entrar a Torneos <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN: SALA GAMING + SALA DESTREZA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SALA GAMING */}
        <button
          onClick={() => onSelectSala('gaming')}
          className="relative bg-[#14141C] border-2 border-[#D4AF37] rounded-2xl p-6 overflow-hidden group gold-border-glow flex flex-col justify-between h-80 text-left"
        >
          <img src={GAMING_SALA_IMG} alt="Sala Gaming" className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent" />

          <div className="relative z-10 flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-[#00E676]/15 border border-[#00E676] flex items-center justify-center shadow-[0_0_10px_rgba(0,230,118,0.3)]">
              <Swords size={24} className="text-[#00E676]" />
            </div>
            <span className="bg-[#00E676] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              SALA 1V1 EN VIVO
            </span>
          </div>

          <div className="relative z-10 space-y-2 mt-auto">
            <h3 className="text-xl sm:text-2xl font-black text-white">SALA GAMING</h3>
            <p className="text-xs text-[#00E676] font-bold uppercase tracking-wider">Fortnite • Rocket League • Valorant • EA FC 24</p>
            <p className="text-xs text-neutral-300">Desafios directos en partidas individuales o por equipos con saldo real garantizado.</p>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-3">
                <span className="flex items-center gap-1"><Trophy size={11} className="text-[#FFC700]" /> 6 Juegos</span>
                <span className="flex items-center gap-1"><Zap size={11} className="text-[#FFC700]" /> 1v1 Directo</span>
              </span>
              <span className="green-gold-btn px-5 py-2.5 rounded-xl text-xs uppercase font-black flex items-center gap-1">
                Entrar <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </button>

        {/* SALA DESTREZA */}
        <button
          onClick={() => onSelectSala('destreza')}
          className="relative bg-[#14141C] border-2 border-[#D4AF37] rounded-2xl p-6 overflow-hidden group gold-border-glow flex flex-col justify-between h-80 text-left"
        >
          <img src={DESTREZA_SALA_IMG} alt="Sala Destreza" className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent" />

          <div className="relative z-10 flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-[#FFC700]/15 border border-[#FFC700] flex items-center justify-center shadow-[0_0_10px_rgba(255,199,0,0.3)]">
              <Brain size={24} className="text-[#FFC700]" />
            </div>
            <span className="bg-[#FFC700] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              SALA DE MENTE
            </span>
          </div>

          <div className="relative z-10 space-y-2 mt-auto">
            <h3 className="text-xl sm:text-2xl font-black text-white">SALA DESTREZA</h3>
            <p className="text-xs text-[#FFC700] font-bold uppercase tracking-wider">Ajedrez 3D • Damas • Sudoku • Trivias</p>
            <p className="text-xs text-neutral-300">Demuestra tu inteligencia tactica en duelos rapidos y torneos masivos de estrategia.</p>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-3">
                <span className="flex items-center gap-1"><Trophy size={11} className="text-[#FFC700]" /> 5 Disciplinas</span>
                <span className="flex items-center gap-1"><Users size={11} className="text-[#FFC700]" /> 200+ Jugadores</span>
              </span>
              <span className="green-gold-btn px-5 py-2.5 rounded-xl text-xs uppercase font-black flex items-center gap-1">
                Entrar <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 3. LIVE STREAM CAROUSEL */}
      <div className="pt-6 border-t border-[#D4AF37]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Radio size={18} className="text-red-500 animate-pulse" /> Transmisiones En Vivo & Creadores
            </h3>
            <p className="text-xs text-neutral-400">Sigue a los jugadores destacados y streamers promocionados por Cash League.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollLive('left')} className="neon-gold-arrow w-9 h-9 rounded-full flex items-center justify-center font-bold" title="Anterior">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollLive('right')} className="neon-gold-arrow w-9 h-9 rounded-full flex items-center justify-center font-bold" title="Siguiente">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div ref={streamRef} className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2">
          {PROMOTED_STREAMS.map((s) => (
            <div
              key={s.id}
              className="min-w-[280px] max-w-[280px] h-72 relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 p-4 flex flex-col justify-between group flex-shrink-0 shadow-xl"
            >
              <img src={s.thumb} alt={s.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-black/40 to-transparent" />

              <div className="relative z-10 flex justify-between items-center">
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                  <Radio size={9} className="animate-pulse" /> EN VIVO
                </span>
                <span className="bg-black/80 text-neutral-200 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md flex items-center gap-1">
                  <Eye size={10} /> {s.viewers}
                </span>
              </div>

              <div className="relative z-10 space-y-2">
                <span className="bg-[#FFC700] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase">
                  {s.badge}
                </span>
                <div className="flex items-center gap-2">
                  <img src={s.avatar} alt={s.streamer} className="w-8 h-8 rounded-full border-2 border-[#FFC700] object-cover" />
                  <div>
                    <h4 className="text-xs font-black text-white">{s.streamer}</h4>
                    <p className="text-[10px] text-neutral-300 line-clamp-1">{s.title}</p>
                  </div>
                </div>
                <button className="green-gold-btn w-full py-2 rounded-xl text-xs uppercase font-black flex items-center justify-center gap-1">
                  <Play size={12} className="fill-black" /> Ver Transmision
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TOP JUGADORES RANKING */}
      <div className="pt-6 border-t border-[#D4AF37]/20">
        <LeaderboardWidget />
      </div>
    </div>
  );
}
