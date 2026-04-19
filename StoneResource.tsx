
import React, { useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StoneResourceProps {
  position: [number, number, number];
  onCollect: () => void;
  onUpdatePos: (pos: THREE.Vector3) => void;
}

const StoneResource: React.FC<StoneResourceProps> = ({ position, onCollect, onUpdatePos }) => {
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: [0.8, 0.6, 0.8],
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
      {/* Simple rock model */}
      <mesh castShadow>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#757575" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, -0.1, 0.2]} scale={0.7}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#616161" roughness={0.9} />
      </mesh>
    </group>
  );
};

export default StoneResource;
