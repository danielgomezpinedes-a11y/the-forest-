
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WeatherType } from '../types';

interface WeatherEffectsProps {
  weather: WeatherType;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ weather }) => {
  const points = useRef<THREE.Points>(null);
  const count = 600; // Reducido drásticamente para fluidez
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      spd[i] = 0.15 + Math.random() * 0.25;
    }
    return [pos, spd];
  }, [count]);

  useFrame((state) => {
    if (!points.current || weather === WeatherType.CLEAR || weather === WeatherType.FOG) return;

    const playerPos = state.camera.position;
    const posArr = points.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const fallSpeed = weather === WeatherType.RAIN ? speeds[i] * 1.5 : speeds[i];
      posArr[i * 3 + 1] -= fallSpeed;

      if (posArr[i * 3 + 1] < -5) {
        posArr[i * 3 + 1] = 25;
        posArr[i * 3] = (Math.random() - 0.5) * 40;
        posArr[i * 3 + 2] = (Math.random() - 0.5) * 40;
      }
    }
    
    points.current.position.set(playerPos.x, playerPos.y, playerPos.z);
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  if (weather === WeatherType.CLEAR || weather === WeatherType.FOG) return null;

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={weather === WeatherType.RAIN ? 0.04 : 0.12}
        color={weather === WeatherType.RAIN ? "#99f" : "#fff"}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
};

export default WeatherEffects;
