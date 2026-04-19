
export enum GameMode {
  MENU,
  SOLO,
  MULTIPLAYER
}

export interface RemotePlayer {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  health: number;
  isAttacking: boolean;
  weaponType: 'NONE' | 'STICK' | 'SHARPENED_STICK' | 'TORCH';
}

export enum AnimalType {
  BEAR = 'BEAR',
  WOLF = 'WOLF',
  RABBIT = 'RABBIT'
}

export enum WeatherType {
  CLEAR = 'CLEAR',
  RAIN = 'RAIN',
  FOG = 'FOG',
  SNOWSTORM = 'SNOWSTORM'
}

export interface AnimalData {
  id: string;
  type: AnimalType;
  position: [number, number, number];
  health: number;
  isDead: boolean;
}

export interface TreeData {
  id: string;
  position: [number, number, number];
  scale: number;
  health: number;
}

export interface StructureData {
  id: string;
  type: 'SHELTER' | 'FIRE';
  position: [number, number, number];
}

export interface PlayerData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  health: number;
  hunger: number;
  meat: number;
  fur: number;
  wood: number;
  stone: number;
    inventory: {
      bandages: number;
      warmCoat: boolean;
      sharpenedStick: boolean;
      axe: boolean;
      pickaxe: boolean;
      thermalSuit: boolean;
      shelter: boolean;
      torch: boolean;
      fire: boolean;
    };
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: {
    meat?: number;
    fur?: number;
    wood?: number;
    stone?: number;
  };
  result: keyof PlayerData['inventory'];
}
