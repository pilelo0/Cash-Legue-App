import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Send, Upload, Trophy, Users, Coins, Circle, Loader2, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import type { Partida, MensajeChat, ReporteResultado } from '@/lib/types';
import { getGameMeta, formatCLP } from '@/lib/types';

interface MatchroomProps {
  partidaId: string;
  onBack: () => void;
}

const ESTADO_INFO: Record<string, { label: string; color: string; dot: string }> = {
  esperando: { label: 'Esperando oponente', color: 'text-amber-400', dot: 'bg-amber-400' },
  en_curso: { label: 'Partida en curso', color: 'text-green-400', dot: 'bg-green-400 animate-pulse' },
  finalizada: { label: 'Partida finalizada', color: 'text-neutral-400', dot: 'bg-neutral-500' },
  cancelada: { label: 'Partida cancelada', color: 'text-red-400', dot: 'bg-red-500' },
};

export default function Matchroom({ partidaId, onBack }: MatchroomProps) {
  const { currentUser, refreshUser } = useApp();
  const [partida, setPartida] = useState<Partida | null>(null);
  const [messages, setMessages] = useState<MensajeChat[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportResult, setReportResult] = useState<'ganador' | 'perdedor' | null>(null);
  const [capturaUrl, setCapturaUrl] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [existingReport, setExistingReport] = useState<ReporteResultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadPartida = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('partidas')
      .select(`
        *,
        creador:usuarios!partidas_creador_id_fkey(*),
        oponente:usuarios!partidas_oponente_id_fkey(*),
        ganador:usuarios!partidas_ganador_id_fkey(*)
      `)
      .eq('id', partidaId)
      .maybeSingle();

    if (!err && data) setPartida(data as unknown as Partida);
    setLoading(false);
  }, [partidaId]);

  const loadMessages = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('mensajes_chat')
      .select(`*, usuario:usuarios!mensajes_chat_usuario_id_fkey(*)`)
      .eq('partida_id', partidaId)
      .order('creado_en', { ascending: true });

    if (!err && data) setMessages(data as unknown as MensajeChat[]);
  }, [partidaId]);

  const loadExistingReport = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('reportes_resultados')
      .select('*')
      .eq('partida_id', partidaId)
      .eq('usuario_id', currentUser.id)
      .maybeSingle();
    if (data) setExistingReport(data as ReporteResultado);
  }, [partidaId, currentUser]);

  useEffect(() => {
    loadPartida();
    loadMessages();
    loadExistingReport();
  }, [loadPartida, loadMessages, loadExistingReport]);

  useEffect(() => {
    const channel = supabase
      .channel(`matchroom_${partidaId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partidas', filter: `id=eq.${partidaId}` },
        () => loadPartida()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes_chat', filter: `partida_id=eq.${partidaId}` },
        () => loadMessages()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reportes_resultados', filter: `partida_id=eq.${partidaId}` },
        () => loadExistingReport()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partidaId, loadPartida, loadMessages, loadExistingReport]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    const msg = newMessage.trim();
    setNewMessage('');

    const { error: err } = await supabase.from('mensajes_chat').insert({
      partida_id: partidaId,
      usuario_id: currentUser.id,
      contenido: msg,
    });

    if (err) setNewMessage(msg);
  };

  const handleSubmitReport = async () => {
    if (!currentUser || !reportResult || !partida) return;
    setReportSubmitting(true);
    setError(null);

    try {
      const { error: err } = await supabase.from('reportes_resultados').insert({
        partida_id: partidaId,
        usuario_id: currentUser.id,
        resultado: reportResult,
        captura_url: capturaUrl || null,
      });

      if (err) throw err;

      if (reportResult === 'ganador') {
        const { data: allReports } = await supabase
          .from('reportes_resultados')
          .select('*')
          .eq('partida_id', partidaId);

        if (allReports && allReports.length >= 2) {
          const creatorReport = allReports.find(
            (r) => r.usuario_id === partida.creador_id
          );
          const opponentReport = allReports.find(
            (r) => r.usuario_id === partida.oponente_id
          );

          if (creatorReport && opponentReport) {
            let winnerId: string | null = null;

            if (creatorReport.resultado === 'ganador' && opponentReport.resultado === 'perdedor') {
              winnerId = partida.creador_id;
            } else if (opponentReport.resultado === 'ganador' && creatorReport.resultado === 'perdedor') {
              winnerId = partida.oponente_id;
            }

            if (winnerId) {
              const winner =
                winnerId === partida.creador_id ? partida.creador : partida.oponente;

              await supabase
                .from('partidas')
                .update({
                  estado: 'finalizada',
                  ganador_id: winnerId,
                  finalizado_en: new Date().toISOString(),
                })
                .eq('id', partidaId);

              await supabase.from('transacciones').insert({
                usuario_id: winnerId,
                tipo: 'ganancia',
                monto: partida.pozo_total,
                moneda: 'CLP',
                partida_id: partidaId,
                descripcion: `Ganancia: ${partida.juego} 1v1`,
              });

              if (winner) {
                await supabase
                  .from('usuarios')
                  .update({
                    balance_clp: winner.balance_clp + partida.pozo_total,
                    wins: winner.wins + 1,
                  })
                  .eq('id', winnerId);
              }

              const loserId = winnerId === partida.creador_id ? partida.oponente_id : partida.creador_id;
              const loser =
                loserId === partida.creador_id ? partida.creador : partida.oponente;
              if (loser) {
                await supabase
                  .from('usuarios')
                  .update({ losses: loser.losses + 1 })
                  .eq('id', loserId);
              }

              await refreshUser();
              loadPartida();
            }
          }
        }
      }

      loadExistingReport();
      setReportResult(null);
      setCapturaUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar reporte');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="text-neutral-600 animate-spin" />
        <p className="text-sm text-neutral-500 mt-3">Cargando sala...</p>
      </div>
    );
  }

  if (!partida) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-neutral-400">No se encontro la partida</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-lg bg-neutral-800 text-white text-sm hover:bg-neutral-700"
        >
          Volver
        </button>
      </div>
    );
  }

  const isParticipant =
    currentUser && (currentUser.id === partida.creador_id || currentUser.id === partida.oponente_id);
  const estado = ESTADO_INFO[partida.estado] ?? ESTADO_INFO.esperando;
  const meta = getGameMeta(partida.juego);
  const banner = meta?.banner;
  const icon = meta?.icon ?? '🎮';
  const gradient = meta?.color ?? 'from-neutral-700 to-neutral-800';

  return (
    <div className="flex flex-col lg:flex-row gap-5 pb-6">
      <div className="flex-1 space-y-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          {banner && (
            <div className="relative h-32 overflow-hidden">
              <img src={banner} alt={partida.juego} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
              {partida.es_masiva && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFC700]/20 backdrop-blur-sm border border-[#FFC700]/40">
                  <Crown size={12} className="text-[#FFC700]" />
                  <span className="text-[10px] font-bold text-[#FFC700] uppercase tracking-wide">Masivo</span>
                </div>
              )}
            </div>
          )}
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/40 text-2xl overflow-hidden relative">
                  {banner && <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                  <span className="relative z-10">{icon}</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{partida.juego}</h1>
                  <p className="text-sm text-neutral-500">{partida.modalidad} · Matchroom</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Circle size={8} className={estado.dot} fill="currentColor" />
                <span className={`text-xs font-semibold ${estado.color}`}>{estado.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-neutral-800/40 text-center">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">
                  {partida.es_masiva ? 'Pozo Acumulado' : 'Pozo Total'}
                </p>
                <p className="text-base font-bold text-[#FFC700]">{formatCLP(partida.pozo_total)}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-800/40 text-center">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">
                  {partida.es_masiva ? 'Entrada' : 'Apuesta'}
                </p>
                <p className="text-base font-semibold text-white">{formatCLP(partida.monto_apuesta)}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-800/40 text-center">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">
                  {partida.es_masiva ? 'Jugadores' : 'Modalidad'}
                </p>
                <p className="text-base font-semibold text-white">
                  {partida.es_masiva
                    ? `${partida.jugadores_actuales}/${partida.max_jugadores}`
                    : partida.modalidad}
                </p>
              </div>
            </div>

            {partida.es_masiva && (
              <div className="p-3 rounded-xl bg-neutral-800/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-neutral-500">Capacidad de jugadores</span>
                  <span className="text-xs font-bold text-[#FFC700]">
                    {partida.jugadores_actuales} / {partida.max_jugadores}
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFC700] rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (partida.jugadores_actuales / partida.max_jugadores) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {!partida.es_masiva && (
              <div className="flex items-center justify-center gap-4 py-3">
                <PlayerBadge name={partida.creador?.username ?? '???'} isCreator isWinner={partida.ganador_id === partida.creador_id} />
                <div className="flex flex-col items-center">
                  <span className="text-xs text-neutral-600 font-bold">VS</span>
                  <Coins size={16} className="text-[#FFC700] mt-1" />
                </div>
                <PlayerBadge
                  name={partida.oponente?.username ?? 'Esperando...'}
                  isWinner={partida.ganador_id === partida.oponente_id}
                  waiting={!partida.oponente_id}
                />
              </div>
            )}

            {partida.es_masiva && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Users size={18} className="text-[#FFC700]" />
                <span className="text-sm text-neutral-400">
                  Partida masiva - {partida.jugadores_actuales} jugadores unidos
                </span>
              </div>
            )}

            {partida.estado === 'finalizada' && partida.ganador && (
              <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#FFC700]/10 border border-[#FFC700]/30">
                <Trophy size={20} className="text-[#FFC700]" />
                <span className="text-sm font-bold text-[#FFC700]">
                  Ganador: {partida.ganador.username}
                </span>
              </div>
            )}
          </div>
        </div>

        {isParticipant && partida.estado === 'en_curso' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-[#FFC700]" />
              <h2 className="text-sm font-bold text-white">Reportar Resultado</h2>
            </div>

            {existingReport ? (
              <div className="p-4 rounded-xl bg-neutral-800/40 text-center">
                <p className="text-sm text-neutral-300">
                  Ya reportaste tu resultado:{' '}
                  <span className="font-bold text-white">
                    {existingReport.resultado === 'ganador' ? 'Ganador' : 'Perdedor'}
                  </span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Estado: {existingReport.estado}. Esperando confirmacion del oponente.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setReportResult('ganador')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                      reportResult === 'ganador'
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    <Trophy size={18} className="inline mr-1.5" />
                    Ganador
                  </button>
                  <button
                    onClick={() => setReportResult('perdedor')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                      reportResult === 'perdedor'
                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    Perdedor
                  </button>
                </div>

                {reportResult && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                        URL de Captura de Pantalla (opcional)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Upload size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                          <input
                            type="url"
                            value={capturaUrl}
                            onChange={(e) => setCapturaUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-800/50 border border-neutral-700 text-sm text-white placeholder-neutral-600 focus:border-[#FFC700]/50 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleSubmitReport}
                      disabled={reportSubmitting}
                      className="w-full py-3 rounded-xl bg-[#FFC700] text-black font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-40"
                    >
                      {reportSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="lg:w-80 xl:w-96 shrink-0">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col h-[400px] lg:h-[calc(100vh-6rem)] sticky top-20">
          <div className="flex items-center gap-2 p-4 border-b border-neutral-800">
            <Users size={18} className="text-[#FFC700]" />
            <h2 className="text-sm font-bold text-white">Chat de la Sala</h2>
            <span className="ml-auto flex items-center gap-1 text-xs text-neutral-500">
              <Circle size={6} className="text-green-400" fill="currentColor" />
              En vivo
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-neutral-600 py-8">
                Sin mensajes aun. Se el primero en escribir!
              </p>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.usuario_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-[#FFC700]/15 text-[#FFC700] rounded-br-sm'
                          : 'bg-neutral-800 text-neutral-200 rounded-bl-sm'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-[10px] font-bold text-neutral-500 mb-0.5">
                          {msg.usuario?.username ?? '???'}
                        </p>
                      )}
                      <p className="break-words">{msg.contenido}</p>
                    </div>
                    <span className="text-[10px] text-neutral-600 mt-0.5 px-1">
                      {new Date(msg.creado_en).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe un mensaje..."
                disabled={!isParticipant && partida.estado !== 'en_curso'}
                className="flex-1 px-3 py-2.5 rounded-xl bg-neutral-800/50 border border-neutral-700 text-sm text-white placeholder-neutral-600 focus:border-[#FFC700]/50 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || (!isParticipant && partida.estado !== 'en_curso')}
                className="p-2.5 rounded-xl bg-[#FFC700] text-black hover:bg-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerBadge({
  name,
  isCreator,
  isWinner,
  waiting,
}: {
  name: string;
  isCreator?: boolean;
  isWinner?: boolean;
  waiting?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-full font-bold text-lg ${
          waiting
            ? 'bg-neutral-800 text-neutral-600 border-2 border-dashed border-neutral-700'
            : isWinner
              ? 'bg-gradient-to-br from-[#FFC700] to-amber-600 text-black ring-2 ring-[#FFC700]/30'
              : 'bg-gradient-to-br from-neutral-600 to-neutral-800 text-white'
        }`}
      >
        {waiting ? '?' : name.charAt(0).toUpperCase()}
      </div>
      <span className={`text-xs font-semibold ${waiting ? 'text-neutral-600' : 'text-white'}`}>
        {name}
      </span>
      {isCreator && !waiting && (
        <span className="text-[9px] text-[#FFC700] font-bold uppercase tracking-wide">Creador</span>
      )}
    </div>
  );
}
