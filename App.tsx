
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, WeatherType, Recipe, StructureData } from './types';
import GameScene from './components/GameScene';
import HUD from './components/HUD';
import MainMenu from './components/MainMenu';
import MobileControls from './components/MobileControls';
import LoadingScreen from './components/LoadingScreen';
import Inventory from './components/Inventory';
import VisualEffectsOverlay from './components/VisualEffectsOverlay';
import { SoundProvider } from './components/SoundManager';
import Tutorial from './components/Tutorial';
import { useLanguage } from './src/LanguageContext';

const App: React.FC = () => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [hunger, setHunger] = useState(100);
  const [health, setHealth] = useState(100);
  const [meat, setMeat] = useState(0);
  const [fur, setFur] = useState(0);
  const [wood, setWood] = useState(0);
  const [stone, setStone] = useState(0);
  const [inventory, setInventory] = useState({
    bandages: 0,
    warmCoat: false,
    sharpenedStick: false,
    axe: false,
    pickaxe: false,
    thermalSuit: false,
    shelter: false,
    torch: false,
    fire: false,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [weather, setWeather] = useState<WeatherType>(WeatherType.CLEAR);
  const [timeOfDay, setTimeOfDay] = useState(12); // 0-24 hours
  const [isCrouching, setIsCrouching] = useState(false);
  const [structures, setStructures] = useState<StructureData[]>([]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  // Joystick movement vector [x, y]
  const joystickVector = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyI') {
        setIsInventoryOpen(prev => !prev);
      }
      if (e.code === 'Escape' && isInventoryOpen) {
        setIsInventoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInventoryOpen]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in (window as any) || (navigator as any).maxTouchPoints > 0);
    };
    checkMobile();
    // Fix: Access window via any cast to bypass missing DOM type definitions
    (window as any).addEventListener('resize', checkMobile);
    return () => (window as any).removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (mode === GameMode.MENU || !isGameStarted) return;
    const weathers = [WeatherType.CLEAR, WeatherType.RAIN, WeatherType.FOG, WeatherType.SNOWSTORM];
    const interval = setInterval(() => {
      const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
      setWeather(nextWeather);
    }, 45000);
    return () => clearInterval(interval);
  }, [mode, isGameStarted]);

  useEffect(() => {
    if (mode === GameMode.MENU || !isGameStarted) return;
    const interval = setInterval(() => {
      setTimeOfDay(prev => (prev + 0.02) % 24); // Progress time
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, isGameStarted]);

  useEffect(() => {
    if (mode === GameMode.MENU || !isGameStarted) return;
    const interval = setInterval(() => {
      setHunger(prev => {
        const isNight = timeOfDay < 6 || timeOfDay > 19;
        let drainMultiplier = inventory.thermalSuit ? 0.3 : (inventory.warmCoat ? 0.6 : 1);
        if (isNight) drainMultiplier *= 1.4; // Colder at night
        if (weather === WeatherType.RAIN) drainMultiplier *= 1.5;
        if (weather === WeatherType.SNOWSTORM) drainMultiplier *= 3.0;
        const next = Math.max(0, prev - (0.5 * drainMultiplier));
        
        // Health logic: Damage if starving, Regen if well-fed
        setHealth(h => {
          if (next === 0) return Math.max(0, h - 2);
          if (next > 70 && h < 100) return Math.min(100, h + 0.3);
          return h;
        });
        
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, weather, isGameStarted, inventory.warmCoat, inventory.thermalSuit, timeOfDay]);

  const handleEat = useCallback(() => {
    if (meat > 0 && hunger < 100) {
      setMeat(prev => prev - 1);
      setHunger(prev => Math.min(100, prev + 25));
      setHealth(prev => Math.min(100, prev + 10));
    }
  }, [meat, hunger]);

  const onPlayerUpdate = useCallback((h: number) => {
    // Height update logic removed
  }, []);

  const onResourcesCollected = useCallback((type: 'MEAT' | 'FUR' | 'WOOD' | 'STONE') => {
    if (type === 'MEAT') setMeat(prev => prev + 1);
    if (type === 'FUR') setFur(prev => prev + 1);
    if (type === 'WOOD') setWood(prev => prev + 1);
    if (type === 'STONE') setStone(prev => prev + 1);
  }, []);

  const handleCraft = useCallback((recipe: Recipe) => {
    // Check ingredients
    const canCraft = 
      (recipe.ingredients.meat || 0) <= meat &&
      (recipe.ingredients.fur || 0) <= fur &&
      (recipe.ingredients.wood || 0) <= wood &&
      (recipe.ingredients.stone || 0) <= stone;

    if (canCraft) {
      setMeat(prev => prev - (recipe.ingredients.meat || 0));
      setFur(prev => prev - (recipe.ingredients.fur || 0));
      setWood(prev => prev - (recipe.ingredients.wood || 0));
      setStone(prev => prev - (recipe.ingredients.stone || 0));

      setInventory(prev => ({
        ...prev,
        [recipe.result]: typeof prev[recipe.result] === 'number' 
          ? (prev[recipe.result] as number) + 1 
          : true
      }));
      return true;
    }
    return false;
  }, [meat, fur, wood, stone]);

  const handleUseBandage = useCallback(() => {
    if (inventory.bandages > 0 && health < 100) {
      setInventory(prev => ({ ...prev, bandages: prev.bandages - 1 }));
      setHealth(prev => Math.min(100, prev + 40));
    }
  }, [inventory.bandages, health]);

  const onPlaceStructure = useCallback((type: 'SHELTER' | 'FIRE', position: [number, number, number]) => {
    const uniqueId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setStructures(prev => [...prev, { id: uniqueId, type, position }]);
    // Consume the item from inventory
    setInventory(prev => ({ ...prev, [type.toLowerCase()]: false }));
  }, []);

  return (
    <SoundProvider weather={weather}>
      <div className="relative w-full h-screen bg-black overflow-hidden">
        <VisualEffectsOverlay />
        
        {mode === GameMode.MENU ? (
          <MainMenu 
            onStartSolo={() => setMode(GameMode.SOLO)} 
            onStartMultiplayer={(id) => {
              setRoomId(id);
              setMode(GameMode.MULTIPLAYER);
            }}
            onOpenTutorial={() => setShowTutorial(true)}
          />
        ) : (
          <>
            {!isGameStarted && (
              <LoadingScreen isReady={true} onStarted={() => {
                setIsGameStarted(true);
                setShowTutorial(true);
              }} />
            )}

            <GameScene 
              weather={weather}
              timeOfDay={timeOfDay}
              onPlayerUpdate={onPlayerUpdate}
              onResourcesCollected={onResourcesCollected}
              onDamagePlayer={(amount) => setHealth(h => Math.max(0, h - amount))}
              joystickVector={joystickVector}
              isMobile={isMobile}
              hasSharpenedStick={inventory.sharpenedStick}
              hasTorch={inventory.torch}
              hasShelter={inventory.shelter}
              hasFire={inventory.fire}
              wood={wood}
              structures={structures}
              isInventoryOpen={isInventoryOpen}
              isTutorialOpen={showTutorial}
              roomId={roomId}
              onPlaceStructure={onPlaceStructure}
              onCrouchToggle={(v) => setIsCrouching(v)}
            />
            
            {isGameStarted && (
              <>
                <HUD 
                  hunger={hunger} 
                  health={health} 
                  meat={meat} 
                  weather={weather}
                  timeOfDay={timeOfDay}
                  isCrouching={isCrouching}
                  hasShelter={inventory.shelter}
                  hasFire={inventory.fire}
                  roomId={roomId}
                  onEat={handleEat}
                  onOpenInventory={() => setIsInventoryOpen(true)}
                  onOpenTutorial={() => setShowTutorial(true)}
                />

                <Inventory 
                  isOpen={isInventoryOpen}
                  onClose={() => setIsInventoryOpen(false)}
                  meat={meat}
                  fur={fur}
                  wood={wood}
                  stone={stone}
                  inventory={inventory}
                  onEat={handleEat}
                  onCraft={handleCraft}
                  onUseBandage={handleUseBandage}
                  hunger={hunger}
                  health={health}
                />

                {isMobile && (
                  <MobileControls 
                    onEat={handleEat}
                    onOpenInventory={() => setIsInventoryOpen(true)}
                    onJoystickMove={(v) => { joystickVector.current = v; }}
                    onCollect={() => {
                       // Fix: Access window and event constructors via any cast
                       (window as any).dispatchEvent(new (window as any).KeyboardEvent('keydown', { code: 'KeyE' }));
                       setTimeout(() => (window as any).dispatchEvent(new (window as any).KeyboardEvent('keyup', { code: 'KeyE' })), 100);
                    }} 
                  />
                )}

                {health <= 0 && (
                  <div className="fixed inset-0 bg-red-900/80 flex flex-col items-center justify-center z-[110] animate-pulse">
                    <h1 className="text-6xl font-black text-white mb-8 tracking-tighter">{t.death.title}</h1>
                    <button 
                      // Fix: Access window location via any cast
                      onClick={() => (window as any).location.reload()}
                      className="px-8 py-3 bg-white text-red-900 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t.death.retry}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {showTutorial && (
          <Tutorial onClose={() => setShowTutorial(false)} />
        )}
      </div>
    </SoundProvider>
  );
};

export default App;