
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Stars, Sky, Environment, PointerLockControls, Preload } from '@react-three/drei';
import * as THREE from 'three';
import Player from './Player';
import Mountain from './Mountain';
import Animal from './Animal';
import WoodResource from './WoodResource';
import StoneResource from './StoneResource';
import Structure from './Structure';
import MultiplayerManager from './MultiplayerManager';
import WeatherEffects from './WeatherEffects';
import HitParticles from './HitParticles';
import { GameMode, AnimalType, AnimalData, WeatherType, StructureData, TreeData } from '../types';

interface GameSceneProps {
  weather: WeatherType;
  timeOfDay: number;
  onPlayerUpdate: (height: number) => void;
  onResourcesCollected: (type: 'MEAT' | 'FUR' | 'WOOD' | 'STONE') => void;
  onDamagePlayer: (amount: number) => void;
  joystickVector: React.RefObject<{ x: number, y: number }>;
  isMobile: boolean;
  hasSharpenedStick: boolean;
  hasTorch: boolean;
  hasShelter: boolean;
  hasFire: boolean;
  wood: number;
  structures: StructureData[];
  isInventoryOpen: boolean;
  isTutorialOpen: boolean;
  roomId: string | null;
  onPlaceStructure: (type: 'SHELTER' | 'FIRE', position: [number, number, number]) => void;
  onCrouchToggle: (v: boolean) => void;
}

const GameScene: React.FC<GameSceneProps> = ({ weather, timeOfDay, onPlayerUpdate, onResourcesCollected, onDamagePlayer, joystickVector, isMobile, hasSharpenedStick, hasTorch, hasShelter, hasFire, wood, structures, isInventoryOpen, isTutorialOpen, roomId, onPlaceStructure, onCrouchToggle }) => {
  const [isLocked, setIsLocked] = useState(false);
  const controlsRef = useRef<any>(null);
  
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 1, 0]);
  const [playerRot, setPlayerRot] = useState<[number, number, number]>([0, 0, 0]);
  const [isAttacking, setIsAttacking] = useState(false);
  
  // Referencia para rastrear posiciones reales de animales (para el sistema de combate)
  const animalPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const treePositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const woodPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const stonePositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());

  useEffect(() => {
    const handleError = (e: Event) => {
      // Suppress pointer lock errors in the console as they are often expected in iframe/preview environments
      // and can be noisy when the browser blocks them due to lack of user gesture.
      if (e.type === 'pointerlockerror') {
        isLocking.current = false;
        // We can't prevent the browser from logging to console, but we can stop propagation
        e.stopPropagation();
      }
    };
    
    const onPointerLockChange = () => {
      const locked = !!document.pointerLockElement;
      setIsLocked(locked);
      if (!locked) isLocking.current = false;
    };

    document.addEventListener('pointerlockerror', handleError, true);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    
    return () => {
      document.removeEventListener('pointerlockerror', handleError, true);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
    };
  }, []);

  const isLocking = useRef(false);

  useEffect(() => {
    if ((isInventoryOpen || isTutorialOpen) && controlsRef.current && document.pointerLockElement) {
      controlsRef.current.unlock();
    }
  }, [isInventoryOpen, isTutorialOpen]);

  const handleLock = () => {
    if (isMobile || isLocked || isLocking.current || isInventoryOpen || isTutorialOpen) return;
    
    // Ensure the document has focus before requesting lock
    if (!document.hasFocus()) {
      window.focus();
    }

    if (document.pointerLockElement) {
      setIsLocked(true);
      return;
    }
    
    isLocking.current = true;
    
    // Direct call without setTimeout to ensure the user gesture is fresh
    try {
      if (controlsRef.current) {
        const promise = controlsRef.current.lock();
        // If it returns a promise (modern browsers), handle the rejection to avoid unhandled promise rejection errors
        if (promise && typeof promise.catch === 'function') {
          promise.catch((err: any) => {
            if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
              console.debug("Pointer lock blocked by browser policy");
            } else {
              console.debug("Pointer lock promise rejected:", err.message);
            }
            isLocking.current = false;
          });
        }
      }
    } catch (e) {
      console.debug("Pointer lock request failed synchronously:", e);
      isLocking.current = false;
    }
  };

  const [animals, setAnimals] = useState<AnimalData[]>([
    { id: '1', type: AnimalType.BEAR, position: [10, 0, 10], health: 100, isDead: false },
    { id: '2', type: AnimalType.BEAR, position: [-20, 5, -15], health: 100, isDead: false },
    { id: '3', type: AnimalType.WOLF, position: [30, 0, -10], health: 60, isDead: false },
    { id: '4', type: AnimalType.WOLF, position: [-5, 0, 30], health: 60, isDead: false },
    { id: '5', type: AnimalType.RABBIT, position: [5, 0, 5], health: 20, isDead: false },
    { id: '6', type: AnimalType.RABBIT, position: [-10, 0, -10], health: 20, isDead: false },
    { id: '7', type: AnimalType.RABBIT, position: [0, 0, -20], health: 20, isDead: false },
  ]);

  const [woods, setWoods] = useState<{id: string, position: [number, number, number]}[]>([
    { id: 'w1', position: [15, 0, 5] },
    { id: 'w2', position: [-15, 0, 10] },
    { id: 'w3', position: [5, 0, -15] },
    { id: 'w4', position: [-5, 0, -5] },
    { id: 'w5', position: [20, 0, 20] },
  ]);

  const [stones, setStones] = useState<{id: string, position: [number, number, number]}[]>([
    { id: 's1', position: [10, 0, -10] },
    { id: 's2', position: [-10, 0, 15] },
    { id: 's3', position: [25, 0, 0] },
    { id: 's4', position: [-25, 0, -5] },
  ]);

  const [trees, setTrees] = useState<TreeData[]>(() => {
    const initialTrees: TreeData[] = [];
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 800;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
      initialTrees.push({ 
        id: `tree-${i}`, 
        position: [x, 0, z], 
        scale: 2.5 + Math.random() * 4.5,
        health: 100 
      });
    }
    return initialTrees;
  });

  const handleAnimalDamage = (id: string, damage: number) => {
    // Dispatch hit effect event BEFORE state update to avoid side effects in updater
    const pos = animalPositionsRef.current.get(id);
    if (pos) {
      (window as any).dispatchEvent(new CustomEvent('vfx:hit', { 
        detail: { position: [pos.x, pos.y + 0.5, pos.z] } 
      }));
    }

    setAnimals(prev => prev.map(animal => {
      if (animal.id === id && !animal.isDead) {
        const newHealth = animal.health - damage;
        return { ...animal, health: newHealth, isDead: newHealth <= 0 };
      }
      return animal;
    }));
  };

  const handleTreeDamage = (id: string, damage: number) => {
    const pos = treePositionsRef.current.get(id);
    if (pos) {
      (window as any).dispatchEvent(new CustomEvent('vfx:hit', { 
        detail: { position: [pos.x, pos.y + 2, pos.z] } 
      }));
    }

    setTrees(prev => {
      const tree = prev.find(t => t.id === id);
      if (tree) {
        const newHealth = tree.health - damage;
        if (newHealth <= 0) {
          // Spawn wood resource where tree was
          const uniqueId = `wood-spawn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setWoods(w => [...w, { id: uniqueId, position: tree.position }]);
          return prev.filter(t => t.id !== id);
        }
        return prev.map(t => t.id === id ? { ...t, health: newHealth } : t);
      }
      return prev;
    });
  };

  const handleCollect = (id: string) => {
    // Check animals
    const animal = animals.find(a => a.id === id);
    if (animal && animal.isDead) {
      setAnimals(prev => prev.filter(a => a.id !== id));
      animalPositionsRef.current.delete(id);
      
      onResourcesCollected('MEAT');
      if (animal.type === AnimalType.BEAR || animal.type === AnimalType.WOLF) {
        onResourcesCollected('FUR');
      }
      return;
    }

    // Check woods
    const wood = woods.find(w => w.id === id);
    if (wood) {
      setWoods(prev => prev.filter(w => w.id !== id));
      woodPositionsRef.current.delete(id);
      onResourcesCollected('WOOD');
      return;
    }

    // Check stones
    const stone = stones.find(s => s.id === id);
    if (stone) {
      setStones(prev => prev.filter(s => s.id !== id));
      stonePositionsRef.current.delete(id);
      onResourcesCollected('STONE');
    }
  };

  // Combine positions for Player to check
  const allCollectibles = useRef<Map<string, THREE.Vector3>>(new Map());
  useEffect(() => {
    const combined = new Map<string, THREE.Vector3>();
    animalPositionsRef.current.forEach((v, k) => combined.set(k, v));
    treePositionsRef.current.forEach((v, k) => combined.set(k, v));
    woodPositionsRef.current.forEach((v, k) => combined.set(k, v));
    stonePositionsRef.current.forEach((v, k) => combined.set(k, v));
    allCollectibles.current = combined;
  });

  const getFogConfig = () => {
    const isNight = timeOfDay < 6 || timeOfDay > 19;
    const nightColor = '#050510';
    const dayColor = weather === WeatherType.CLEAR ? '#87CEEB' : '#556';

    let baseColor = dayColor;
    if (isNight) baseColor = nightColor;

    switch (weather) {
      case WeatherType.RAIN: return { color: isNight ? '#112' : '#556', near: 5, far: 200 };
      case WeatherType.FOG: return { color: isNight ? '#223' : '#889', near: 2, far: 100 };
      case WeatherType.SNOWSTORM: return { color: isNight ? '#334' : '#ccd', near: 1, far: 50 };
      default: return { color: baseColor, near: 100, far: 30000 };
    }
  };

  const getSunPosition = (time: number): [number, number, number] => {
    // 0 is midnight, 12 is noon
    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * 100;
    const y = Math.sin(angle) * 100;
    return [x, y, 0];
  };

  const sunPos = getSunPosition(timeOfDay);
  const isNight = timeOfDay < 6 || timeOfDay > 19;
  const lightIntensity = Math.max(0.1, Math.sin((timeOfDay / 24) * Math.PI * 2 - Math.PI / 2) + 0.5);
  const ambientIntensity = isNight ? 0.2 : (weather === WeatherType.CLEAR ? 0.8 : 0.4);
  const directionalIntensity = isNight ? 0.1 : (weather === WeatherType.CLEAR ? 1.2 : 0.5);

  const fog = getFogConfig();

  return (
    <div className="w-full h-full relative">
      {!isLocked && !isMobile && !isInventoryOpen && !isTutorialOpen && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto cursor-pointer"
            onClick={handleLock}
          >
              <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white font-bold animate-pulse">
                  HAZ CLIC PARA MOVERTE
              </div>
          </div>
      )}
      
      <Canvas 
        shadows={{ type: THREE.BasicShadowMap }}
        camera={{ fov: 75, near: 0.1, far: 30000 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={[getFogConfig().color, getFogConfig().near, getFogConfig().far]} />
          <Sky distance={450000} sunPosition={sunPos} inclination={0} azimuth={0.25} />
          <Stars radius={100} depth={50} count={isNight ? 5000 : 0} factor={4} />
          
          <ambientLight intensity={ambientIntensity} />
          <directionalLight position={sunPos} intensity={directionalIntensity} castShadow shadow-mapSize={[512, 512]} />
          
          <Physics gravity={[0, -9.81, 0]} tolerance={0.0001} iterations={20}>
            <Mountain 
              trees={trees} 
              onTreeUpdatePos={(id, pos) => treePositionsRef.current.set(id, pos)} 
            />
            <Player 
              onUpdate={(h, p, r) => {
                onPlayerUpdate(h);
                if (p) setPlayerPos(p);
                if (r) setPlayerRot(r);
              }} 
              animals={animals}
              trees={trees}
              animalPositions={allCollectibles}
              onDamageAnimal={handleAnimalDamage}
              onDamageTree={handleTreeDamage}
              onCollectAnimal={handleCollect}
              onAttackChange={(v) => setIsAttacking(v)}
              joystickVector={joystickVector}
              isMobile={isMobile}
              hasSharpenedStick={hasSharpenedStick}
              hasTorch={hasTorch}
              hasShelter={hasShelter}
              hasFire={hasFire}
              wood={wood}
              onPlaceStructure={onPlaceStructure}
              onCrouchToggle={onCrouchToggle}
            />
            
            {roomId && (
              <MultiplayerManager 
                roomId={roomId}
                playerPosition={playerPos}
                playerRotation={playerRot}
                isAttacking={isAttacking}
                weaponType={hasTorch ? 'TORCH' : (hasSharpenedStick ? 'SHARPENED_STICK' : (wood > 0 ? 'STICK' : 'NONE'))}
              />
            )}

            {structures.map((structure) => (
              <Structure 
                key={structure.id} 
                type={structure.type} 
                position={structure.position} 
              />
            ))}

            {animals.map((animal) => (
              <Animal 
                key={animal.id} 
                data={animal} 
                allAnimals={animals}
                timeOfDay={timeOfDay}
                onUpdatePos={(pos) => animalPositionsRef.current.set(animal.id, pos)} 
                onDamagePlayer={onDamagePlayer}
              />
            ))}

            {woods.map((wood) => (
              <WoodResource 
                key={wood.id}
                position={wood.position}
                onCollect={() => handleCollect(wood.id)}
                onUpdatePos={(pos) => woodPositionsRef.current.set(wood.id, pos)}
              />
            ))}

            {stones.map((stone) => (
              <StoneResource 
                key={stone.id}
                position={stone.position}
                onCollect={() => handleCollect(stone.id)}
                onUpdatePos={(pos) => stonePositionsRef.current.set(stone.id, pos)}
              />
            ))}

          </Physics>

          <HitParticles />

          <WeatherEffects weather={weather} />

          {!isMobile && (
            <PointerLockControls 
              ref={controlsRef}
              onLock={() => setIsLocked(true)} 
              onUnlock={() => setIsLocked(false)} 
            />
          )}
          <Environment preset={isNight ? "night" : "forest"} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GameScene;
