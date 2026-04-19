
import React from 'react';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

interface StructureProps {
  type: 'SHELTER' | 'FIRE';
  position: [number, number, number];
}

const Structure: React.FC<StructureProps> = ({ type, position }) => {
  const [ref] = useBox(() => ({
    mass: 0,
    position,
    args: type === 'SHELTER' ? [3, 2, 3] : [1, 0.5, 1],
    type: 'Static',
  }));

  const getModel = () => {
    if (type === 'SHELTER') {
      return (
        <group>
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <coneGeometry args={[2, 2, 4]} />
            <meshStandardMaterial color="#3d261a" flatShading />
          </mesh>
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <boxGeometry args={[3, 0.2, 3]} />
            <meshStandardMaterial color="#5c4033" />
          </mesh>
        </group>
      );
    } else {
      // Fire
      return (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.2, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="#ff4400" />
          </mesh>
          <pointLight intensity={2} distance={5} color="#ff4400" />
        </group>
      );
    }
  };

  return (
    <group ref={ref as any}>
      {getModel()}
    </group>
  );
};

export default Structure;
