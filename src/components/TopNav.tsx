import { Wallet, User, Plus, Menu } from 'lucide-react';
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
    <header className="sticky top-0 z-40 h-14 bg-[#0F0F12]/95 backdrop-blur-sm border-b border-neutral-800 flex items-center justify-between px-3 sm:px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-neutral-400 hover:text-white transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC700] to-amber-600">
            <span className="text-black font-black text-sm">CL</span>
          </div>
          <span className="hidden sm:block text-white font-bold text-lg tracking-tight">
            Cash<span className="text-[#FFC700]">League</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {currentUser && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/60 border border-neutral-700">
            <Wallet size={16} className="text-[#FFC700]" />
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-white tabular-nums">
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFC700] text-black font-semibold text-sm hover:bg-amber-400 transition-colors"
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
