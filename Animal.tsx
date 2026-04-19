
import React, { useRef, useEffect, useState, memo } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimalData, AnimalType } from '../types';
import { useSounds } from './SoundManager';

interface AnimalProps {
  data: AnimalData;
  allAnimals: AnimalData[];
  timeOfDay: number;
  onUpdatePos?: (pos: THREE.Vector3) => void;
  onDamagePlayer?: (amount: number) => void;
}

const Animal: React.FC<AnimalProps> = memo(({ data, allAnimals, timeOfDay, onUpdatePos, onDamagePlayer }) => {
  const { playSound } = useSounds();
  const lastAttackTime = useRef(0);
  const [ref, api] = useBox(() => ({
    mass: data.isDead ? 0 : 1,
    position: data.position as [number, number, number],
    args: data.type === AnimalType.RABBIT ? [0.6, 0.4, 0.6] : (data.type === AnimalType.BEAR ? [1.5, 1.2, 1.5] : [1.0, 0.8, 1.0]),
    type: data.isDead ? 'Static' : 'Dynamic',
    collisionResponse: true,
    fixedRotation: true, // Prevent physics from rotating the animal
  }));

  const headRef = useRef<THREE.Group>(null);
  const legFLRef = useRef<THREE.Mesh>(null);
  const legFRRef = useRef<THREE.Mesh>(null);
  const legBLRef = useRef<THREE.Mesh>(null);
  const legBRRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const visualGroupRef = useRef<THREE.Group>(null);

  const timer = useRef(0);
  const velocity = useRef([0, 0, 0]);
  const pos = useRef(new THREE.Vector3(...data.position));
  const walkCycle = useRef(0);
  const targetAngle = useRef(Math.random() * Math.PI * 2);
  const isMoving = useRef(true); // Start moving immediately
  const isFleeing = useRef(false);
  
  useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => {
      pos.current.set(p[0], p[1], p[2]);
      if (onUpdatePos) {
        onUpdatePos(new THREE.Vector3(p[0], p[1], p[2]));
      }
    });
    return unsubscribe;
  }, [api.position, onUpdatePos]);

  useEffect(() => {
    const unsubscribe = api.velocity.subscribe(v => velocity.current = v);
    return unsubscribe;
  }, [api.velocity]);

  const footstepTimer = useRef(0);
  const [tracks, setTracks] = useState<{ id: number, pos: [number, number, number], rot: number }[]>([]);

  useFrame((state, delta) => {
    if (data.isDead) return;
    
    const { camera } = state;
    const distToPlayer = pos.current.distanceTo(camera.position);
    
    timer.current += delta;
    
    // Animation logic & Speed calculation
    const vx = velocity.current[0];
    const vz = velocity.current[2];
    const currentSpeed = Math.sqrt(vx * vx + vz * vz);

    // Track generation
    if (currentSpeed > 0.5) {
      footstepTimer.current += delta;
      if (footstepTimer.current > 1.2 / currentSpeed) {
        setTracks(prev => [
          ...prev.slice(-15), 
          { id: Math.random(), pos: [pos.current.x, 0.02, pos.current.z], rot: visualGroupRef.current?.rotation.y || 0 }
        ]);
        footstepTimer.current = 0;
      }
    }
    
    // AI Movement logic
    const isCrouching = camera.position.y - pos.current.y < 1.0;
    const detectionRange = (data.type === AnimalType.RABBIT ? 15 : 30) * (isCrouching ? 0.4 : 1.0);
    const isNight = timeOfDay < 6 || timeOfDay > 19;
    const isAggressive = data.type === AnimalType.WOLF || data.type === AnimalType.BEAR;
    
    // Pack logic for wolves
    const packMates = data.type === AnimalType.WOLF 
        ? allAnimals.filter(a => a.type === AnimalType.WOLF && a.id !== data.id && !a.isDead)
        : [];

    if (distToPlayer < detectionRange) {
        if (data.type === AnimalType.RABBIT) {
            isFleeing.current = true;
            const dir = new THREE.Vector3().subVectors(pos.current, camera.position).normalize();
            targetAngle.current = Math.atan2(dir.x, dir.z);
        } else if (isAggressive) {
            // Aggressive behavior
            isFleeing.current = false;
            isMoving.current = true;
            
            // Turn towards player
            const dir = new THREE.Vector3().subVectors(camera.position, pos.current).normalize();
            targetAngle.current = Math.atan2(dir.x, dir.z);

            // Attack if close enough
            const attackRange = data.type === AnimalType.BEAR ? 2.5 : 2.0;
            if (distToPlayer < attackRange && state.clock.elapsedTime - lastAttackTime.current > 2) {
                if (onDamagePlayer) {
                    onDamagePlayer(data.type === AnimalType.BEAR ? 25 : 15);
                    lastAttackTime.current = state.clock.elapsedTime;
                    
                    // Play attack sound
                    if (data.type === AnimalType.BEAR) playSound('bear');
                    else playSound('wolf');
                }
            }
        }
    } else if (data.type === AnimalType.WOLF && packMates.length > 0) {
        // Pack behavior: try to stay near pack mates
        const nearestPackMate = packMates.reduce((prev, curr) => {
            const prevDist = pos.current.distanceTo(new THREE.Vector3(...curr.position));
            const currDist = pos.current.distanceTo(new THREE.Vector3(...curr.position));
            return currDist < prevDist ? curr : prev;
        });
        
        const matePos = new THREE.Vector3(...nearestPackMate.position);
        if (pos.current.distanceTo(matePos) > 15) {
            const dir = new THREE.Vector3().subVectors(matePos, pos.current).normalize();
            targetAngle.current = Math.atan2(dir.x, dir.z);
            isMoving.current = true;
        }
    }

    if (timer.current > 3 + Math.random() * 2) {
      if (distToPlayer >= detectionRange) {
        isFleeing.current = false;
        isMoving.current = Math.random() > 0.2;
        if (isMoving.current) {
          targetAngle.current = Math.random() * Math.PI * 2;
        }
      }
      timer.current = 0;
    }

    if (isMoving.current) {
      let speed = data.type === AnimalType.RABBIT ? 3 : (data.type === AnimalType.WOLF ? 4.5 : 2);
      if (isFleeing.current) speed *= 2;
      
      if (isNight && (data.type === AnimalType.WOLF || data.type === AnimalType.BEAR)) {
        speed *= 1.5;
      }
      
      api.velocity.set(
        Math.sin(targetAngle.current) * speed, 
        velocity.current[1], 
        Math.cos(targetAngle.current) * speed
      );
    } else {
      api.velocity.set(velocity.current[0] * 0.9, velocity.current[1], velocity.current[2] * 0.9);
    }
    
    if (currentSpeed > 0.2) {
      // Smoothly rotate visual group to face movement direction
      const moveAngle = Math.atan2(vx, vz);
      if (visualGroupRef.current) {
        let diff = moveAngle - visualGroupRef.current.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        visualGroupRef.current.rotation.y += diff * 0.15;
      }

      // Leg animation
      walkCycle.current += delta * currentSpeed * 5;
      const legSwing = Math.sin(walkCycle.current) * 0.6;
      
      if (legFLRef.current) legFLRef.current.rotation.x = legSwing;
      if (legFRRef.current) legFRRef.current.rotation.x = -legSwing;
      if (legBLRef.current) legBLRef.current.rotation.x = -legSwing;
      if (legBRRef.current) legBRRef.current.rotation.x = legSwing;

      // Body bobbing
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.cos(walkCycle.current * 2)) * 0.08;
      }
      
      // Head movement while walking
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(walkCycle.current * 2) * 0.05;
      }
    } else {
      // Idle animations
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.4;
        headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      }
      // Reset legs smoothly
      const resetSpeed = 0.1;
      if (legFLRef.current) legFLRef.current.rotation.x = THREE.MathUtils.lerp(legFLRef.current.rotation.x, 0, resetSpeed);
      if (legFRRef.current) legFRRef.current.rotation.x = THREE.MathUtils.lerp(legFRRef.current.rotation.x, 0, resetSpeed);
      if (legBLRef.current) legBLRef.current.rotation.x = THREE.MathUtils.lerp(legBLRef.current.rotation.x, 0, resetSpeed);
      if (legBRRef.current) legBRRef.current.rotation.x = THREE.MathUtils.lerp(legBRRef.current.rotation.x, 0, resetSpeed);
    }
  });

  const getModel = () => {
    const isRabbit = data.type === AnimalType.RABBIT;
    const isBear = data.type === AnimalType.BEAR;
    
    const color = data.isDead ? "#444" : (isRabbit ? "#eee" : (isBear ? "#5c4033" : "#777"));
    
    // Dimensions
    const bW = isRabbit ? 0.3 : (isBear ? 1.0 : 0.6);
    const bH = isRabbit ? 0.2 : (isBear ? 0.8 : 0.5);
    const bD = isRabbit ? 0.5 : (isBear ? 1.4 : 0.9);
    
    const hS = isRabbit ? 0.2 : (isBear ? 0.6 : 0.4);
    const lW = isRabbit ? 0.08 : (isBear ? 0.25 : 0.15);
    const lH = isRabbit ? 0.2 : (isBear ? 0.5 : 0.4);

    return (
      <group ref={visualGroupRef}>
        {/* Body */}
        <group ref={bodyRef}>
          <mesh castShadow receiveShadow position={[0, lH + bH/2, 0]}>
            <boxGeometry args={[bW, bH, bD]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Head */}
          <group ref={headRef} position={[0, lH + bH * 0.8, bD/2]}>
            <mesh castShadow receiveShadow position={[0, 0, hS/2]}>
              <boxGeometry args={[hS, hS, hS]} />
              <meshStandardMaterial color={color} />
            </mesh>
            
            {/* Eyes */}
            {!data.isDead && (
              <>
                <mesh position={[hS * 0.25, hS * 0.1, hS + 0.01]}>
                  <boxGeometry args={[hS * 0.15, hS * 0.15, 0.05]} />
                  <meshStandardMaterial color="#000" />
                </mesh>
                <mesh position={[-hS * 0.25, hS * 0.1, hS + 0.01]}>
                  <boxGeometry args={[hS * 0.15, hS * 0.15, 0.05]} />
                  <meshStandardMaterial color="#000" />
                </mesh>
              </>
            )}

            {/* Snout / Mouth */}
            <mesh position={[0, -hS * 0.15, hS + 0.05]}>
              <boxGeometry args={[hS * 0.4, hS * 0.3, hS * 0.2]} />
              <meshStandardMaterial color={isBear ? "#3d2b22" : (isRabbit ? "#ffc0cb" : "#555")} />
            </mesh>

            {/* Ears for Rabbit */}
            {isRabbit && (
              <>
                <mesh position={[0.05, hS/2 + 0.1, 0]}>
                  <boxGeometry args={[0.05, 0.3, 0.05]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[-0.05, hS/2 + 0.1, 0]}>
                  <boxGeometry args={[0.05, 0.3, 0.05]} />
                  <meshStandardMaterial color={color} />
                </mesh>
              </>
            )}
          </group>
        </group>

        {/* Legs */}
        <mesh ref={legFLRef} castShadow position={[bW/2 - lW/2, lH/2, bD/2 - lW/2]}>
          <boxGeometry args={[lW, lH, lW]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh ref={legFRRef} castShadow position={[-bW/2 + lW/2, lH/2, bD/2 - lW/2]}>
          <boxGeometry args={[lW, lH, lW]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh ref={legBLRef} castShadow position={[bW/2 - lW/2, lH/2, -bD/2 + lW/2]}>
          <boxGeometry args={[lW, lH, lW]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh ref={legBRRef} castShadow position={[-bW/2 + lW/2, lH/2, -bD/2 + lW/2]}>
          <boxGeometry args={[lW, lH, lW]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  };

  return (
    <group>
      {/* Tracks */}
      {tracks.map(track => (
        <mesh key={track.id} position={track.pos} rotation={[-Math.PI / 2, 0, track.rot]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial color="#000" transparent opacity={0.2} />
        </mesh>
      ))}
      
      <group ref={ref as any}>
        {getModel()}
      </group>
    </group>
  );
});

// Fix: Add default export to resolve "no default export" error in GameScene.tsx (Line 9 in GameScene.tsx)
export default Animal;
