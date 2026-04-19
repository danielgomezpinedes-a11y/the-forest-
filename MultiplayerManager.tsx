
import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RemotePlayer } from '../types';

interface MultiplayerManagerProps {
  roomId: string;
  playerPosition: [number, number, number];
  playerRotation: [number, number, number];
  isAttacking: boolean;
  weaponType: 'NONE' | 'STICK' | 'SHARPENED_STICK' | 'TORCH';
  onRemoteAction?: (playerId: string, action: string, payload: any) => void;
}

const MultiplayerManager: React.FC<MultiplayerManagerProps> = ({ 
  roomId, 
  playerPosition, 
  playerRotation, 
  isAttacking, 
  weaponType,
  onRemoteAction 
}) => {
  const [remotePlayers, setRemotePlayers] = useState<Map<string, RemotePlayer>>(new Map());
  const socketRef = useRef<Socket | null>(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("join-room", roomId);
    });

    socket.on("room-state", (players: { [key: string]: RemotePlayer }) => {
      const newPlayers = new Map<string, RemotePlayer>();
      Object.entries(players).forEach(([id, player]) => {
        if (id !== socket.id) {
          newPlayers.set(id, player);
        }
      });
      setRemotePlayers(newPlayers);
    });

    socket.on("player-joined", (player: RemotePlayer) => {
      setRemotePlayers(prev => {
        const next = new Map(prev);
        next.set(player.id, player);
        return next;
      });
    });

    socket.on("player-updated", (player: RemotePlayer) => {
      setRemotePlayers(prev => {
        const next = new Map(prev);
        next.set(player.id, player);
        return next;
      });
    });

    socket.on("player-left", (playerId: string) => {
      setRemotePlayers(prev => {
        const next = new Map(prev);
        next.delete(playerId);
        return next;
      });
    });

    socket.on("remote-action", (data: { playerId: string, action: string, payload: any }) => {
      onRemoteAction?.(data.playerId, data.action, data.payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, onRemoteAction]);

  // Send updates to server
  useFrame((state, delta) => {
    const now = state.clock.getElapsedTime();
    if (now - lastUpdateRef.current > 0.05) { // 20Hz update rate
      lastUpdateRef.current = now;
      if (socketRef.current?.connected) {
        socketRef.current.emit("update-player", {
          roomId,
          state: {
            position: playerPosition,
            rotation: playerRotation,
            isAttacking,
            weaponType
          }
        });
      }
    }
  });

  return (
    <group>
      {Array.from(remotePlayers.values()).map((player) => (
        <OtherPlayer key={player.id} data={player} />
      ))}
    </group>
  );
};

const OtherPlayer = ({ data }: { data: RemotePlayer }) => {
  const meshRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  
  const lastY = useRef(data.position[1]);
  const attackTime = useRef(0);
  
  // Smooth interpolation and animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetPos = new THREE.Vector3(...data.position);
      const currentPos = meshRef.current.position.clone();
      meshRef.current.position.lerp(targetPos, 0.2);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, data.rotation[1], 0.2);
      
      const vY = data.position[1] - lastY.current;
      lastY.current = data.position[1];

      const isJumping = vY > 0.05;
      const isFalling = vY < -0.05;

      // Update attack animation timer
      if (data.isAttacking) {
        attackTime.current += delta * 18;
      } else {
        attackTime.current = 0;
      }

      // Simple walking animation if moving
      const speed = currentPos.distanceTo(targetPos);
      
      if (data.isAttacking) {
        const t = Math.min(attackTime.current, Math.PI);
        const swing = Math.sin(t);
        
        if (data.weaponType !== 'NONE') {
            // Weapon attack pose
            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = -Math.PI / 2 - swing * 1.5;
                rightArmRef.current.rotation.y = data.weaponType === 'TORCH' ? -swing * 1.2 : 0;
            }
            if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.2);
        } else {
            // Punching pose
            if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 2 - swing * 2;
            if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 2 - Math.sin(t * 0.8) * 1.5;
        }
      } else if (isJumping) {
        if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -0.8, 0.2);
        if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.8, 0.2);
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.5, 0.2);
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.5, 0.2);
      } else if (isFalling) {
        if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.2, 0.1);
        if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0.2, 0.1);
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.3, 0.1);
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.3, 0.1);
      } else if (speed > 0.01) {
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
  });

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.25]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Arms */}
      <group position={[-0.35, 1.2, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.45, 0]} castShadow>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      </group>

      <group position={[0.35, 1.2, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.45, 0]} castShadow>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        
        {/* Weapon attached to right hand */}
        {data.weaponType !== 'NONE' && (
          <group position={[0, -0.4, -0.3]} rotation={[data.isAttacking ? -Math.PI / 2 : 0, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.08, 0.8]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            {data.weaponType === 'TORCH' && (
              <pointLight intensity={1} distance={5} color="#ffaa00" position={[0, 0, -0.4]} />
            )}
          </group>
        )}
      </group>

      {/* Legs */}
      <mesh ref={leftLegRef} position={[-0.15, 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh ref={rightLegRef} position={[0.15, 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Name tag (Optional) */}
      <group position={[0, 2.2, 0]}>
      </group>
    </group>
  );
};

export default MultiplayerManager;
