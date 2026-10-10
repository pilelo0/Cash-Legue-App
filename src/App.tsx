import { useState } from 'react';
import { AppProvider, useApp } from '@/lib/store';
import TopNav from '@/components/TopNav';
import Sidebar, { ViewKey } from '@/components/Sidebar';
import Lobby from '@/views/Lobby';
import Matchroom from '@/views/Matchroom';
import MisPartidas from '@/views/MisPartidas';
import Historial from '@/views/Historial';
import Depositos from '@/views/Depositos';
import GamerProfile from '@/views/GamerProfile';
import DepositModal from '@/components/DepositModal';
import BlockyAI from '@/components/BlockyAI';
import { formatUSD } from '@/lib/types';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { loading, currentUser } = useApp();
  const [view, setView] = useState<ViewKey>('lobby');
  const [collapsed, setCollapsed] = useState(false);
  const [activeMatch, setActiveMatch] = useState<string | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);

  const handleNavigate = (v: ViewKey) => {
    setActiveMatch(null);
    setView(v);
  };

  const handleProfileClick = () => {
    setActiveMatch(null);
    setView('perfil');
  };

  const handleEnterMatch = (partidaId: string) => {
    setActiveMatch(partidaId);
  };

  const handleBackFromMatch = () => {
    setActiveMatch(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-[#FFC700] animate-spin" />
        <p className="text-neutral-500 text-sm mt-4">Cargando Cash League...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white">
      <TopNav
        onDepositClick={() => setShowDeposit(true)}
        onProfileClick={handleProfileClick}
        onMenuClick={() => setCollapsed(!collapsed)}
      />
      <div className="flex">
        <Sidebar
          currentView={view}
          onNavigate={handleNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
        <main className={`flex-1 min-w-0 overflow-x-hidden ${view === 'perfil' ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
          {activeMatch ? (
            <Matchroom partidaId={activeMatch} onBack={handleBackFromMatch} />
          ) : view === 'lobby' ? (
            <Lobby onEnterMatch={handleEnterMatch} />
          ) : view === 'mis-partidas' ? (
            <MisPartidas onEnterMatch={handleEnterMatch} />
          ) : view === 'historial' ? (
            <Historial />
          ) : view === 'depositos' ? (
            <Depositos />
          ) : view === 'perfil' ? (
            <GamerProfile />
          ) : null}
        </main>
      </div>

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
      <BlockyAI
        officialStats={{
          globalRank: currentUser
            ? `#${Math.max(100, 2500 - currentUser.wins * 10)}`
            : '#---',
          winRate: currentUser
            ? `${currentUser.wins + currentUser.losses > 0
                ? ((currentUser.wins / (currentUser.wins + currentUser.losses)) * 100).toFixed(1)
                : '0.0'}%`
            : '0.0%',
          totalEarned: formatUSD(currentUser?.balance_usd ?? 0),
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
