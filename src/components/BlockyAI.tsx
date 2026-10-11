import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';

const SPEECH_TIPS = [
  'Necesitas ayuda? Preguntame por tu ranking o ganancias.',
  'Revisa los torneos activos en la pantalla principal!',
  'Tu boveda esta segura con contratos inteligentes.',
  'Nuevo en Cash League? Elige tu Arena y comienza a competir.',
];

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

interface OfficialStats {
  globalRank: string;
  winRate: string;
  totalEarned: string;
}

interface BlockyAIProps {
  officialStats: OfficialStats;
}

export default function BlockyAI({ officialStats }: BlockyAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Hola! Soy Blocky, arbitro oficial de Cash League. En tu perfil puedes conectar tus IDs de juegos y ver tus estadisticas verificadas por la liga.',
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showBubble, setShowBubble] = useState(true);
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % SPEECH_TIPS.length);
      setShowBubble(true);
      const hideTimer = setTimeout(() => setShowBubble(false), 5000);
      return () => clearTimeout(hideTimer);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      let reply = 'Como arbitro oficial, las estadisticas de victorias y Win Rate se calculan automaticamente y no se pueden alterar.';
      const q = userText.toLowerCase();
      if (q.includes('rank') || q.includes('clasificacion') || q.includes('puesto') || q.includes('ranking')) {
        reply = `Tu puesto mundial actual es ${officialStats.globalRank} con un Win Rate oficial de ${officialStats.winRate}.`;
      } else if (q.includes('saldo') || q.includes('ganancias') || q.includes('ganado') || q.includes('boveda')) {
        reply = `Has ganado ${officialStats.totalEarned} en torneos verificados de Cash League.`;
      } else if (q.includes('torneo') || q.includes('competicion')) {
        reply = 'Los torneos abiertos aparecen en la pantalla principal. Incribete rapido, los cupos se llenan en tiempo real!';
      } else if (q.includes('hola') || q.includes('ayuda')) {
        reply = 'Hola! Preguntame sobre tu ranking, ganancias, o como funcionan los torneos.';
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-80 md:w-96 h-[460px] bg-[#070709] border-2 border-[#FFC700] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden">
          <div className="bg-[#14141C] border-b border-[#D4AF37]/50 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-[#FFC700] bg-black flex items-center justify-center">
                <Bot size={16} className="text-[#FFC700]" />
              </div>
              <div>
                <h4 className="text-[#FFC700] font-black text-xs tracking-wider leading-none">BLOCKY AI - ARBITRO OFICIAL</h4>
                <span className="text-[10px] text-neutral-400 font-medium">Arbitro & Boveda de Cash League</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[#FFC700] transition-colors font-bold"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#070709]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#D4AF37] text-[#0A0A0C] font-semibold ml-auto rounded-br-none'
                    : 'bg-[#1C1C24] text-white border border-[#D4AF37]/30 mr-auto rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#14141C] border-t border-[#D4AF37]/50 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Preguntale a Blocky..."
              className="flex-1 bg-[#070709] border border-neutral-800 focus:border-[#FFC700] rounded-lg px-3 py-2 text-xs text-white outline-none transition-colors"
            />
            <button
              onClick={handleSend}
              className="bg-gradient-to-br from-[#E5C158] to-[#C3972E] text-[#0A0A0C] px-4 py-2 rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-[#C3972E]/30 transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Permanent speech bubble */}
      {showBubble && !isOpen && (
        <div className="hidden md:flex bg-[#14141C] border border-[#FFC700] text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-[0_0_20px_rgba(255,199,0,0.35)] animate-pulse items-center max-w-[200px]">
          <span className="text-[#FFC700] mr-1">⚡</span> {SPEECH_TIPS[tipIdx]}
        </div>
      )}

      <button
        onClick={() => { setIsOpen(!isOpen); setShowBubble(false); }}
        className="relative w-20 h-20 rounded-full bg-[#070709] border-2 border-[#FFC700] p-1 shadow-[0_0_30px_rgba(255,199,0,0.7)] flex items-center justify-center group transition-transform blocky-super-glow cursor-pointer"
        style={{ animation: 'blockyFloat 3.5s ease-in-out infinite, pulseGlow 2.5s infinite ease-in-out' }}
      >
        <div className="absolute inset-0 rounded-full bg-[#FFC700]/20 blur-md group-hover:blur-lg transition-all" />
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1A1A26] to-[#070709] flex flex-col items-center justify-center relative z-10 border border-[#FFC700]/40">
          <Bot size={28} className="text-[#FFC700]" />
          <span className="text-[8px] font-black text-[#FFC700] tracking-tighter mt-0.5">BLOCKY</span>
        </div>
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#00FF66] border-2 border-[#070709] rounded-full z-20 shadow-[0_0_10px_#00FF66]" />
      </button>
    </div>
  );
}
