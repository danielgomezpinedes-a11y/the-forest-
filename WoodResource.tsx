
import React, { useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { TreePine } from 'lucide-react';
import * as THREE from 'three';

interface WoodResourceProps {
  position: [number, number, number];
  onCollect: () => void;
  onUpdatePos: (pos: THREE.Vector3) => void;
}

const WoodResource: React.FC<WoodResourceProps> = ({ position, onCollect, onUpdatePos }) => {
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: [1, 0.5, 1],
    onCollide: (e) => {
        // We handle collection via Player interaction, but collision keeps it solid
    }
  }));

  useFrame(() => {
    if (ref.current) {
        const pos = new THREE.Vector3();
        ref.current.getWorldPosition(pos);
        onUpdatePos(pos);
    }
  });

  return (
    <group ref={ref as any}>
      {/* Simple log model */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.5, 8]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      {/* Some details */}
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.21, 0.21, 0.1, 8]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
    </group>
  );
};

export default WoodResource;
