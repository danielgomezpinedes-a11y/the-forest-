
import React, { memo } from 'react';
import { usePlane, useCylinder, useBox } from '@react-three/cannon';
import * as THREE from 'three';

import { TreeData } from '../types';

interface MountainProps {
  trees: TreeData[];
  onTreeUpdatePos: (id: string, pos: THREE.Vector3) => void;
}

const Mountain: React.FC<MountainProps> = ({ trees, onTreeUpdatePos }) => {
  const FOREST_SIZE = 1000;

  // Plataforma de spawn optimizada
  const [spawnRef] = useCylinder(() => ({
    type: 'Static',
    position: [0, -0.1, 0],
    args: [15, 15, 0.5, 8]
  }));

  // Suelo base (Cambiado de Plane a Box para permitir áreas subterráneas)
  const [floorRef] = useBox(() => ({ 
    type: 'Static',
    args: [40000, 10, 40000],
    position: [0, -5, 0] 
  }));

  // Niveles de colisión eliminados (ya no hay montaña)

  // Path data removed
  const pathData: any[] = [];

  // Points of Interest removed
  const pois: any[] = [];

  // Memoize grass patch positions
  const grassPatches = React.useMemo(() => {
    const patches = [];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 200;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      patches.push({ x, z, scale: 2 + Math.random() * 5, color: Math.random() > 0.5 ? "#3a5a2a" : "#4a6a3a" });
    }
    return patches;
  }, []);

  // Snow patches removed
  const snowPatches: any[] = [];

  // Memoize bush positions
  const bushData = React.useMemo(() => {
    const bushes = [];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 150;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius - 40;
      if (Math.abs(x) < 18 && Math.abs(z) < 18) continue;
      bushes.push({ x, z, scale: 0.8 + Math.random() * 1.2 });
    }
    return bushes;
  }, []);

  // Memoize small flora (flowers/grass tufts)
  const floraData = React.useMemo(() => {
    const flora = [];
    const colors = ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff"];
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 180;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
      flora.push({ 
        x, 
        z, 
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.3 + Math.random() * 0.5
      });
    }
    return flora;
  }, []);

  // Memoize rock positions (spread across forest)
  const rockData = React.useMemo(() => {
    const rocks = [];
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 800;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
      rocks.push({ 
        x, y: 0, z, 
        scale: 0.5 + Math.random() * 3.5,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
        color: Math.random() > 0.5 ? "#666" : "#555"
      });
    }
    return rocks;
  }, []);

  return (
    <group>
      <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20000, 20000]} />
        <meshStandardMaterial color="#2d4a27" />
      </mesh>

      {/* Grass Patches */}
      {grassPatches.map((patch, i) => (
        <mesh key={`patch-${i}`} position={[patch.x, -0.005, patch.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[patch.scale, patch.scale]} />
          <meshStandardMaterial color={patch.color} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Rocky Outcrops / Boulders */}
      {rockData.map((rock, i) => (
        <mesh key={`rock-${i}`} position={[rock.x, rock.y, rock.z]} rotation={rock.rotation}>
          <dodecahedronGeometry args={[rock.scale, 0]} />
          <meshStandardMaterial color={rock.color} flatShading />
        </mesh>
      ))}

      {/* Bushes */}
      {bushData.map((bush, i) => (
        <Bush key={`bush-${i}`} position={[bush.x, 0, bush.z]} scale={bush.scale} />
      ))}

      {/* Flora */}
      {floraData.map((flora, i) => (
        <Flora key={`flora-${i}`} position={[flora.x, 0, flora.z]} color={flora.color} scale={flora.scale} />
      ))}

      {trees.map((tree) => (
        <Tree 
          key={tree.id} 
          id={tree.id}
          position={tree.position} 
          scale={tree.scale}
          onUpdatePos={onTreeUpdatePos}
          snowy={false}
        />
      ))}
    </group>
  );
};

import { useFrame } from '@react-three/fiber';

const Tree = memo(({ id, position, scale = 1, onUpdatePos, snowy = false }: { id: string, position: [number, number, number], scale?: number, onUpdatePos: (id: string, pos: THREE.Vector3) => void, snowy?: boolean }) => {
  const trunkHeight = 2 * scale;
  const leavesHeight = 3 * scale;
  const trunkRadius = 0.3 * scale;

  const [ref] = useCylinder(() => ({ 
    type: 'Static', 
    position: [position[0], position[1] + trunkHeight / 2, position[2]], 
    args: [trunkRadius, trunkRadius, trunkHeight, 4] 
  }));

  useFrame(() => {
    if (ref.current) {
        const worldPos = new THREE.Vector3();
        ref.current.getWorldPosition(worldPos);
        onUpdatePos(id, worldPos);
    }
  });

  return (
    <group position={position} ref={ref as any}>
      {/* Trunk - Centered on physics body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[trunkRadius * 0.7, trunkRadius, trunkHeight, 4]} />
        <meshStandardMaterial color="#3d261a" />
      </mesh>
      {/* Leaves Layer 1 - Positioned relative to trunk top */}
      <mesh position={[0, trunkHeight / 2 + leavesHeight * 0.2, 0]}>
        <coneGeometry args={[1.5 * scale, leavesHeight, 5]} />
        <meshStandardMaterial color={snowy ? "#ddd" : "#1a3317"} flatShading />
      </mesh>
      {/* Leaves Layer 2 */}
      <mesh position={[0, trunkHeight / 2 + leavesHeight * 0.5, 0]}>
        <coneGeometry args={[1.2 * scale, leavesHeight * 0.8, 5]} />
        <meshStandardMaterial color={snowy ? "#eee" : "#1d3a1a"} flatShading />
      </mesh>
      {/* Leaves Layer 3 */}
      <mesh position={[0, trunkHeight / 2 + leavesHeight * 0.8, 0]}>
        <coneGeometry args={[0.8 * scale, leavesHeight * 0.6, 5]} />
        <meshStandardMaterial color={snowy ? "#fff" : "#244420"} flatShading />
      </mesh>
    </group>
  );
});

const Bush = memo(({ position, scale }: { position: [number, number, number], scale: number }) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#2d4a22" flatShading />
      </mesh>
      <mesh position={[0.4, 0.3, 0.2]} castShadow receiveShadow scale={0.7}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#3a5a2a" flatShading />
      </mesh>
      <mesh position={[-0.3, 0.4, -0.3]} castShadow receiveShadow scale={0.8}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#1a3317" flatShading />
      </mesh>
    </group>
  );
});

const Flora = memo(({ position, color, scale }: { position: [number, number, number], color: string, scale: number }) => {
  return (
    <group position={position} scale={scale}>
      {/* Grass tuft */}
      <mesh position={[0, 0.2, 0]} rotation={[0, Math.random() * Math.PI, 0]}>
        <cylinderGeometry args={[0.1, 0.3, 0.5, 3]} />
        <meshStandardMaterial color="#4a6a3a" flatShading />
      </mesh>
      {/* Flower bit */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.15, 4, 4]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
});

export default Mountain;
