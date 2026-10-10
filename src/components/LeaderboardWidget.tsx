import { useEffect, useState } from 'react';
import { Trophy, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Usuario } from '@/lib/types';
import { formatCLP } from '@/lib/types';

const RANK_COLORS = [
  'from-[#FFC700] to-amber-600',
  'from-neutral-300 to-neutral-500',
  'from-amber-700 to-amber-900',
];

const AVATAR_COLORS = [
  'from-red-500 to-red-800',
  'from-blue-500 to-blue-800',
  'from-green-500 to-green-800',
  'from-purple-500 to-purple-800',
  'from-orange-500 to-orange-800',
];

export default function LeaderboardWidget() {
  const [players, setPlayers] = useState<Usuario[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .order('wins', { ascending: false })
        .limit(5);
      if (data && data.length > 0) {
        setPlayers(data as Usuario[]);
      } else {
        setPlayers([
          { id: '1', username: 'ProGamer_CL', avatar_url: null, balance_clp: 142000, balance_usd: 142, wins: 47, losses: 12, created_at: '' },
          { id: '2', username: 'ShadowKnight', avatar_url: null, balance_clp: 98000, balance_usd: 98, wins: 39, losses: 15, created_at: '' },
          { id: '3', username: 'NeoFighter', avatar_url: null, balance_clp: 76000, balance_usd: 76, wins: 31, losses: 18, created_at: '' },
          { id: '4', username: 'GoldenAce', avatar_url: null, balance_clp: 54000, balance_usd: 54, wins: 24, losses: 9, created_at: '' },
          { id: '5', username: 'PixelWarrior', avatar_url: null, balance_clp: 38000, balance_usd: 38, wins: 18, losses: 22, created_at: '' },
        ]);
      }
    };
    load();
  }, []);

  return (
    <div className="relative h-full rounded-2xl overflow-hidden border border-neutral-800 hover:border-[#FFC700]/40 transition-all duration-300
      bg-gradient-to-b from-neutral-900/80 to-[#0A0A0C]/90 backdrop-blur-md">
      <div className="relative h-full flex flex-col p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-[#FFC700]" />
          <h3 className="text-sm font-black text-white tracking-tight">Top Jugadores</h3>
          <span className="ml-auto text-[9px] text-neutral-500 uppercase tracking-wide">Ranking</span>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {players.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                i === 0
                  ? 'bg-[#FFC700]/10 border border-[#FFC700]/20'
                  : 'bg-neutral-800/30 hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0">
                {i < 3 ? (
                  <div className={`flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br ${RANK_COLORS[i]}`}>
                    {i === 0 ? (
                      <Crown size={12} className="text-black" />
                    ) : (
                      <span className="text-[10px] font-black text-black">{i + 1}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-neutral-500">{i + 1}</span>
                )}
              </div>

              <div className={`flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white text-[10px] font-black shrink-0`}>
                {player.username.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{player.username}</p>
                <p className="text-[10px] text-neutral-500">{player.wins}V - {player.losses}D</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-black text-[#FFC700]">{formatCLP(player.balance_clp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
