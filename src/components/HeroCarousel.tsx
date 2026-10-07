import { useState, useEffect, useCallback } from 'react';
import { Trophy, Users, ChevronLeft, ChevronRight, Flame, Crown, Check, Lock, Play, Ticket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import type { Torneo } from '@/lib/types';
import { formatCLP } from '@/lib/types';

const FALLBACK_SLIDES: Torneo[] = [
  {
    id: 'fallback-1',
    titulo: 'COPA CHILE FORTNITE',
    subtitulo: 'Torneo Nacional 1v1 Build Fights',
    juego: 'Fortnite',
    sala: 'gaming',
    pozo: 1000000,
    entrada: 5000,
    max_cupos: 256,
    inscritos: 53,
    estado: 'abierto',
    fecha_inicio: null,
    imagen: 'https://images.pexels.com/photos/18512919/pexels-photo-18512919.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    destacado: true,
    creado_en: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    titulo: 'TORNEO MASIVO TRIVIA',
    subtitulo: 'Quien Quiere Ser Millonario - Edicion Especial',
    juego: 'Cultura General',
    sala: 'destreza',
    pozo: 500000,
    entrada: 2000,
    max_cupos: 200,
    inscritos: 142,
    estado: 'abierto',
    fecha_inicio: null,
    imagen: 'https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    destacado: true,
    creado_en: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    titulo: 'LIGA PREMIER EA SPORTS FC',
    subtitulo: 'Campeonato Temporada 2026 - Division de Honor',
    juego: 'EA Sports FC',
    sala: 'gaming',
    pozo: 750000,
    entrada: 3000,
    max_cupos: 128,
    inscritos: 87,
    estado: 'abierto',
    fecha_inicio: null,
    imagen: 'https://images.pexels.com/photos/40013103/pexels-photo-40013103.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    destacado: true,
    creado_en: new Date().toISOString(),
  },
];

const TAG_ICONS: Record<string, typeof Trophy> = {
  eSports: Flame,
  Masivo: Crown,
  Futbol: Trophy,
};

const TAG_LABELS: Record<string, string> = {
  Fortnite: 'eSports',
  'Cultura General': 'Masivo',
  'EA Sports FC': 'Futbol',
};

function formatDate(fecha: string | null): string | null {
  if (!fecha) return null;
  const d = new Date(fecha);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function HeroCarousel() {
  const { currentUser, refreshUser } = useApp();
  const [torneos, setTorneos] = useState<Torneo[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [registering, setRegistering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTorneos = useCallback(async () => {
    const { data } = await supabase
      .from('torneos')
      .select('*')
      .eq('destacado', true)
      .order('creado_en', { ascending: true });

    if (data && data.length > 0) {
      setTorneos(data as Torneo[]);
    }
  }, []);

  const loadRegistered = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('torneo_participantes')
      .select('torneo_id')
      .eq('usuario_id', currentUser.id);

    if (data) {
      setRegisteredIds(new Set(data.map((r: { torneo_id: string }) => r.torneo_id)));
    }
  }, [currentUser]);

  useEffect(() => {
    loadTorneos();
    loadRegistered();

    const channel = supabase
      .channel('torneos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'torneos' }, () => loadTorneos())
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'torneo_participantes' },
        () => loadRegistered()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTorneos, loadRegistered]);

  const next = useCallback(() => setCurrent((c) => (c + 1) % torneos.length), [torneos.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + torneos.length) % torneos.length), [torneos.length]);

  useEffect(() => {
    if (paused || torneos.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next, torneos.length]);

  const handleRegister = async (torneo: Torneo) => {
    if (!currentUser) return;
    if (registeredIds.has(torneo.id)) return;
    if (torneo.inscritos >= torneo.max_cupos) return;
    if (currentUser.balance_clp < torneo.entrada) {
      setError('Saldo insuficiente para inscribirse');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setRegistering(torneo.id);
    setError(null);

    try {
      const { error: partErr } = await supabase.from('torneo_participantes').insert({
        torneo_id: torneo.id,
        usuario_id: currentUser.id,
      });

      if (partErr) {
        if (partErr.code === '23505') {
          setRegisteredIds((prev) => new Set(prev).add(torneo.id));
          return;
        }
        throw partErr;
      }

      const newInscritos = torneo.inscritos + 1;
      const isFull = newInscritos >= torneo.max_cupos;

      const { error: torneoErr } = await supabase
        .from('torneos')
        .update({
          inscritos: newInscritos,
          estado: isFull ? 'por_iniciar' : torneo.estado,
        })
        .eq('id', torneo.id);

      if (torneoErr) throw torneoErr;

      const { error: txErr } = await supabase.from('transacciones').insert({
        usuario_id: currentUser.id,
        tipo: 'apuesta',
        monto: -torneo.entrada,
        moneda: 'CLP',
        descripcion: `Inscripcion torneo: ${torneo.titulo}`,
      });

      if (txErr) throw txErr;

      const { error: balErr } = await supabase
        .from('usuarios')
        .update({ balance_clp: currentUser.balance_clp - torneo.entrada })
        .eq('id', currentUser.id);

      if (balErr) throw balErr;

      setRegisteredIds((prev) => new Set(prev).add(torneo.id));
      await refreshUser();
    } catch {
      setError('Error al inscribirse. Intenta de nuevo.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setRegistering(null);
    }
  };

  if (torneos.length === 0) return null;

  const slide = torneos[current];
  const tag = TAG_LABELS[slide.juego] ?? 'Torneo';
  const TagIcon = TAG_ICONS[tag] ?? Trophy;
  const isRegistered = registeredIds.has(slide.id);
  const isFull = slide.inscritos >= slide.max_cupos;
  const progressPct = Math.min(100, (slide.inscritos / slide.max_cupos) * 100);
  const fechaStr = formatDate(slide.fecha_inicio);
  const isDbTorneo = !slide.id.startsWith('fallback');

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden mb-8 group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {torneos.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={s.imagen ?? ''}
              alt={s.titulo}
              className={`w-full h-full object-cover ${i === current ? 'scale-105' : 'scale-100'} transition-transform duration-5000`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F12] via-[#0F0F12]/70 to-[#0F0F12]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-transparent" />
          </div>
        ))}

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="px-6 sm:px-10 max-w-xl space-y-3 pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FFC700]/20 backdrop-blur-sm border border-[#FFC700]/30">
                <TagIcon size={16} className="text-[#FFC700]" />
              </div>
              <span className="text-[10px] font-bold text-[#FFC700] uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#FFC700]/10 backdrop-blur-sm border border-[#FFC700]/20">
                {tag}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              {slide.titulo}
            </h2>
            <p className="text-sm text-neutral-300 hidden sm:block">{slide.subtitulo}</p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5">
                <Trophy size={16} className="text-[#FFC700]" />
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Pozo</p>
                  <p className="text-sm font-black text-[#FFC700]">{formatCLP(slide.pozo)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-[#FFC700]" />
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Inscritos</p>
                  <p className="text-sm font-bold text-white">
                    {slide.inscritos}<span className="text-neutral-500">/{slide.max_cupos}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Ticket size={16} className="text-[#FFC700]" />
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Entrada</p>
                  <p className="text-sm font-bold text-white">{formatCLP(slide.entrada)}</p>
                </div>
              </div>
              {fechaStr && (
                <div className="hidden sm:flex items-center gap-1.5">
                  <Play size={16} className="text-[#FFC700]" />
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Inicio</p>
                    <p className="text-sm font-bold text-white">{fechaStr}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-sm pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Cupos</span>
                <span className={`text-[10px] font-bold ${isFull ? 'text-red-400' : 'text-[#FFC700]'}`}>
                  {progressPct.toFixed(0)}% lleno
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFull ? 'bg-red-500' : 'bg-gradient-to-r from-[#FFC700] to-amber-400'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2">
              {error && (
                <p className="text-xs text-red-400 mb-2">{error}</p>
              )}
              {!isDbTorneo ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800/60 backdrop-blur-sm text-sm text-neutral-400 border border-neutral-700">
                  <Trophy size={16} className="text-[#FFC700]" />
                  Torneo destacado
                </div>
              ) : isRegistered ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/20 backdrop-blur-sm text-sm font-bold text-green-400 border border-green-500/40">
                  <Check size={18} />
                  Inscrito - Esperando Inicio
                </div>
              ) : isFull ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800/60 backdrop-blur-sm text-sm font-bold text-neutral-400 border border-neutral-700">
                  <Lock size={16} />
                  Lleno / En Progreso
                </div>
              ) : (
                <button
                  onClick={() => handleRegister(slide)}
                  disabled={registering === slide.id}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFC700] text-black font-bold text-sm hover:bg-amber-400 transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#FFC700]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registering === slide.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Trophy size={18} />
                      Inscribirse al Torneo
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        {torneos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-[#FFC700] hover:text-black transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-[#FFC700] hover:text-black transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {torneos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? 'w-8 bg-[#FFC700]' : 'w-1.5 bg-neutral-600 hover:bg-neutral-400'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
