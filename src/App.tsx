import { useState } from 'react';
import { AppProvider, useApp } from '@/lib/store';
import TopNav from '@/components/TopNav';
import Sidebar, { ViewKey } from '@/components/Sidebar';
import Lobby from '@/views/Lobby';
import Matchroom from '@/views/Matchroom';
import MisPartidas from '@/views/MisPartidas';
import Historial from '@/views/Historial';
import Depositos from '@/views/Depositos';
import DepositModal from '@/components/DepositModal';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { loading } = useApp();
  const [view, setView] = useState<ViewKey>('lobby');
  const [collapsed, setCollapsed] = useState(false);
  const [activeMatch, setActiveMatch] = useState<string | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);

  const handleNavigate = (v: ViewKey) => {
    setActiveMatch(null);
    setView(v);
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
        onProfileClick={() => {}}
        onMenuClick={() => setCollapsed(!collapsed)}
      />
      <div className="flex">
        <Sidebar
          currentView={view}
          onNavigate={handleNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
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
          ) : null}
        </main>
      </div>

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
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
