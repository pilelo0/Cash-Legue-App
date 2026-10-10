import { Wallet, User, Plus, Menu, CreditCard } from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatCLP, formatUSD } from '@/lib/types';

interface TopNavProps {
  onDepositClick: () => void;
  onProfileClick: () => void;
  onMenuClick: () => void;
}

export default function TopNav({ onDepositClick, onProfileClick, onMenuClick }: TopNavProps) {
  const { currentUser, allUsers, switchUser } = useApp();

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#0A0A0C]/95 backdrop-blur-md border-b border-[#D4AF37]/40 flex items-center justify-between px-3 sm:px-4 sm:px-6 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-neutral-400 hover:text-white transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Isotipo 3D "CL" */}
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFC700] via-[#D4AF37] to-[#805F13] p-[2px] shadow-[0_0_15px_rgba(255,199,0,0.35)] group">
          <div className="w-full h-full bg-[#0A0A0C] rounded-[9px] flex items-center justify-center border border-[#FFC700]/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            <span className="text-[#FFC700] font-black text-xl tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              CL
            </span>
          </div>
        </div>

        {/* Nombre y lema */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-lg text-white tracking-wider leading-none">
              CashLeague
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" title="Servidor Activo" />
          </div>
          <p className="text-[8px] text-[#D4AF37] font-extrabold tracking-[0.2em] uppercase mt-0.5 opacity-90">
            JUEGA. COMPITE. PERTENECE.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {currentUser && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141418] border border-[#FFC700]/40 shadow-inner">
            <CreditCard size={16} className="text-[#FFC700]" />
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-white tabular-nums">
                {formatCLP(currentUser.balance_clp)}
              </span>
              <span className="hidden sm:inline text-xs text-neutral-500 tabular-nums">
                {formatUSD(Number(currentUser.balance_usd))}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onDepositClick}
          className="green-gold-btn flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Cargar Saldo</span>
        </button>

        <div className="relative group">
          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-neutral-800/60 transition-colors"
          >
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center">
                <User size={16} className="text-neutral-300" />
              </div>
            )}
            <span className="hidden sm:block text-sm text-neutral-300 max-w-[100px] truncate">
              {currentUser?.username ?? '...'}
            </span>
          </button>

          {allUsers.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 z-50">
              <p className="text-xs text-neutral-500 px-2 py-1.5 font-semibold uppercase tracking-wide">
                Cambiar usuario demo
              </p>
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm transition-colors ${
                    u.id === currentUser?.id
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center text-xs font-bold">
                    {u.username.charAt(0)}
                  </div>
                  <span className="truncate">{u.username}</span>
                  <span className="ml-auto text-xs text-neutral-500">{u.wins}W</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
