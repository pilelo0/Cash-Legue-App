import { useState, useEffect, useCallback } from 'react';
import { Trophy, Users, Ticket, Check, Lock, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import type { Torneo } from '@/lib/types';
import { formatCLP } from '@/lib/types';

const FALLBACK: Torneo = {
  id: 'fallback-1',
  titulo: 'COPA CHILE FORTNITE',
  subtitulo: 'Torneo Nacional 1v1 Build Fights',
  juego: 'Fortnite',
  sala: 'gaming',
  pozo: 1000000,
  entrada: 5000,
  max_cupos: 256,
  inscritos: 54,
  estado: 'abierto',
  fecha_inicio: null,
  imagen: 'https://images.pexels.com/photos/18512919/pexels-photo-18512919.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  destacado: true,
  creado_en: new Date().toISOString(),
};

export default function TournamentCard() {
  const { currentUser, refreshUser } = useApp();
  const [torneo, setTorneo] = useState<Torneo>(FALLBACK);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('torneos')
      .select('*')
      .eq('destacado', true)
      .order('creado_en', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (data) setTorneo(data as Torneo);
  }, []);

  const loadRegistered = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('torneo_participantes')
      .select('torneo_id')
      .eq('usuario_id', currentUser.id)
      .eq('torneo_id', torneo.id)
      .maybeSingle();
    if (data) setRegistered(true);
  }, [currentUser, torneo.id]);

  useEffect(() => {
    load();
    loadRegistered();
    const channel = supabase
      .channel('tournament_card_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'torneos' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'torneo_participantes' }, () => loadRegistered())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, loadRegistered]);

  const isFull = torneo.inscritos >= torneo.max_cupos;
  const progressPct = Math.min(100, (torneo.inscritos / torneo.max_cupos) * 100);
  const isDb = !torneo.id.startsWith('fallback');

  const handleRegister = async () => {
    if (!currentUser || registered || isFull || !isDb) return;
    if (currentUser.balance_clp < torneo.entrada) {
      setError('Saldo insuficiente');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setRegistering(true);
    try {
      const { error: pErr } = await supabase.from('torneo_participantes').insert({
        torneo_id: torneo.id, usuario_id: currentUser.id,
      });
      if (pErr) { if (pErr.code === '23505') { setRegistered(true); return; } throw pErr; }

      const newIns = torneo.inscritos + 1;
      await supabase.from('torneos').update({
        inscritos: newIns,
        estado: newIns >= torneo.max_cupos ? 'por_iniciar' : torneo.estado,
      }).eq('id', torneo.id);

      await supabase.from('transacciones').insert({
        usuario_id: currentUser.id, tipo: 'apuesta', monto: -torneo.entrada,
        moneda: 'CLP', descripcion: `Inscripcion: ${torneo.titulo}`,
      });

      await supabase.from('usuarios')
        .update({ balance_clp: currentUser.balance_clp - torneo.entrada })
        .eq('id', currentUser.id);

      setRegistered(true);
      await refreshUser();
    } catch {
      setError('Error al inscribirse');
      setTimeout(() => setError(null), 3000);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="relative h-full rounded-2xl overflow-hidden border border-[#FFC700]/30 hover:border-[#FFC700]/60 transition-all duration-300 group
      shadow-[0_0_20px_rgba(255,199,0,0.08)] hover:shadow-[0_0_30px_rgba(255,199,0,0.2)]">
      <div className="absolute inset-0">
        <img src={torneo.imagen ?? ''} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/70 to-[#0A0A0C]/30" />
      </div>

      <div className="relative h-full flex flex-col justify-between p-4 sm:p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#FFC700]/20 backdrop-blur-sm border border-[#FFC700]/30">
              <Flame size={14} className="text-[#FFC700]" />
            </div>
            <span className="text-[9px] font-bold text-[#FFC700] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#FFC700]/10 backdrop-blur-sm border border-[#FFC700]/20">
              Torneo Destacado
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            {torneo.titulo}
          </h2>
          <p className="text-[11px] text-neutral-400 hidden sm:block">{torneo.subtitulo}</p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Trophy size={14} className="text-[#FFC700]" />
              <span className="text-sm font-black text-[#FFC700]">{formatCLP(torneo.pozo)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ticket size={14} className="text-[#FFC700]" />
              <span className="text-xs font-bold text-white">{formatCLP(torneo.entrada)}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Users size={11} /> {torneo.inscritos}/{torneo.max_cupos} Inscritos
              </span>
              <span className={`text-[10px] font-bold ${isFull ? 'text-red-400' : 'text-[#FFC700]'}`}>
                {progressPct.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-800/60 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull ? 'bg-red-500' : 'bg-gradient-to-r from-[#FFC700] to-amber-400'
                }`}
                style={{ width: `${progressPct}%`, boxShadow: '0 0 8px rgba(255,199,0,0.5)' }}
              />
            </div>
          </div>

          {error && <p className="text-[10px] text-red-400">{error}</p>}

          <div>
            {!isDb ? (
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-neutral-800/60 backdrop-blur-sm text-xs text-neutral-400 border border-neutral-700">
                <Trophy size={14} className="text-[#FFC700]" /> Torneo destacado
              </div>
            ) : registered ? (
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 backdrop-blur-sm text-xs font-bold text-green-400 border border-green-500/40">
                <Check size={16} /> Inscrito - Esperando Inicio
              </div>
            ) : isFull ? (
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-neutral-800/60 backdrop-blur-sm text-xs font-bold text-neutral-400 border border-neutral-700">
                <Lock size={14} /> Lleno / En Progreso
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFC700] text-black font-black text-sm hover:bg-amber-400 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#FFC700]/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registering ? (
                  <><div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Procesando...</>
                ) : (
                  <><Trophy size={16} /> Inscribirse al Torneo</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
