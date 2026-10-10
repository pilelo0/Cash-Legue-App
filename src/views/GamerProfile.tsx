import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import { formatCLP, formatUSD } from '@/lib/types';
import type { Usuario } from '@/lib/types';
import { Lock, Edit3, Save, Trophy, Target, TrendingUp, DollarSign, Gamepad2, Globe, ShieldCheck, Crown } from 'lucide-react';

interface ProfileData {
  tagline: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  socials: {
    twitch: string;
    discord: string;
    twitter: string;
  };
  gameIds: {
    fortnite: string;
    rocketLeague: string;
    valorant: string;
  };
}

const DEFAULT_PROFILE: ProfileData = {
  tagline: 'Pro Player & Content Creator | E-Sports Enthusiast',
  bio: 'Compitiendo en torneos de alto nivel desde 2022. Especialista en juegos de disparo y estrategia en tiempo real.',
  avatarUrl: '',
  bannerUrl: '',
  socials: {
    twitch: '',
    discord: '',
    twitter: '',
  },
  gameIds: {
    fortnite: '',
    rocketLeague: '',
    valorant: '',
  },
};

const PROFILE_STORAGE_KEY = 'cash_league_profile_extras';

function loadProfileExtras(userId: string): ProfileData {
  try {
    const raw = localStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    // ignore parse errors
  }
  return DEFAULT_PROFILE;
}

function saveProfileExtras(userId: string, data: ProfileData) {
  localStorage.setItem(`${PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(data));
}

function getTier(wins: number): string {
  if (wins >= 200) return 'Diamante Elite';
  if (wins >= 100) return 'Platino';
  if (wins >= 50) return 'Oro';
  if (wins >= 20) return 'Plata';
  return 'Bronce';
}

function getRank(wins: number): string {
  if (wins >= 200) return '#142';
  if (wins >= 100) return '#350';
  if (wins >= 50) return '#892';
  if (wins >= 20) return '#1,240';
  return '#2,500+';
}

export default function GamerProfile() {
  const { currentUser, refreshUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [userStats, setUserStats] = useState<Usuario | null>(null);

  const loadStats = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();
    if (data) setUserStats(data as Usuario);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setProfileData(loadProfileExtras(currentUser.id));
      loadStats();
    }
  }, [currentUser, loadStats]);

  const handleSave = () => {
    if (currentUser) {
      saveProfileExtras(currentUser.id, profileData);
    }
    setIsEditing(false);
  };

  if (!currentUser || !userStats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-neutral-500 text-sm">Cargando perfil...</p>
      </div>
    );
  }

  const totalMatches = userStats.wins + userStats.losses;
  const winRate = totalMatches > 0 ? ((userStats.wins / totalMatches) * 100).toFixed(1) : '0.0';
  const totalEarned = formatUSD(userStats.balance_usd);
  const tier = getTier(userStats.wins);
  const globalRank = getRank(userStats.wins);

  const avatarUrl = profileData.avatarUrl || currentUser.avatar_url || '';
  const bannerUrl = profileData.bannerUrl || '';

  return (
    <div className="max-w-6xl mx-auto" style={{ backgroundColor: '#F5F2EC', color: '#1A1A1E', minHeight: 'calc(100vh - 3.5rem)' }}>
      <style>{`
        .gold-border {
          border: 1px solid rgba(212, 175, 55, 0.4);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06), inset 0 0 10px rgba(212, 175, 55, 0.05);
        }
        .marble-pattern {
          background-color: #F7F5F0;
          background-image: radial-gradient(rgba(212, 175, 55, 0.12) 1px, transparent 0);
          background-size: 28px 28px;
        }
      `}</style>

      <div className="marble-pattern px-6 py-8">
        {/* Banner de Perfil */}
        <div className="relative rounded-2xl overflow-hidden gold-border bg-black h-64 mb-16">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1A1A24] to-[#0A0A0C]" />
          )}

          <div className="absolute -bottom-12 left-8 flex items-end gap-5">
            <div className="w-28 h-28 rounded-2xl border-4 border-[#FFC700] bg-black overflow-hidden shadow-2xl relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center">
                  <span className="text-[#FFC700] font-black text-3xl">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white drop-shadow-md">{currentUser.username}</h2>
                <span className="bg-[#FFC700] text-[#0A0A0C] text-[10px] font-extrabold px-2 py-1 rounded tracking-widest uppercase flex items-center gap-1">
                  <ShieldCheck size={12} /> Verificado CL
                </span>
              </div>
              <p className="text-xs text-gray-200 font-medium">{profileData.tagline}</p>
            </div>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-[#D4AF37] text-[#FFC700] text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Save size={14} /> Guardar Cambios
              </>
            ) : (
              <>
                <Edit3 size={14} /> Editar Perfil
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA: ESTADISTICAS OFICIALES */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl gold-border p-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <h3 className="font-extrabold text-sm text-[#0A0A0C] flex items-center gap-2">
                  <Lock size={14} className="text-[#C3972E]" /> ESTADISTICAS OFICIALES
                </h3>
                <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                  NO EDITABLE
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0A0A0C] text-white p-4 rounded-xl border border-[#D4AF37]/30 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ranking Mundial</p>
                    <p className="text-2xl font-black text-[#FFC700]">{globalRank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rango</p>
                    <p className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                      <Crown size={12} className="text-[#FFC700]" /> {tier}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F0EEE9] p-3 rounded-xl border border-gray-200">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Partidas</p>
                    <p className="text-lg font-black text-[#0A0A0C]">{totalMatches}</p>
                  </div>
                  <div className="bg-[#F0EEE9] p-3 rounded-xl border border-gray-200">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Win Rate</p>
                    <p className="text-lg font-black text-green-600">{winRate}%</p>
                  </div>
                  <div className="bg-[#F0EEE9] p-3 rounded-xl border border-gray-200">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Victorias</p>
                    <p className="text-lg font-black text-green-700">{userStats.wins}</p>
                  </div>
                  <div className="bg-[#F0EEE9] p-3 rounded-xl border border-gray-200">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Derrotas</p>
                    <p className="text-lg font-black text-red-600">{userStats.losses}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#141418] to-[#0A0A0C] text-white p-4 rounded-xl border border-[#FFC700]">
                  <p className="text-[10px] text-[#FFC700] font-bold uppercase tracking-wider">Ganancias Totales en Boveda</p>
                  <p className="text-xl font-black text-white">{totalEarned}</p>
                </div>

                <div className="bg-gradient-to-r from-[#141418] to-[#0A0A0C] text-white p-4 rounded-xl border border-[#D4AF37]/30">
                  <p className="text-[10px] text-[#FFC700] font-bold uppercase tracking-wider">Saldo CLP</p>
                  <p className="text-xl font-black text-white">{formatCLP(userStats.balance_clp)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: DATOS EDITABLES */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tagline */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl gold-border p-6">
              <h3 className="font-extrabold text-sm text-[#0A0A0C] mb-3">Tagline</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.tagline}
                  onChange={(e) => setProfileData({ ...profileData, tagline: e.target.value })}
                  className="w-full bg-[#F0EEE9] border border-[#D4AF37] rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              ) : (
                <p className="text-xs text-gray-700 font-medium">{profileData.tagline}</p>
              )}
            </div>

            {/* Biografia */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl gold-border p-6">
              <h3 className="font-extrabold text-sm text-[#0A0A0C] mb-3 flex items-center gap-2">
                <Edit3 size={14} className="text-[#C3972E]" /> BIOGRAFIA GAMER
              </h3>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full bg-[#F0EEE9] border border-[#D4AF37] rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  rows={4}
                />
              ) : (
                <p className="text-xs text-gray-700 leading-relaxed font-medium">{profileData.bio}</p>
              )}
            </div>

            {/* URLs de Avatar y Banner */}
            {isEditing && (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl gold-border p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-[#0A0A0C] mb-1">Imagen de Perfil y Banner</h3>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">URL Avatar</label>
                  <input
                    type="text"
                    value={profileData.avatarUrl}
                    onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#F0EEE9] border border-[#D4AF37] rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-[#D4AF37] mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">URL Banner</label>
                  <input
                    type="text"
                    value={profileData.bannerUrl}
                    onChange={(e) => setProfileData({ ...profileData, bannerUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#F0EEE9] border border-[#D4AF37] rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-[#D4AF37] mt-1"
                  />
                </div>
              </div>
            )}

            {/* Game IDs */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl gold-border p-6">
              <h3 className="font-extrabold text-sm text-[#0A0A0C] mb-4 flex items-center gap-2">
                <Gamepad2 size={14} className="text-[#C3972E]" /> GAME IDs VERIFICADOS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(profileData.gameIds).map(([game, id]) => (
                  <div key={game} className="bg-[#F7F5F0] border border-gray-200 p-3 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {game === 'fortnite' ? 'Fortnite' : game === 'rocketLeague' ? 'Rocket League' : 'Valorant'}
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={id}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            gameIds: { ...profileData.gameIds, [game]: e.target.value },
                          })
                        }
                        placeholder="Tu ID..."
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs mt-1"
                      />
                    ) : (
                      <p className="text-xs font-extrabold text-[#0A0A0C] mt-1">{id || 'No conectado'}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl gold-border p-6">
              <h3 className="font-extrabold text-sm text-[#0A0A0C] mb-4 flex items-center gap-2">
                <Globe size={14} className="text-[#C3972E]" /> REDES Y CANALES DE STREAMING
              </h3>
              <div className="space-y-3">
                {Object.entries(profileData.socials).map(([platform, handle]) => (
                  <div key={platform} className="flex items-center justify-between bg-[#F7F5F0] p-3 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold capitalize text-gray-600">
                      {platform === 'twitch' ? 'Twitch' : platform === 'discord' ? 'Discord' : 'Twitter'}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            socials: { ...profileData.socials, [platform]: e.target.value },
                          })
                        }
                        placeholder={`Tu ${platform}...`}
                        className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-right"
                      />
                    ) : (
                      <span className="text-xs font-bold text-[#0A0A0C]">{handle || 'No conectado'}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
