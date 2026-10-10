import { useState, useEffect, useCallback } from 'react';
import { Crown, Swords, Brain, ArrowRight, Users, Trophy, Zap, Radio, Eye, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SalaKey, GameMeta, Torneo } from '@/lib/types';
import { SALA_GAMING_IMAGE, SALA_DESTREZA_IMAGE, formatCLP } from '@/lib/types';
import LeaderboardWidget from '@/components/LeaderboardWidget';

interface PortalSelectionProps {
  onSelectSala: (sala: SalaKey) => void;
  onSelectGame: (game: GameMeta) => void;
}

const FALLBACK_TOURNAMENTS: (Torneo & { imagen: string })[] = [
  {
    id: 'fb-1',
    titulo: 'LIGA PREMIER EA SPORTS FC',
    subtitulo: 'Campeonato Temporada 2026 - Division de Honor',
    juego: 'EA Sports FC',
    sala: 'gaming',
    pozo: 750000,
    entrada: 3000,
    max_cupos: 128,
    inscritos: 64,
    estado: 'abierto',
    fecha_inicio: null,
    imagen: 'https://images.pexels.com/photos/40013103/pexels-photo-40013103.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    destacado: true,
    creado_en: new Date().toISOString(),
  },
  {
    id: 'fb-2',
    titulo: 'COPA RELAMPAGO FORTNITE',
    subtitulo: 'Eliminatoria Directa - Arena Modo Cero Construccion',
    juego: 'Fortnite',
    sala: 'gaming',
    pozo: 500000,
    entrada: 2000,
    max_cupos: 256,
    inscritos: 89,
    estado: 'abierto',
    fecha_inicio: null,
    imagen: 'https://images.pexels.com/photos/18512919/pexels-photo-18512919.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    destacado: true,
    creado_en: new Date().toISOString(),
  },
  {
    id: 'fb-3',
    titulo: 'VALORANT MASTERS CASH LEAGUE',
    subtitulo: 'Clasificatorio Regional Latinoamerica',
    juego: 'Valorant',
    sala: 'gaming',
    pozo: 1200000,
    entrada: 5000,
    max_cupos: 64,
    inscritos: 12,
    estado: 'abierto',
    fecha_inicio: null,
    imagen: 'https://images.pexels.com/photos/7915226/pexels-photo-7915226.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    destacado: true,
    creado_en: new Date().toISOString(),
  },
];

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

export default function PortalSelection({ onSelectSala }: PortalSelectionProps) {
  const [tournaments, setTournaments] = useState<(Torneo & { imagen: string })[]>(FALLBACK_TOURNAMENTS);
  const [tournamentIdx, setTournamentIdx] = useState(0);
  const [streamIdx, setStreamIdx] = useState(0);

  const loadTournaments = useCallback(async () => {
    const { data } = await supabase
      .from('torneos')
      .select('*')
      .order('creado_en', { ascending: true })
      .limit(5);
    if (data && data.length > 0) {
      setTournaments(data as (Torneo & { imagen: string })[]);
    }
  }, []);

  useEffect(() => {
    loadTournaments();
    const channel = supabase
      .channel('portal_tournaments_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'torneos' }, () => loadTournaments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadTournaments]);

  const currTournament = tournaments[tournamentIdx] ?? FALLBACK_TOURNAMENTS[0];
  const currStream = PROMOTED_STREAMS[streamIdx];

  const nextTournament = () => setTournamentIdx((p) => (p === tournaments.length - 1 ? 0 : p + 1));
  const prevTournament = () => setTournamentIdx((p) => (p === 0 ? tournaments.length - 1 : p - 1));
  const nextStream = () => setStreamIdx((p) => (p === PROMOTED_STREAMS.length - 1 ? 0 : p + 1));
  const prevStream = () => setStreamIdx((p) => (p === 0 ? PROMOTED_STREAMS.length - 1 : p - 1));

  return (
    <div className="space-y-6">
      {/* TRIPLE HERO: Tournament Card + Live Stream + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. TARJETA DE TORNEO CON FLECHAS FLOTANTES */}
        <div className="relative bg-[#141418] border border-[#D4AF37]/40 rounded-2xl overflow-hidden h-[390px] group shadow-2xl flex flex-col justify-between p-5">
          <img src={currTournament.imagen} alt="Torneo" className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/70 to-transparent" />

          {/* Flechas flotantes */}
          <button onClick={prevTournament} className="overlay-arrow-btn left-3" title="Anterior torneo">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextTournament} className="overlay-arrow-btn right-3" title="Siguiente torneo">
            <ChevronRight size={20} />
          </button>

          <div className="relative z-10 flex justify-between items-center">
            <span className="bg-[#FFC700] text-black text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
              <Crown size={12} /> TORNEO DESTACADO ({tournamentIdx + 1}/{tournaments.length})
            </span>
          </div>

          <div className="relative z-10 space-y-3 mt-auto">
            <h3 className="text-xl font-black text-white leading-tight">{currTournament.titulo}</h3>
            <p className="text-xs text-neutral-400">{currTournament.subtitulo}</p>

            <div className="bg-[#0A0A0C]/90 backdrop-blur-md p-3 rounded-xl border border-[#D4AF37]/30 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-bold">Pozo acumulado</p>
                <p className="text-lg font-black text-[#FFC700]">{formatCLP(currTournament.pozo)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-neutral-400 uppercase font-bold">Entrada</p>
                <p className="text-xs font-extrabold text-white">{formatCLP(currTournament.entrada)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
              <Users size={11} className="text-[#FFC700]" />
              <span>{currTournament.inscritos}/{currTournament.max_cupos} inscritos</span>
              <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FFC700] to-amber-400 rounded-full"
                  style={{ width: `${Math.min(100, (currTournament.inscritos / currTournament.max_cupos) * 100)}%`, boxShadow: '0 0 8px rgba(255,199,0,0.5)' }}
                />
              </div>
            </div>

            <button
              onClick={() => onSelectSala('gaming')}
              className="green-gold-btn w-full py-3 rounded-xl text-xs uppercase tracking-wider"
            >
              Inscribirse Ahora
            </button>
          </div>
        </div>

        {/* 2. TARJETA EN VIVO CON FLECHAS FLOTANTES */}
        <div className="relative bg-[#141418] border border-[#D4AF37]/40 rounded-2xl overflow-hidden h-[390px] group shadow-2xl flex flex-col justify-between p-5">
          <img src={currStream.thumb} alt="Stream" className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/70 to-transparent" />

          <button onClick={prevStream} className="overlay-arrow-btn left-3" title="Anterior transmision">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextStream} className="overlay-arrow-btn right-3" title="Siguiente transmision">
            <ChevronRight size={20} />
          </button>

          <div className="relative z-10 flex justify-between items-center">
            <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded flex items-center gap-1">
              <Radio size={11} className="animate-pulse" /> EN VIVO ({streamIdx + 1}/{PROMOTED_STREAMS.length})
            </span>
            <span className="bg-black/80 backdrop-blur-md text-neutral-300 text-[10px] font-bold px-2 py-1 rounded border border-neutral-700 flex items-center gap-1">
              <Eye size={10} /> {currStream.viewers}
            </span>
          </div>

          <div className="relative z-10 space-y-3 mt-auto">
            <span className="bg-[#FFC700]/20 border border-[#FFC700] text-[#FFC700] text-[9px] font-black px-2 py-0.5 rounded uppercase">
              {currStream.badge}
            </span>
            <div className="flex items-center gap-3">
              <img src={currStream.avatar} alt={currStream.streamer} className="w-8 h-8 rounded-full border-2 border-[#FFC700]" />
              <div>
                <h4 className="text-sm font-black text-white">{currStream.streamer}</h4>
                <p className="text-xs text-neutral-300 line-clamp-1">{currStream.title}</p>
              </div>
            </div>
            <button className="green-gold-btn w-full py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <Play size={14} className="fill-black" /> Ver Transmision
            </button>
          </div>
        </div>

        {/* 3. TOP JUGADORES */}
        <div className="h-[390px]">
          <LeaderboardWidget />
        </div>
      </div>

      {/* SECCION: ELIGE TU ARENA */}
      <section className="pt-10 pb-6 border-t border-[#D4AF37]/20 mt-8">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-block bg-gradient-to-r from-[#FFC700] to-[#D4AF37] p-[1px] rounded-full">
            <span className="bg-[#0A0A0C] text-[#FFC700] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest block">
              COMPETICION EN TIEMPO REAL
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Elige tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC700] via-[#E5C158] to-[#FFC700]">Arena</span>
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 max-w-lg mx-auto">
            Selecciona una sala oficial para comenzar a competir y ganar dinero real con la maxima seguridad.
          </p>
        </div>

        {/* SALAS DE JUEGO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SALA DE TORNEOS ACTIVOS */}
          <button
            onClick={() => onSelectSala('gaming')}
            className="bg-gradient-to-br from-[#141418] to-[#0A0A0C] border-2 border-[#D4AF37] rounded-2xl p-6 sm:p-8 relative overflow-hidden group hover:shadow-[0_0_35px_rgba(212,175,55,0.3)] transition duration-500 text-left"
          >
            <div className="flex justify-between items-start mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#FFC700]/10 border border-[#FFC700] flex items-center justify-center">
                <Crown size={28} className="text-[#FFC700]" />
              </div>
              <span className="bg-[#FFC700] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                3 Torneos Activos
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">SALA DE TORNEOS ACTIVOS</h3>
            <p className="text-xs text-[#FFC700] font-bold mt-1 uppercase tracking-wide">Copas masivas y ligas con pozos acumulados</p>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">Enfrentate a cientos de jugadores en llaves oficiales verificadas por IA.</p>

            <div className="mt-6 flex justify-between items-end border-t border-neutral-800 pt-4">
              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Pozo Total en Juego</p>
                <p className="text-xl sm:text-2xl font-black text-white">$2.2M CLP</p>
              </div>
              <div className="green-gold-btn px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-black flex items-center gap-2">
                Entrar a Torneos <ArrowRight size={14} />
              </div>
            </div>
          </button>

          {/* SALA GAMING */}
          <button
            onClick={() => onSelectSala('gaming')}
            className="bg-gradient-to-br from-[#141418] to-[#0A0A0C] border-2 border-[#D4AF37] rounded-2xl p-6 sm:p-8 relative overflow-hidden group hover:shadow-[0_0_35px_rgba(255,199,0,0.2)] transition duration-500 text-left"
          >
            <div className="flex justify-between items-start mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#FFC700]/10 border border-[#FFC700] flex items-center justify-center">
                <Swords size={28} className="text-[#FFC700]" />
              </div>
              <span className="bg-[#00E676] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Sala 1v1 en Vivo
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">SALA GAMING</h3>
            <p className="text-xs text-[#FFC700] font-bold mt-1 uppercase tracking-wide">eSports & Competitivo</p>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">Rocket League, Fortnite, Valorant, EA FC y mas. Duelos 1v1 en vivo.</p>

            <div className="mt-6 flex justify-between items-end border-t border-neutral-800 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Trophy size={12} className="text-[#FFC700]" /><span>6 Juegos</span></div>
                <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Zap size={12} className="text-[#FFC700]" /><span>1v1</span></div>
              </div>
              <div className="green-gold-btn px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-black flex items-center gap-2">
                Entrar a la Sala <ArrowRight size={14} />
              </div>
            </div>
          </button>
        </div>

        {/* SALA DESTREZA - Full width */}
        <button
          onClick={() => onSelectSala('destreza')}
          className="mt-6 w-full bg-gradient-to-br from-[#141418] to-[#0A0A0C] border-2 border-[#D4AF37] rounded-2xl p-6 sm:p-8 relative overflow-hidden group hover:shadow-[0_0_35px_rgba(212,175,55,0.3)] transition duration-500 text-left"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00E676]/10 border border-[#00E676] flex items-center justify-center shrink-0">
                <Brain size={28} className="text-[#00E676]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">SALA DESTREZA</h3>
                <p className="text-xs text-[#00E676] font-bold mt-1 uppercase tracking-wide">Mente, Trivias & Estrategia</p>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed max-w-md">Ajedrez 3D, Damas, Sudoku, Trivias Masivas y Duelos de Cartas.</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Trophy size={12} className="text-[#FFC700]" /><span>5 Disciplinas</span></div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Users size={12} className="text-[#FFC700]" /><span>1v1 y Masivo</span></div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500"><Crown size={12} className="text-[#FFC700]" /><span>200+</span></div>
                </div>
              </div>
            </div>
            <div className="green-gold-btn px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-black flex items-center gap-2 self-end sm:self-center">
              Entrar a Destreza <ArrowRight size={14} />
            </div>
          </div>
        </button>
      </section>
    </div>
  );
}
