import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';

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
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-80 md:w-96 h-[460px] bg-[#0A0A0C] border border-[#D4AF37]/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-[#141418] border-b border-[#D4AF37]/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[#FFC700] bg-black flex items-center justify-center">
                <Bot size={16} className="text-[#FFC700]" />
              </div>
              <div>
                <h4 className="text-[#FFC700] font-bold text-sm leading-none">BLOCKY AI</h4>
                <span className="text-[10px] text-neutral-400 font-medium">Arbitro & Boveda de Cash League</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#D4AF37] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0A0A0C]">
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

          <div className="p-3 bg-[#141418] border-t border-[#D4AF37]/30 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Preguntale a Blocky..."
              className="flex-1 bg-[#0A0A0C] border border-neutral-800 focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white outline-none transition-colors"
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

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-20 h-20 rounded-full bg-[#0A0A0C] border-2 border-[#FFC700] p-1 shadow-2xl hover:scale-105 flex items-center justify-center group transition-transform"
        style={{ animation: 'blockyFloat 3.5s ease-in-out infinite' }}
      >
        <div className="absolute inset-0 rounded-full bg-[#FFC700]/20 blur-md group-hover:blur-lg transition-all" />
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1A1A24] to-[#0A0A0C] flex flex-col items-center justify-center relative z-10 border border-[#FFC700]/40">
          <Bot size={28} className="text-[#FFC700]" />
          <span className="text-[8px] font-black text-[#FFC700] tracking-tighter mt-0.5">BLOCKY</span>
        </div>
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#0A0A0C] rounded-full z-20" />
      </button>
    </div>
  );
}
