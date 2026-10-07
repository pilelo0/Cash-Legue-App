import { Home, Gamepad2, History, Wallet, ChevronLeft, ChevronRight, Trophy, Swords, Brain } from 'lucide-react';

export type ViewKey = 'lobby' | 'mis-partidas' | 'historial' | 'depositos';

interface SidebarProps {
  currentView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS: { key: ViewKey; label: string; icon: typeof Home }[] = [
  { key: 'lobby', label: 'Salas', icon: Home },
  { key: 'mis-partidas', label: 'Mis Partidas', icon: Gamepad2 },
  { key: 'historial', label: 'Historial', icon: History },
  { key: 'depositos', label: 'Depositos / Retiros', icon: Wallet },
];

export default function Sidebar({ currentView, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-60'
      } shrink-0 border-r border-neutral-800 bg-[#0F0F12] transition-all duration-300 flex flex-col sticky top-14 h-[calc(100vh-3.5rem)] z-30`}
    >
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex items-center gap-4 w-full px-3 py-2.5 my-0.5 text-sm font-medium transition-colors ${
                active
                  ? 'text-white bg-neutral-800/60 border-l-2 border-[#FFC700]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/30'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={item.label}
            >
              <Icon size={22} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}

        {!collapsed && (
          <div className="px-3 mt-6 space-y-1">
            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider px-2 mb-2">Salas</p>
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-neutral-500">
              <Swords size={14} className="text-[#FFC700]" />
              <span>Sala Gaming</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-neutral-500">
              <Brain size={14} className="text-[#FFC700]" />
              <span>Sala Destreza</span>
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-neutral-800 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <Trophy size={18} className="text-[#FFC700]" />
            <span className="text-xs font-semibold text-neutral-300">Cash League</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-full p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
          title={collapsed ? 'Expandir' : 'Plegar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
