import { useEffect, useState, useCallback } from 'react';
import { Loader2, ArrowDownLeft, ArrowUpRight, Coins, Trophy, RotateCcw, History } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import type { Transaccion } from '@/lib/types';
import { formatCLP } from '@/lib/types';

const TIPO_INFO: Record<string, { label: string; icon: typeof Coins; color: string; sign: string }> = {
  deposito: { label: 'Deposito', icon: ArrowDownLeft, color: 'text-green-400', sign: '+' },
  retiro: { label: 'Retiro', icon: ArrowUpRight, color: 'text-red-400', sign: '-' },
  apuesta: { label: 'Apuesta', icon: Coins, color: 'text-amber-400', sign: '-' },
  ganancia: { label: 'Ganancia', icon: Trophy, color: 'text-[#FFC700]', sign: '+' },
  cancelacion: { label: 'Cancelacion', icon: RotateCcw, color: 'text-blue-400', sign: '+' },
};

export default function Historial() {
  const { currentUser } = useApp();
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .eq('usuario_id', currentUser.id)
      .order('creado_en', { ascending: false })
      .limit(100);

    if (!error && data) setTransacciones(data as Transaccion[]);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="text-neutral-600 animate-spin" />
        <p className="text-sm text-neutral-500 mt-3">Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Historial</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{transacciones.length} transacciones</p>
      </div>

      {transacciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <History size={40} className="text-neutral-700" />
          <p className="text-neutral-500 mt-3 text-sm">Sin transacciones aun</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          {transacciones.map((tx, idx) => {
            const info = TIPO_INFO[tx.tipo] ?? TIPO_INFO.apuesta;
            const Icon = info.icon;
            const positive = tx.monto > 0;
            return (
              <div
                key={tx.id}
                className={`flex items-center gap-4 p-4 ${
                  idx !== transacciones.length - 1 ? 'border-b border-neutral-800/50' : ''
                } hover:bg-neutral-800/30 transition-colors`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-800/60 ${info.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{info.label}</p>
                  <p className="text-xs text-neutral-500 truncate">
                    {tx.descripcion ?? 'Sin descripcion'} ·{' '}
                    {new Date(tx.creado_en).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold tabular-nums ${positive ? 'text-green-400' : 'text-red-400'}`}>
                    {positive ? '+' : ''}
                    {formatCLP(tx.monto)}
                  </p>
                  <p className="text-[10px] text-neutral-600">{tx.estado}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
