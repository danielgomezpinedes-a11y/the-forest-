
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimalData, TreeData } from '../types';
import { useSounds } from './SoundManager';

interface PlayerProps {
  onUpdate: (height: number, position?: [number, number, number], rotation?: [number, number, number]) => void;
  animals: AnimalData[];
  trees: TreeData[];
  animalPositions: React.RefObject<Map<string, THREE.Vector3>>;
  onDamageAnimal: (id: string, damage: number) => void;
  onDamageTree: (id: string, damage: number) => void;
  onCollectAnimal: (id: string) => void;
  onAttackChange?: (isAttacking: boolean) => void;
  joystickVector?: React.RefObject<{ x: number, y: number }>;
  isMobile: boolean;
  hasSharpenedStick: boolean;
  hasTorch: boolean;
  hasShelter: boolean;
  hasFire: boolean;
  wood: number;
  onPlaceStructure: (type: 'SHELTER' | 'FIRE', position: [number, number, number]) => void;
  onCrouchToggle: (v: boolean) => void;
}

const Player: React.FC<PlayerProps> = ({ onUpdate, animals, trees, animalPositions, onDamageAnimal, onDamageTree, onCollectAnimal, onAttackChange, joystickVector, isMobile, hasSharpenedStick, hasTorch, hasShelter, hasFire, wood, onPlaceStructure, onCrouchToggle }) => {
  const { camera } = useThree();
  const { playSound } = useSounds();
  const stepTimer = useRef(0);
  const heightUpdateCounter = useRef(0);
  const weaponGroupRef = useRef<THREE.Group>(null);
  const weaponMeshRef = useRef<THREE.Mesh>(null);
  const visualGroupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  
  const [ref, api] = useSphere(() => ({
    mass: 2,
    type: 'Dynamic',
    position: [0, 1, 0], 
    args: [0.7],
    fixedRotation: true,
    allowSleep: false,
    linearDamping: 0.5, // Reduced for more responsive movement
    friction: 0.1,
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const pos = useRef([0, 1, 0]);
  useEffect(() => api.position.subscribe((p) => (pos.current = p)), [api.position]);

  const [isCrouching, setIsCrouching] = useState(false);
  const currentEyeHeight = useRef(1.2);
  const [isAttacking, setIsAttacking] = useState(false);
  const attackAnimTime = useRef(0);
  const bobTime = useRef(0);

  const animalsRef = useRef(animals);
  useEffect(() => { animalsRef.current = animals; }, [animals]);

  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Mobile rotation state
  const mobileRotation = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    // Sync initial rotation
    mobileRotation.current.x = camera.rotation.x;
    mobileRotation.current.y = camera.rotation.y;
  }, [camera]);

  useEffect(() => {
    const handleTeleport = (e: any) => {
      const { position } = e.detail;
      if (position) {
        api.position.set(position[0], position[1], position[2]);
        api.velocity.set(0, 0, 0);
      }
    };
    (window as any).addEventListener('player:teleport', handleTeleport);
    return () => (window as any).removeEventListener('player:teleport', handleTeleport);
  }, [api]);

  const handleAttack = useCallback(() => {
    if (isAttacking) return;
    setIsAttacking(true);
    onAttackChange?.(true);
    attackAnimTime.current = 0;
    playSound('attack');
    
    const playerPos = new THREE.Vector3(...pos.current);
    const lookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    
    // Check animals
    animalsRef.current.forEach(animal => {
      const actualPos = animalPositions.current?.get(animal.id);
      if (!actualPos || animal.isDead) return;

      const distSq = playerPos.distanceToSquared(actualPos);
      if (distSq < 20.25) { // 4.5^2
        const toAnimal = new THREE.Vector3().subVectors(actualPos, playerPos).normalize();
        const dot = lookDir.dot(toAnimal);
        if (dot > 0.4) {
            // Immediate feedback
            playSound('hit');
            (window as any).dispatchEvent(new CustomEvent('vfx:hit', { 
                detail: { position: [actualPos.x, actualPos.y, actualPos.z] } 
            }));
            
            let damage = 5; // Punch damage
            if (hasSharpenedStick) {
                damage = 50;
            } else if (wood > 0) {
                damage = 25;
            }
            onDamageAnimal(animal.id, damage);
        }
      }
    });

    // Check trees
    trees.forEach(tree => {
        const actualPos = animalPositions.current?.get(tree.id);
        if (!actualPos) return;

        const distSq = playerPos.distanceToSquared(actualPos);
        if (distSq < 36) { // 6^2 for large trees
            const toTree = new THREE.Vector3().subVectors(actualPos, playerPos).normalize();
            const dot = lookDir.dot(toTree);
            if (dot > 0.4) {
                playSound('wood');
                (window as any).dispatchEvent(new CustomEvent('vfx:hit', { 
                    detail: { position: [actualPos.x, actualPos.y + 2, actualPos.z] } 
                }));
                
                let damage = 10; // Punch damage to tree
                if (hasSharpenedStick) {
                    damage = 35;
                } else if (wood > 0) {
                    damage = 20;
                }
                onDamageTree(tree.id, damage);
            }
        }
    });

    // Check other collectibles (wood, stone, dead animals)
    animalPositions.current?.forEach((actualPos, id) => {
        // If it's an alive animal, we already handled it
        const isAliveAnimal = animalsRef.current.some(a => a.id === id && !a.isDead);
        if (isAliveAnimal) return;

        const distSq = playerPos.distanceToSquared(actualPos);
        if (distSq < 9) { // 3^2 for resources
            const toObj = new THREE.Vector3().subVectors(actualPos, playerPos).normalize();
            const dot = lookDir.dot(toObj);
            if (dot > 0.4) {
                // Immediate feedback
                playSound('collect');
                (window as any).dispatchEvent(new CustomEvent('vfx:hit', { 
                    detail: { position: [actualPos.x, actualPos.y, actualPos.z] } 
                }));
                onCollectAnimal(id);
            }
        }
    });

    setTimeout(() => {
      setIsAttacking(false);
      onAttackChange?.(false);
    }, 350);
  }, [isAttacking, onDamageAnimal, playSound, camera, animalPositions, onAttackChange]);

  const handleInteraction = useCallback(() => {
    const playerPos = new THREE.Vector3(...pos.current);
    animalPositions.current?.forEach((actualPos, id) => {
        if (playerPos.distanceToSquared(actualPos) < 9) {
            playSound('collect');
            onCollectAnimal(id);
        }
    });
  }, [onCollectAnimal, playSound, animalPositions]);

  useEffect(() => {
    const onKeyDown = (e: any) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyE') handleInteraction();
      if (e.code === 'KeyB') {
        if (hasShelter) {
          const placePos: [number, number, number] = [
            pos.current[0] + Math.sin(camera.rotation.y) * 4,
            0,
            pos.current[2] + Math.cos(camera.rotation.y) * 4
          ];
          onPlaceStructure('SHELTER', placePos);
          playSound('wood');
        }
      }
      if (e.code === 'KeyF') {
        if (hasFire) {
          const placePos: [number, number, number] = [
            pos.current[0] + Math.sin(camera.rotation.y) * 2,
            0,
            pos.current[2] + Math.cos(camera.rotation.y) * 2
          ];
          onPlaceStructure('FIRE', placePos);
          playSound('stone');
        }
      }
      if (e.code === 'KeyC' || e.code === 'ControlLeft') {
          setIsCrouching(prev => {
              const next = !prev;
              onCrouchToggle(next);
              return next;
          });
      }
    };
    const onKeyUp = (e: any) => (keys.current[e.code] = false);
    const onMouseDown = (e: any) => {
        if (e.button === 0) handleAttack();
    };

    const onTouchStart = (e: TouchEvent) => {
      // Only handle touches on the right half of the screen for rotation
      const touch = e.touches[0];
      if (touch.clientX > window.innerWidth / 2) {
        lastTouch.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!lastTouch.current) return;
      
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouch.current.x;
      const dy = touch.clientY - lastTouch.current.y;
      
      // Update rotation (sensitivity adjustment)
      const sensitivity = 0.005;
      mobileRotation.current.y -= dx * sensitivity;
      mobileRotation.current.x -= dy * sensitivity;
      
      // Clamp vertical rotation
      mobileRotation.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, mobileRotation.current.x));
      
      lastTouch.current = { x: touch.clientX, y: touch.clientY };
    };

    const onTouchEnd = () => {
      lastTouch.current = null;
    };

    (window as any).addEventListener('keydown', onKeyDown);
    (window as any).addEventListener('keyup', onKeyUp);
    (window as any).addEventListener('mousedown', onMouseDown);
    (window as any).addEventListener('touchstart', onTouchStart);
    (window as any).addEventListener('touchmove', onTouchMove);
    (window as any).addEventListener('touchend', onTouchEnd);
    
    return () => {
      (window as any).removeEventListener('keydown', onKeyDown);
      (window as any).removeEventListener('keyup', onKeyUp);
      (window as any).removeEventListener('mousedown', onMouseDown);
      (window as any).removeEventListener('touchstart', onTouchStart);
      (window as any).removeEventListener('touchmove', onTouchMove);
      (window as any).removeEventListener('touchend', onTouchEnd);
    };
  }, [handleAttack, handleInteraction]);

  useFrame((state, delta) => {
    const { forward, backward, left, right, jump, shift } = {
      forward: keys.current['KeyW'],
      backward: keys.current['KeyS'],
      left: keys.current['KeyA'],
      right: keys.current['KeyD'],
      jump: keys.current['Space'],
      shift: keys.current['ShiftLeft'],
    };

    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(backward) - Number(forward));
    const sideVector = new THREE.Vector3(Number(left) - Number(right), 0, 0);

    if (joystickVector?.current && (Math.abs(joystickVector.current.x) > 0.1 || Math.abs(joystickVector.current.y) > 0.1)) {
        frontVector.z = -joystickVector.current.y;
        sideVector.x = -joystickVector.current.x;
    }

    direction.subVectors(frontVector, sideVector).normalize().applyQuaternion(camera.quaternion);
    direction.y = 0;
    direction.normalize();

    const isRunning = shift || (joystickVector?.current && Math.abs(joystickVector.current.y) > 0.8);
    let speed = isRunning ? 35 : 15; // Increased significantly for the 10km mountain
    if (isCrouching) speed *= 0.4;
    
    const isMoving = direction.length() > 0.1;
    if (isMoving) {
        api.velocity.set(direction.x * speed, velocity.current[1], direction.z * speed);
        
        // Footsteps and Bobbing
        if (Math.abs(velocity.current[1]) < 0.2) {
            const bobSpeed = isRunning ? 12 : 8;
            bobTime.current += delta * bobSpeed;
            stepTimer.current += delta * (isRunning ? 2.5 : 1.4);
            
            if (stepTimer.current > 0.5) {
                playSound('step');
                stepTimer.current = 0;
            }
        }
    } else {
        // Smoother stop
        api.velocity.set(velocity.current[0] * 0.7, velocity.current[1], velocity.current[2] * 0.7);
        bobTime.current = THREE.MathUtils.lerp(bobTime.current, 0, 0.1);
    }

    if (jump && Math.abs(velocity.current[1]) < 0.2) {
      playSound('jump');
      api.velocity.set(velocity.current[0], 12.0, velocity.current[2]);
    }

    // Camera Bobbing
    const bobAmount = isMoving ? (isRunning ? 0.08 : (isCrouching ? 0.01 : 0.04)) : 0;
    const bobY = Math.sin(bobTime.current) * bobAmount;
    const bobX = Math.cos(bobTime.current * 0.5) * bobAmount * 0.5;

    // Apply mobile rotation
    if (isMobile && (lastTouch.current || mobileRotation.current.x !== 0 || mobileRotation.current.y !== 0)) {
      camera.rotation.set(mobileRotation.current.x, mobileRotation.current.y, 0, 'YXZ');
    }

    const eyeHeightTarget = isCrouching ? 0.6 : 1.2;
    currentEyeHeight.current = THREE.MathUtils.lerp(currentEyeHeight.current, eyeHeightTarget, 0.15);
    
    camera.position.set(
        pos.current[0] + bobX, 
        pos.current[1] + currentEyeHeight.current + bobY, 
        pos.current[2]
    );
    
    if (weaponGroupRef.current) {
        weaponGroupRef.current.position.copy(camera.position);
        weaponGroupRef.current.rotation.copy(camera.rotation);

        if (isAttacking && weaponMeshRef.current) {
            attackAnimTime.current += delta * 18;
            const t = Math.min(attackAnimTime.current, Math.PI);
            const swing = Math.sin(t);
            
            if (hasTorch) {
                // Wide horizontal swing for torch
                weaponMeshRef.current.rotation.y = swing * 1.2;
                weaponMeshRef.current.rotation.z = swing * 0.5;
                weaponMeshRef.current.position.x = 0.5 - swing * 0.8;
                weaponMeshRef.current.position.z = -0.7 - Math.cos(t) * 0.3;
            } else if (hasSharpenedStick || wood > 0) {
                // Thrusting motion for sticks
                weaponMeshRef.current.rotation.x = -swing * 0.5;
                weaponMeshRef.current.position.z = -0.7 - swing * 1.2;
                weaponMeshRef.current.position.x = 0.5 - swing * 0.2;
            }
        } else if (weaponMeshRef.current) {
            weaponMeshRef.current.rotation.x = THREE.MathUtils.lerp(weaponMeshRef.current.rotation.x, 0, 0.15);
            weaponMeshRef.current.rotation.y = THREE.MathUtils.lerp(weaponMeshRef.current.rotation.y, 0, 0.15);
            weaponMeshRef.current.rotation.z = THREE.MathUtils.lerp(weaponMeshRef.current.rotation.z, 0, 0.15);
            weaponMeshRef.current.position.z = THREE.MathUtils.lerp(weaponMeshRef.current.position.z, -0.7, 0.15);
            weaponMeshRef.current.position.x = THREE.MathUtils.lerp(weaponMeshRef.current.position.x, 0.5, 0.15);
        }
    }

    if (visualGroupRef.current) {
        visualGroupRef.current.position.set(pos.current[0], pos.current[1], pos.current[2]);
        visualGroupRef.current.rotation.y = camera.rotation.y;

        const isJumping = velocity.current[1] > 0.5;
        const isFalling = velocity.current[1] < -0.5;

        if (isAttacking) {
            const t = Math.min(attackAnimTime.current, Math.PI);
            const swing = Math.sin(t);
            
            if (hasTorch || hasSharpenedStick || wood > 0) {
                // Right arm swing/thrust
                if (rightArmRef.current) {
                    rightArmRef.current.rotation.x = -Math.PI / 2 - swing * 1.5;
                    rightArmRef.current.rotation.y = hasTorch ? -swing * 1.2 : 0;
                }
                if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.2);
            } else {
                // Punching (alternating arms or both)
                if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 2 - swing * 2;
                if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 2 - Math.sin(t * 0.8) * 1.5;
            }
        } else if (isJumping) {
            // Jump pose: legs tucked, arms up
            if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -0.8, 0.2);
            if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.8, 0.2);
            if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.5, 0.2);
            if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.5, 0.2);
        } else if (isFalling) {
            // Falling pose: legs straight, arms out
            if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.2, 0.1);
            if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0.2, 0.1);
            if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.3, 0.1);
            if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.3, 0.1);
        } else if (isMoving) {
            const t = state.clock.elapsedTime * 10;
            if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t) * 0.5;
            if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
            if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
            if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t) * 0.5;
        } else {
            if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.2);
            if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.2);
            if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.2);
            if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.2);
        }
    }
    
    heightUpdateCounter.current++;
    if (heightUpdateCounter.current > 5) { // More frequent updates for multiplayer
        onUpdate(
          pos.current[1], 
          [pos.current[0], pos.current[1], pos.current[2]], 
          [camera.rotation.x, camera.rotation.y, camera.rotation.z]
        );
        heightUpdateCounter.current = 0;
    }
  });

  return (
    <>
      <mesh ref={ref as any}>
        <sphereGeometry args={[0.7]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group ref={visualGroupRef}>
        {/* Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.25]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>

        {/* Arms */}
        <group position={[-0.35, 0.2, 0]} ref={leftArmRef}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          <mesh position={[0, -0.45, 0]} castShadow>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>

        <group position={[0.35, 0.2, 0]} ref={rightArmRef}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          <mesh position={[0, -0.45, 0]} castShadow>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>

        {/* Legs */}
        <mesh ref={leftLegRef} position={[-0.15, -0.7, 0]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.18]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        <mesh ref={rightLegRef} position={[0.15, -0.7, 0]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.18]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      </group>
      
      {(hasSharpenedStick || wood > 0) && (
        <group ref={weaponGroupRef}>
          <mesh 
            ref={weaponMeshRef}
            position={[0.5, -0.4, -0.7]} 
            castShadow
          >
            <boxGeometry args={[0.12, 0.12, 1.2]} />
            <meshStandardMaterial color={hasSharpenedStick ? "#8b4513" : "#5c4033"} roughness={0.9} metalness={0.1} />
            
            {hasTorch && (
              <group position={[0, 0, -0.5]}>
                <mesh>
                  <sphereGeometry args={[0.15]} />
                  <meshBasicMaterial color="#ffaa00" />
                </mesh>
                <pointLight intensity={2} distance={15} color="#ffaa00" castShadow />
              </group>
            )}
          </mesh>
        </group>
      )}
    </>
  );
};

export default Player;
