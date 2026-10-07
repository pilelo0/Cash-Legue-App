import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import { formatCLP } from '@/lib/types';

const DEPOSIT_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function Depositos() {
  const { currentUser, refreshUser } = useApp();
  const [mode, setMode] = useState<'deposito' | 'retiro'>('deposito');
  const [amount, setAmount] = useState<number>(DEPOSIT_AMOUNTS[1]);
  const [customAmount, setCustomAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = customAmount ? parseInt(customAmount, 10) : amount;

  const handleSubmit = async () => {
    if (!currentUser || finalAmount <= 0) return;
    if (mode === 'retiro' && finalAmount > currentUser.balance_clp) {
      setError('Saldo insuficiente para retiro');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const newBalance =
        mode === 'deposito'
          ? currentUser.balance_clp + finalAmount
          : currentUser.balance_clp - finalAmount;

      const { error: balErr } = await supabase
        .from('usuarios')
        .update({ balance_clp: newBalance })
        .eq('id', currentUser.id);

      if (balErr) throw balErr;

      const { error: txErr } = await supabase.from('transacciones').insert({
        usuario_id: currentUser.id,
        tipo: mode,
        monto: mode === 'deposito' ? finalAmount : -finalAmount,
        moneda: 'CLP',
        descripcion: mode === 'deposito' ? 'Carga de saldo' : 'Retiro de saldo',
      });

      if (txErr) throw txErr;

      await refreshUser();
      setSuccess(true);
      setCustomAmount('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la transaccion');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="text-neutral-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Depositos / Retiros</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Carga o retira saldo de tu cuenta</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FFC700]/10">
              <Wallet size={18} className="text-[#FFC700]" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Saldo Actual</p>
              <p className="text-xl font-bold text-white">{formatCLP(currentUser.balance_clp)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Record</p>
            <p className="text-sm font-semibold text-white">
              <span className="text-green-400">{currentUser.wins}V</span>
              {' - '}
              <span className="text-red-400">{currentUser.losses}D</span>
            </p>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-neutral-800/50 w-fit">
          <button
            onClick={() => setMode('deposito')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'deposito' ? 'bg-green-500 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft size={16} />
            Cargar
          </button>
          <button
            onClick={() => setMode('retiro')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'retiro' ? 'bg-red-500 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ArrowUpRight size={16} />
            Retirar
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
            Monto {mode === 'deposito' ? 'a cargar' : 'a retirar'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DEPOSIT_AMOUNTS.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setAmount(m);
                  setCustomAmount('');
                }}
                className={`p-2.5 rounded-xl border text-sm font-bold transition-all ${
                  !customAmount && amount === m
                    ? mode === 'deposito'
                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                }`}
              >
                {formatCLP(m)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
            Monto personalizado
          </label>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Ingresa un monto en CLP"
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-800/50 border border-neutral-700 text-sm text-white placeholder-neutral-600 focus:border-[#FFC700]/50 focus:outline-none"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm text-green-400">
            <Check size={16} />
            {mode === 'deposito' ? 'Saldo cargado exitosamente' : 'Retiro procesado exitosamente'}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || finalAmount <= 0}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            mode === 'deposito'
              ? 'bg-green-500 text-black hover:bg-green-400'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {submitting
            ? 'Procesando...'
            : mode === 'deposito'
              ? `Cargar ${formatCLP(finalAmount || 0)}`
              : `Retirar ${formatCLP(finalAmount || 0)}`}
        </button>
      </div>
    </div>
  );
}
