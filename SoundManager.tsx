
// Sound Manager for handling game audio
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { WeatherType } from '../types';

interface SoundContextType {
  playSound: (type: 'attack' | 'eat' | 'collect' | 'hit' | 'jump' | 'step' | 'bear' | 'wolf' | 'rabbit' | 'thunder' | 'wood' | 'stone') => void;
  setWeatherVolume: (weather: WeatherType) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const useSounds = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSounds must be used within SoundProvider");
  return context;
};

const SOUND_URLS = {
  attack: 'https://assets.mixkit.co/sfx/preview/mixkit-sword-swish-734.mp3',
  eat: 'https://assets.mixkit.co/sfx/preview/mixkit-crunchy-bite-788.mp3',
  collect: 'https://assets.mixkit.co/sfx/preview/mixkit-quick-positive-video-game-notification-interface-265.mp3',
  hit: 'https://assets.mixkit.co/sfx/preview/mixkit-body-impact-light-641.mp3',
  jump: 'https://assets.mixkit.co/sfx/preview/mixkit-fast-small-sweep-transition-166.mp3',
  step: 'https://assets.mixkit.co/sfx/preview/mixkit-crunchy-footstep-on-dry-grass-541.mp3',
  wind: 'https://assets.mixkit.co/sfx/preview/mixkit-cold-winter-wind-loop-1168.mp3',
  rain: 'https://assets.mixkit.co/sfx/preview/mixkit-rain-moderate-loop-2435.mp3',
  thunder: 'https://assets.mixkit.co/sfx/preview/mixkit-distant-thunder-rumble-2437.mp3',
  bear: 'https://assets.mixkit.co/sfx/preview/mixkit-beast-growl-reverb-2470.mp3',
  wolf: 'https://assets.mixkit.co/sfx/preview/mixkit-wolf-howl-at-the-moon-1774.mp3',
  rabbit: 'https://assets.mixkit.co/sfx/preview/mixkit-small-animal-squeak-2213.mp3',
  wood: 'https://assets.mixkit.co/sfx/preview/mixkit-wood-hard-hit-2182.mp3',
  stone: 'https://assets.mixkit.co/sfx/preview/mixkit-stone-impact-on-ground-2511.mp3',
};

export const SoundProvider: React.FC<{ children: React.ReactNode, weather: WeatherType }> = ({ children, weather }) => {
  // Fix: Use any for audio refs to bypass missing or incomplete DOM property definitions
  const audioElements = useRef<{ [key: string]: any }>({});
  const ambientWind = useRef<any>(null);
  const ambientWeather = useRef<any>(null);

  useEffect(() => {
    // Preload sounds
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      // Fix: Access Audio via window cast to bypass missing name error
      const audio = new (window as any).Audio(url);
      audio.preload = 'auto';
      audioElements.current[key] = audio;
    });

    // Setup Ambience
    // Fix: Access Audio via window cast
    ambientWind.current = new (window as any).Audio(SOUND_URLS.wind);
    if (ambientWind.current) {
      ambientWind.current.loop = true;
      ambientWind.current.volume = 0.2;
    }

    // Fix: Access Audio via window cast
    ambientWeather.current = new (window as any).Audio(SOUND_URLS.rain);
    if (ambientWeather.current) {
      ambientWeather.current.loop = true;
      ambientWeather.current.volume = 0;
    }

    const startAmbience = () => {
        ambientWind.current?.play().catch(() => {});
        ambientWeather.current?.play().catch(() => {});
        // Fix: Use window cast for event listener management
        (window as any).removeEventListener('click', startAmbience);
    };
    // Fix: Use window cast for event listener management
    (window as any).addEventListener('click', startAmbience);

    return () => {
      // Fix: Use window cast for event listener management
      (window as any).removeEventListener('click', startAmbience);
      ambientWind.current?.pause();
      ambientWeather.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!ambientWeather.current) return;
    
    // Update weather sound volume based on intensity
    switch (weather) {
      case WeatherType.RAIN:
        ambientWeather.current.volume = 0.5;
        if (ambientWind.current) ambientWind.current.volume = 0.4;
        break;
      case WeatherType.SNOWSTORM:
        ambientWeather.current.volume = 0.1; // Subtle snow sound if any
        if (ambientWind.current) ambientWind.current.volume = 0.9; // Louder howling wind
        break;
      case WeatherType.FOG:
        ambientWeather.current.volume = 0;
        if (ambientWind.current) ambientWind.current.volume = 0.05; // Very quiet, eerie wind
        break;
      case WeatherType.CLEAR:
      default:
        ambientWeather.current.volume = 0;
        if (ambientWind.current) ambientWind.current.volume = 0.2; // Standard light breeze
        break;
    }
  }, [weather]);

  // Occasional thunder during rain
  useEffect(() => {
    if (weather !== WeatherType.RAIN) return;

    const playThunder = () => {
        if (Math.random() > 0.7) {
            playSound('thunder');
        }
    };

    const interval = setInterval(playThunder, 15000);
    return () => clearInterval(interval);
  }, [weather]);

  const playSound = (type: keyof typeof SOUND_URLS) => {
    const audio = audioElements.current[type];
    if (audio) {
      // Fix: Cast cloned node to any to bypass property errors
      const clone = (audio.cloneNode() as any);
      clone.volume = 0.5;
      clone.play().catch(() => {});

      // Dispatch visual effect events
      if (type === 'thunder') {
        (window as any).dispatchEvent(new CustomEvent('vfx:thunder'));
      }
    }
  };

  const setWeatherVolume = (w: WeatherType) => {
      // Handled by useEffect above
  };

  return (
    <SoundContext.Provider value={{ playSound, setWeatherVolume }}>
      {children}
    </SoundContext.Provider>
  );
};
