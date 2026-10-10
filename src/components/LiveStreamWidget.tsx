import { Radio, Eye, Volume2, Play } from 'lucide-react';
import { useState } from 'react';

const STREAMS = [
  {
    streamer: 'ProGamer_CL',
    title: 'FINAL COPA CHILE - Semifinal 1v1',
    viewers: 12483,
    game: 'Fortnite',
    image: 'https://images.pexels.com/photos/7915226/pexels-photo-7915226.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    streamer: 'ShadowKnight',
    title: 'Ranked Sprint - Subiendo a Radiant',
    viewers: 8721,
    game: 'Valorant',
    image: 'https://images.pexels.com/photos/9072394/pexels-photo-9072394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export default function LiveStreamWidget() {
  const [current, setCurrent] = useState(0);
  const stream = STREAMS[current];

  return (
    <div className="relative h-full rounded-2xl overflow-hidden border border-red-500/30 hover:border-red-500/50 transition-all duration-300 group">
      <div className="absolute inset-0">
        <img src={stream.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/60 to-transparent" />
      </div>

      <div className="relative h-full flex flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/80 backdrop-blur-sm">
            <Radio size={12} className="text-white animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-wide">EN VIVO</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
            <Eye size={12} className="text-neutral-300" />
            <span className="text-[10px] font-bold text-white tabular-nums">{stream.viewers.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-900 text-white text-xs font-black shrink-0">
              {stream.streamer.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{stream.streamer}</p>
              <p className="text-[10px] text-neutral-400 truncate">{stream.title}</p>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white hover:bg-white/20 transition-all">
            <Play size={14} className="fill-white" /> Ver Transmision
          </button>

          <div className="flex items-center justify-center gap-1">
            {STREAMS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all ${i === current ? 'w-6 bg-red-500' : 'w-1.5 bg-neutral-600'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Volume2 size={16} className="text-white/60" />
      </div>
    </div>
  );
}
