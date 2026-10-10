import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import { formatCLP, formatUSD } from '@/lib/types';
import type { Usuario } from '@/lib/types';
import { Lock, Edit3, Save, Gamepad2, Globe, ShieldCheck, Crown, Camera, Upload } from 'lucide-react';

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
  tagline: 'Pro Player & Content Creator | Cash League Ambassador',
  bio: 'Compitiendo en torneos de alto nivel desde 2022. Especialista en FPS y juegos de estrategia.',
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
  const { currentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [userStats, setUserStats] = useState<Usuario | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileData({ ...profileData, bannerUrl: url });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileData({ ...profileData, avatarUrl: url });
    }
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* BANNER DE PERFIL */}
      <div className="relative rounded-2xl overflow-hidden bg-[#141418] border border-[#D4AF37]/30 h-72 group">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A1A24] to-[#0A0A0C]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent" />

        {/* Boton Cambiar Portada */}
        <label className="absolute top-4 right-4 cursor-pointer bg-black/80 border border-[#FFC700] text-[#FFC700] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#FFC700] hover:text-black transition flex items-center gap-2">
          <Camera size={14} /> Cambiar Portada
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="hidden"
          />
        </label>

        {/* Avatar */}
        <div className="absolute -bottom-8 left-8 flex items-end gap-5 z-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl border-4 border-[#FFC700] bg-black overflow-hidden shadow-2xl">
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
            {isEditing && (
              <label className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#FFC700] text-black flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition">
                <Upload size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="mb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-white drop-shadow-md">{currentUser.username}</h2>
              <span className="bg-[#FFC700] text-[#0A0A0C] text-[10px] font-extrabold px-2 py-1 rounded tracking-widest uppercase flex items-center gap-1">
                <ShieldCheck size={12} /> Verificado CL
              </span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={profileData.tagline}
                onChange={(e) => setProfileData({ ...profileData, tagline: e.target.value })}
                className="bg-[#0A0A0C] border border-[#D4AF37] rounded-lg px-3 py-1 text-xs text-[#FFC700] font-bold outline-none mt-1 w-96 max-w-full"
              />
            ) : (
              <p className="text-xs text-[#FFC700] font-bold">{profileData.tagline}</p>
            )}
          </div>
        </div>

        {/* Boton Editar/Guardar */}
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="absolute top-4 left-4 bg-black/80 border border-[#D4AF37] text-[#FFC700] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#FFC700] hover:text-black transition flex items-center gap-2"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* COLUMNA IZQUIERDA: ESTADISTICAS OFICIALES NO EDITABLES */}
        <div className="bg-[#141418] border border-[#D4AF37]/30 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Lock size={14} className="text-[#C3972E]" /> Estadisticas Oficiales
            </h3>
            <span className="text-[9px] bg-red-900/80 text-red-300 px-2 py-0.5 rounded font-bold">
              NO EDITABLE
            </span>
          </div>

          <div className="bg-[#0A0A0C] p-4 rounded-xl border border-[#FFC700]/30 flex justify-between">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Ranking Mundial</p>
              <p className="text-2xl font-black text-[#FFC700]">{globalRank}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Rango</p>
              <p className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                <Crown size={12} className="text-[#FFC700]" /> {tier}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0A0A0C] p-3 rounded-xl border border-neutral-800">
              <p className="text-[10px] text-neutral-500 font-bold uppercase">Partidas</p>
              <p className="text-lg font-black text-white">{totalMatches}</p>
            </div>
            <div className="bg-[#0A0A0C] p-3 rounded-xl border border-neutral-800">
              <p className="text-[10px] text-neutral-500 font-bold uppercase">Win Rate</p>
              <p className="text-lg font-black text-green-400">{winRate}%</p>
            </div>
            <div className="bg-[#0A0A0C] p-3 rounded-xl border border-neutral-800">
              <p className="text-[10px] text-neutral-500 font-bold uppercase">Victorias</p>
              <p className="text-lg font-black text-green-500">{userStats.wins}</p>
            </div>
            <div className="bg-[#0A0A0C] p-3 rounded-xl border border-neutral-800">
              <p className="text-[10px] text-neutral-500 font-bold uppercase">Derrotas</p>
              <p className="text-lg font-black text-red-500">{userStats.losses}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#141418] to-[#0A0A0C] text-white p-4 rounded-xl border border-[#FFC700]">
            <p className="text-[10px] text-[#FFC700] font-bold uppercase tracking-wider">Ganancias en Boveda</p>
            <p className="text-xl font-black text-white">{totalEarned}</p>
          </div>

          <div className="bg-gradient-to-r from-[#141418] to-[#0A0A0C] text-white p-4 rounded-xl border border-[#D4AF37]/30">
            <p className="text-[10px] text-[#FFC700] font-bold uppercase tracking-wider">Saldo CLP</p>
            <p className="text-xl font-black text-white">{formatCLP(userStats.balance_clp)}</p>
          </div>
        </div>

        {/* COLUMNA DERECHA: DATOS EDITABLES */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biografia */}
          <div className="bg-[#141418] border border-[#D4AF37]/30 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Edit3 size={14} className="text-[#C3972E]" /> Biografia Gamer
            </h3>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full bg-[#0A0A0C] border border-neutral-800 focus:border-[#FFC700] rounded-xl p-3 text-xs text-white outline-none transition-colors"
                rows={3}
              />
            ) : (
              <p className="text-xs text-neutral-300 leading-relaxed">{profileData.bio}</p>
            )}
          </div>

          {/* Game IDs */}
          <div className="bg-[#141418] border border-[#D4AF37]/30 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Gamepad2 size={14} className="text-[#C3972E]" /> Game IDs Verificados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(profileData.gameIds).map(([game, id]) => (
                <div key={game} className="bg-[#0A0A0C] p-3 rounded-xl border border-neutral-800">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold">
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
                      className="bg-transparent text-xs font-extrabold text-[#FFC700] outline-none mt-1 w-full focus:border-b focus:border-[#FFC700] transition"
                    />
                  ) : (
                    <p className="text-xs font-extrabold text-[#FFC700] mt-1">{id || 'No conectado'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="bg-[#141418] border border-[#D4AF37]/30 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Globe size={14} className="text-[#C3972E]" /> Redes y Canales de Streaming
            </h3>
            <div className="space-y-3">
              {Object.entries(profileData.socials).map(([platform, handle]) => (
                <div key={platform} className="flex items-center justify-between bg-[#0A0A0C] p-3 rounded-xl border border-neutral-800">
                  <span className="text-xs font-bold text-neutral-400">
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
                      className="bg-transparent border-b border-neutral-700 focus:border-[#FFC700] text-xs text-white text-right outline-none px-2 transition"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white">{handle || 'No conectado'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
