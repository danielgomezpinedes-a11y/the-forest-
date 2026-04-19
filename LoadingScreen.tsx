
import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { Mountain, Loader2, Compass, Shield, Zap } from 'lucide-react';
import { useLanguage } from '../src/LanguageContext';

interface LoadingScreenProps {
  onStarted: () => void;
  isReady: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onStarted, isReady }) => {
  const { t } = useLanguage();
  const { progress } = useProgress();
  const roundedProgress = Math.round(progress);
  const [tipIndex, setTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % t.tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [t.tips.length]);

  const handleStart = () => {
    setIsVisible(false);
    setTimeout(onStarted, 1000);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-1000 bg-[#0a0a0a] ${
        isVisible ? 'opacity-100' : 'opacity-0 scale-110 pointer-events-none'
      }`}
    >
      {/* Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-8">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <Mountain className="w-16 h-16 text-white" />
          </div>
        </div>

        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">
          {t.mainMenu.title.split(' ')[0]} <span className="text-blue-500">{t.mainMenu.title.split(' ').slice(1).join(' ')}</span>
        </h2>
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[1px] w-12 bg-white/20" />
          <p className="text-zinc-400 font-mono text-xs tracking-widest uppercase">Survival Simulator v2.5</p>
          <div className="h-[1px] w-12 bg-white/20" />
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t.loading.title}</span>
            <span className="text-2xl font-mono text-white">{roundedProgress}%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500 ease-out"
              style={{ width: `${roundedProgress}%` }}
            />
          </div>
        </div>

        {/* Tips Section */}
        <div className="h-20 flex flex-col items-center justify-center text-center mb-12">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Compass size={14} className="animate-spin-slow" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Consejo de Supervivencia</span>
          </div>
          <p className="text-zinc-300 text-sm italic font-serif leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700" key={tipIndex}>
            "{t.tips[tipIndex]}"
          </p>
        </div>

        {roundedProgress === 100 && isReady && (
          <button
            onClick={handleStart}
            className="group relative px-16 py-5 bg-white text-black rounded-full font-black text-xl shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              {t.loading.start}
              <Zap size={20} className="fill-current" />
            </span>
            <div className="absolute inset-0 bg-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </button>
        )}

        {roundedProgress < 100 && (
          <div className="flex items-center gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Cargando Activos...</span>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-12 left-12 flex gap-8 opacity-20">
        <div className="flex flex-col gap-1">
          <div className="h-1 w-8 bg-white" />
          <div className="h-1 w-4 bg-white" />
        </div>
        <div className="text-[10px] font-mono text-white leading-tight">
          LAT: 64.1265° N<br />
          LON: 21.8174° W
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
