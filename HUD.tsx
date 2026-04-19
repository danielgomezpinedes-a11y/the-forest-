
import React, { useState, useEffect } from 'react';
import { Utensils, Heart, ShoppingBag, Sun, CloudRain, Cloud, Snowflake, Clock, Moon, Eye, EyeOff, Tent, Flame, Info, Users } from 'lucide-react';
import { WeatherType } from '../types';
import { useSounds } from './SoundManager';
import { useLanguage } from '../src/LanguageContext';

interface HUDProps {
  hunger: number;
  health: number;
  meat: number;
  weather: WeatherType;
  timeOfDay: number;
  isCrouching: boolean;
  hasShelter: boolean;
  hasFire: boolean;
  roomId: string | null;
  onEat: () => void;
  onOpenInventory: () => void;
  onOpenTutorial: () => void;
}

const HUD: React.FC<HUDProps> = ({ hunger, health, meat, weather, timeOfDay, isCrouching, hasShelter, hasFire, roomId, onEat, onOpenInventory, onOpenTutorial }) => {
  const { t, language } = useLanguage();
  const { playSound } = useSounds();
  const [isHit, setIsHit] = useState(false);

  useEffect(() => {
    const handleHit = () => {
      setIsHit(true);
      setTimeout(() => setIsHit(false), 100);
    };
    (window as any).addEventListener('vfx:hit', handleHit);
    return () => (window as any).removeEventListener('vfx:hit', handleHit);
  }, []);
  
  const handleEatClick = () => {
    if (meat > 0 && hunger < 100) {
      playSound('eat');
      onEat();
    }
  };

  const getWeatherInfo = () => {
    switch (weather) {
      case WeatherType.CLEAR: return { icon: <Sun className="text-yellow-400" />, label: t.hud.weather.CLEAR };
      case WeatherType.RAIN: return { icon: <CloudRain className="text-blue-400" />, label: t.hud.weather.RAIN };
      case WeatherType.FOG: return { icon: <Cloud className="text-gray-400" />, label: t.hud.weather.FOG };
      case WeatherType.SNOWSTORM: return { icon: <Snowflake className="text-white animate-pulse" />, label: t.hud.weather.SNOWSTORM };
      default: return { icon: <Sun />, label: "---" };
    }
  };

  const weatherInfo = getWeatherInfo();

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isNight = timeOfDay < 6 || timeOfDay > 19;

  return (
    <>
      {/* Crosshair */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
        <div className={`transition-all duration-75 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)] ${isHit ? 'w-4 h-4 bg-white scale-150' : 'w-1 h-1 bg-white/60'}`} />
      </div>

      <div className="fixed top-0 left-0 w-full p-4 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4 z-40">
        <div className="flex flex-col gap-2 w-full sm:w-64">
          <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-white/10">
            <div className="flex justify-between items-center mb-1 px-1">
              <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><Heart size={14} fill="currentColor"/> {t.hud.health}</span>
              <span className="text-white text-xs font-bold">{Math.round(health)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${health}%` }} />
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-white/10">
            <div className="flex justify-between items-center mb-1 px-1">
              <span className="flex items-center gap-1 text-orange-400 text-xs font-bold"><Utensils size={14} fill="currentColor"/> {t.hud.hunger}</span>
              <span className="text-white text-xs font-bold">{Math.round(hunger)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${hunger}%` }} />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {isCrouching && (
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-500/50 flex items-center gap-3 animate-pulse">
              <EyeOff className="text-emerald-400" size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-400 uppercase font-bold leading-none">{language === 'es' ? "Sigilo" : "Sigil"}</span>
                <span className="text-white font-bold leading-none text-sm">{language === 'es' ? "Oculto" : "Ocult"}</span>
              </div>
            </div>
          )}

          {hasShelter && (
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-orange-500/50 flex items-center gap-3 animate-bounce">
              <Tent className="text-orange-400" size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] text-orange-400 uppercase font-bold leading-none">{language === 'es' ? "Construir [B]" : "Construir [B]"}</span>
                <span className="text-white font-bold leading-none text-sm">{t.inventory.items.shelter.split(' ')[0]}</span>
              </div>
            </div>
          )}

          {hasFire && (
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-yellow-500/50 flex items-center gap-3 animate-pulse">
              <Flame className="text-yellow-400" size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] text-yellow-400 uppercase font-bold leading-none">{language === 'es' ? "Encender [F]" : "Encendre [F]"}</span>
                <span className="text-white font-bold leading-none text-sm">{t.inventory.items.fire.split(' ')[0]}</span>
              </div>
            </div>
          )}

          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
            {isNight ? <Moon className="text-blue-300" size={20} /> : <Clock className="text-yellow-200" size={20} />}
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-bold leading-none">{language === 'es' ? "Hora" : "Hora"}</span>
              <span className="text-white font-mono text-sm font-bold leading-none">{formatTime(timeOfDay)}</span>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
            {weatherInfo.icon}
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-bold leading-none">{language === 'es' ? "Clima" : "Clima"}</span>
              <span className="text-white font-bold leading-none text-sm">{weatherInfo.label}</span>
            </div>
          </div>

          {roomId && (
            <div className="bg-blue-600/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-400/50 flex items-center gap-3">
              <Users className="text-blue-300" size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-300 uppercase font-bold leading-none">{language === 'es' ? "Sala" : "Sala"}</span>
                <span className="text-white font-mono text-sm font-bold leading-none tracking-widest">{roomId}</span>
              </div>
            </div>
          )}

          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 pointer-events-auto cursor-pointer active:scale-95 transition-transform" onClick={onOpenTutorial}>
            <Info className="text-blue-400" size={20} />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-bold leading-none">{language === 'es' ? "Ayuda" : "Ajuda"}</span>
              <span className="text-white font-bold leading-none text-sm">{language === 'es' ? "Guía" : "Guia"}</span>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 pointer-events-auto cursor-pointer active:scale-95 transition-transform" onClick={onOpenInventory}>
            <ShoppingBag className="text-yellow-400" size={20} />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-bold leading-none">{t.hud.inventory}</span>
              <span className="text-white font-mono text-xl font-bold leading-none">{meat}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HUD;
