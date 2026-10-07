import { useState } from 'react';
import { X, ArrowDownLeft, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import { formatCLP } from '@/lib/types';

interface DepositModalProps {
  onClose: () => void;
}

const AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function DepositModal({ onClose }: DepositModalProps) {
  const { currentUser, refreshUser } = useApp();
  const [amount, setAmount] = useState(AMOUNTS[1]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    setError(null);

    try {
      const { error: balErr } = await supabase
        .from('usuarios')
        .update({ balance_clp: currentUser.balance_clp + amount })
        .eq('id', currentUser.id);

      if (balErr) throw balErr;

      const { error: txErr } = await supabase.from('transacciones').insert({
        usuario_id: currentUser.id,
        tipo: 'deposito',
        monto: amount,
        moneda: 'CLP',
        descripcion: 'Carga de saldo rapida',
      });

      if (txErr) throw txErr;

      await refreshUser();
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar saldo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <ArrowDownLeft size={20} className="text-green-400" />
            <h2 className="text-lg font-bold text-white">Cargar Saldo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {success ? (
            <div className="flex flex-col items-center py-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500/20 mb-3">
                <Check size={28} className="text-green-400" />
              </div>
              <p className="text-white font-semibold">Saldo cargado</p>
              <p className="text-sm text-neutral-500 mt-1">{formatCLP(amount)}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {AMOUNTS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setAmount(m)}
                    className={`p-2.5 rounded-xl border text-sm font-bold transition-all ${
                      amount === m
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    {formatCLP(m)}
                  </button>
                ))}
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleDeposit}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-green-500 text-black font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-40"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Procesando...
                  </span>
                ) : (
                  `Cargar ${formatCLP(amount)}`
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
