export interface Usuario {
  id: string;
  username: string;
  avatar_url: string | null;
  balance_clp: number;
  balance_usd: number;
  wins: number;
  losses: number;
  created_at: string;
}

export interface Partida {
  id: string;
  creador_id: string;
  oponente_id: string | null;
  juego: string;
  modalidad: string;
  monto_apuesta: number;
  pozo_total: number;
  estado: 'esperando' | 'en_curso' | 'finalizada' | 'cancelada';
  ganador_id: string | null;
  creado_en: string;
  iniciado_en: string | null;
  finalizado_en: string | null;
  sala: 'gaming' | 'destreza';
  max_jugadores: number;
  jugadores_actuales: number;
  es_masiva: boolean;
  creador?: Usuario;
  oponente?: Usuario | null;
  ganador?: Usuario | null;
}

export interface Transaccion {
  id: string;
  usuario_id: string;
  tipo: 'deposito' | 'retiro' | 'apuesta' | 'ganancia' | 'cancelacion';
  monto: number;
  moneda: 'CLP' | 'USD';
  partida_id: string | null;
  descripcion: string | null;
  estado: 'pendiente' | 'completada' | 'rechazada';
  creado_en: string;
}

export interface ReporteResultado {
  id: string;
  partida_id: string;
  usuario_id: string;
  resultado: 'ganador' | 'perdedor';
  captura_url: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'resuelto';
  creado_en: string;
  usuario?: Usuario;
}

export interface MensajeChat {
  id: string;
  partida_id: string;
  usuario_id: string;
  contenido: string;
  creado_en: string;
  usuario?: Usuario;
}

export type SalaKey = 'gaming' | 'destreza';

export interface Torneo {
  id: string;
  titulo: string;
  subtitulo: string | null;
  juego: string;
  sala: SalaKey;
  pozo: number;
  entrada: number;
  max_cupos: number;
  inscritos: number;
  estado: 'abierto' | 'por_iniciar' | 'en_progreso' | 'finalizado';
  fecha_inicio: string | null;
  imagen: string | null;
  destacado: boolean;
  creado_en: string;
}

export interface TorneoParticipante {
  id: string;
  torneo_id: string;
  usuario_id: string;
  creado_en: string;
}

export interface GameMeta {
  name: string;
  sala: SalaKey;
  banner: string;
  icon: string;
  color: string;
  es_masiva?: boolean;
  max_jugadores?: number;
  descripcion: string;
}

export const SALA_GAMING_IMAGE =
  'https://images.pexels.com/photos/9072394/pexels-photo-9072394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
export const SALA_DESTREZA_IMAGE =
  'https://images.pexels.com/photos/16256893/pexels-photo-16256893.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export const GAMES: GameMeta[] = [
  {
    name: 'Fortnite',
    sala: 'gaming',
    banner: 'https://images.pexels.com/photos/18512919/pexels-photo-18512919.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '🎮',
    color: 'from-purple-600 to-indigo-800',
    descripcion: 'Battle Royale - 1v1 Build Fights',
  },
  {
    name: 'Clash Royale',
    sala: 'gaming',
    banner: 'https://images.pexels.com/photos/4253690/pexels-photo-4253690.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '👑',
    color: 'from-blue-600 to-cyan-800',
    descripcion: 'Duelo de mazos en tiempo real',
  },
  {
    name: 'Rocket League',
    sala: 'gaming',
    banner: 'https://images.pexels.com/photos/37628687/pexels-photo-37628687.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '🚗',
    color: 'from-blue-500 to-sky-700',
    descripcion: 'Futbol con coches a alta velocidad',
  },
  {
    name: 'Brawlhalla',
    sala: 'gaming',
    banner: 'https://images.pexels.com/photos/11296116/pexels-photo-11296116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '⚔️',
    color: 'from-orange-600 to-red-800',
    descripcion: 'Plataforma de combate 1v1',
  },
  {
    name: 'Valorant',
    sala: 'gaming',
    banner: 'https://images.pexels.com/photos/7915226/pexels-photo-7915226.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '🎯',
    color: 'from-red-600 to-rose-800',
    descripcion: 'Shooter tactico 5v5 / 1v1',
  },
  {
    name: 'EA Sports FC',
    sala: 'gaming',
    banner: 'https://images.pexels.com/photos/40013103/pexels-photo-40013103.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '⚽',
    color: 'from-green-600 to-emerald-800',
    descripcion: 'Futbol simulacion 1v1',
  },
  {
    name: 'Ajedrez 3D',
    sala: 'destreza',
    banner: 'https://images.pexels.com/photos/6599558/pexels-photo-6599558.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '♟️',
    color: 'from-stone-600 to-stone-900',
    descripcion: 'Duelo de estrategia clasica',
  },
  {
    name: 'Damas',
    sala: 'destreza',
    banner: 'https://images.pexels.com/photos/16222424/pexels-photo-16222424.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '🔵',
    color: 'from-slate-600 to-slate-900',
    descripcion: 'Juego de mesa clasico 1v1',
  },
  {
    name: 'Sudoku Competitivo',
    sala: 'destreza',
    banner: 'https://images.pexels.com/photos/796510/pexels-photo-796510.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '🔢',
    color: 'from-teal-600 to-cyan-900',
    descripcion: 'Resolucion rapida de puzzles',
  },
  {
    name: 'Cultura General',
    sala: 'destreza',
    banner: 'https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '🧠',
    color: 'from-amber-600 to-yellow-900',
    descripcion: 'Trivia masiva - Quien quiere ser millonario',
    es_masiva: true,
    max_jugadores: 200,
  },
  {
    name: 'Duelos de Cartas',
    sala: 'destreza',
    banner: 'https://images.pexels.com/photos/269630/pexels-photo-269630.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    icon: '🃏',
    color: 'from-red-700 to-darkred-900',
    descripcion: 'Poker y juegos de cartas 1v1',
  },
];

export const GAMES_BY_SALA: Record<SalaKey, GameMeta[]> = {
  gaming: GAMES.filter((g) => g.sala === 'gaming'),
  destreza: GAMES.filter((g) => g.sala === 'destreza'),
};

export function getGameMeta(name: string): GameMeta | undefined {
  return GAMES.find((g) => g.name === name);
}

export const MONTOS_1V1 = [2000, 5000, 10000, 20000, 50000] as const;
export const MONTOS_MASIVOS = [1000, 2000, 5000] as const;

export function formatCLP(monto: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto);
}

export function formatUSD(monto: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(monto);
}
