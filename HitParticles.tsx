
import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  color: string;
}

const HitParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const handleHit = (e: any) => {
      const position = e.detail?.position;
      if (!position) return;
      
      const newParticles: Particle[] = [];
      
      // Spawn 10-15 particles
      const count = 10 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: nextId.current++,
          position: new THREE.Vector3(...position),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.2,
            (Math.random() - 0.5) * 0.2
          ),
          life: 1.0,
          color: Math.random() > 0.5 ? '#ff4444' : '#ffffff'
        });
      }
      
      setParticles(prev => [...prev, ...newParticles]);
    };

    (window as any).addEventListener('vfx:hit', handleHit);
    return () => (window as any).removeEventListener('vfx:hit', handleHit);
  }, []);

  useFrame((state, delta) => {
    if (particles.length === 0) return;

    setParticles(prev => {
      const updated = prev.map(p => {
        p.position.add(p.velocity.clone().multiplyScalar(delta * 60));
        p.velocity.y -= 0.005 * delta * 60; // gravity
        p.life -= delta * 2;
        return p;
      }).filter(p => p.life > 0);
      
      return updated.length === prev.length ? prev : updated;
    });
  });

  return (
    <>
      {particles.map(p => (
        <mesh key={p.id} position={p.position}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial 
            color={p.color} 
            transparent 
            opacity={p.life} 
            emissive={p.color}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </>
  );
};

export default HitParticles;
