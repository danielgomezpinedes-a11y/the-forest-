
import React, { useState, useMemo } from 'react';
import { X, ShoppingBag, Utensils, Info, Hammer, Heart, Shield, Sword, TreePine, ScrollText, Axe, Pickaxe, Zap, Tent, Flame, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerData, Recipe } from '../types';
import { useLanguage } from '../src/LanguageContext';

interface InventoryProps {
  isOpen: boolean;
  onClose: () => void;
  meat: number;
  fur: number;
  wood: number;
  stone: number;
  inventory: PlayerData['inventory'];
  onEat: () => void;
  onCraft: (recipe: Recipe) => boolean;
  onUseBandage: () => void;
  hunger: number;
  health: number;
}

const Inventory: React.FC<InventoryProps> = ({ 
  isOpen, onClose, meat, fur, wood, stone, inventory, onEat, onCraft, onUseBandage, hunger, health 
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'items' | 'crafting'>('items');

  const recipes: Recipe[] = useMemo(() => [
    {
      id: 'bandage',
      name: t.inventory.items.bandage,
      description: t.inventory.recipes.bandage,
      ingredients: { fur: 1 },
      result: 'bandages'
    },
    {
      id: 'coat',
      name: t.inventory.items.coat,
      description: t.inventory.recipes.coat,
      ingredients: { fur: 3, meat: 1 },
      result: 'warmCoat'
    },
    {
      id: 'stick',
      name: t.inventory.items.stick,
      description: t.inventory.recipes.stick,
      ingredients: { wood: 2, fur: 1 },
      result: 'sharpenedStick'
    },
    {
      id: 'axe',
      name: t.inventory.items.axe,
      description: t.inventory.recipes.axe,
      ingredients: { wood: 3, stone: 2 },
      result: 'axe'
    },
    {
      id: 'pickaxe',
      name: t.inventory.items.pickaxe,
      description: t.inventory.recipes.pickaxe,
      ingredients: { wood: 2, stone: 3 },
      result: 'pickaxe'
    },
    {
      id: 'thermal',
      name: t.inventory.items.thermal,
      description: t.inventory.recipes.thermal,
      ingredients: { fur: 5, meat: 2, stone: 1 },
      result: 'thermalSuit'
    },
    {
      id: 'shelter',
      name: t.inventory.items.shelter,
      description: t.inventory.recipes.shelter,
      ingredients: { wood: 10, fur: 2 },
      result: 'shelter'
    },
    {
      id: 'torch',
      name: t.inventory.items.torch,
      description: t.inventory.recipes.torch,
      ingredients: { wood: 1, fur: 1 },
      result: 'torch'
    },
    {
      id: 'fire',
      name: t.inventory.items.fire,
      description: t.inventory.recipes.fire,
      ingredients: { wood: 3, stone: 2 },
      result: 'fire'
    }
  ], [t]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Inventory Panel */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <ShoppingBag className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">{t.inventory.title}</h2>
                  <div className="flex gap-4 mt-1">
                    <button 
                      onClick={() => setActiveTab('items')}
                      className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'items' ? 'text-blue-400' : 'text-zinc-500 hover:text-white'}`}
                    >
                      {t.inventory.tabs.items}
                    </button>
                    <button 
                      onClick={() => setActiveTab('crafting')}
                      className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'crafting' ? 'text-blue-400' : 'text-zinc-500 hover:text-white'}`}
                    >
                      {t.inventory.tabs.crafting}
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{language === 'es' ? "Cerrar" : "Tancar"}</span>
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
              {/* Left: Stats Summary */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">{language === 'es' ? "Estado" : "Estat"}</h3>
                
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-orange-400">{t.hud.hunger}</span>
                    <span className="text-white">{Math.round(hunger)}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${hunger}%` }} />
                  </div>
                </div>

                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-red-400">{t.hud.health}</span>
                    <span className="text-white">{Math.round(health)}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${health}%` }} />
                  </div>
                </div>

                <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{language === 'es' ? "Recursos" : "Recursos"}</h4>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Utensils size={14} className="text-orange-400" />
                      <span className="text-xs text-white">{t.inventory.resources.meat}</span>
                    </div>
                    <span className="text-xs font-mono text-white">{meat}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-blue-400" />
                      <span className="text-xs text-white">{t.inventory.resources.fur}</span>
                    </div>
                    <span className="text-xs font-mono text-white">{fur}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TreePine size={14} className="text-emerald-400" />
                      <span className="text-xs text-white">{t.inventory.resources.wood}</span>
                    </div>
                    <span className="text-xs font-mono text-white">{wood}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-gray-400" />
                      <span className="text-xs text-white">{t.inventory.resources.stone}</span>
                    </div>
                    <span className="text-xs font-mono text-white">{stone}</span>
                  </div>
                </div>
              </div>

              {/* Right: Items Grid or Crafting */}
              <div className="md:col-span-2">
                {activeTab === 'items' ? (
                  <>
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">{t.inventory.tabs.items}</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {/* Meat */}
                      <div className={`relative group aspect-square rounded-2xl border transition-all ${meat > 0 ? 'bg-zinc-800/50 border-white/10 hover:border-orange-500/50 cursor-pointer' : 'bg-zinc-900 border-white/5 opacity-40'}`}
                        onClick={() => meat > 0 && onEat()}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Utensils size={24} className={meat > 0 ? 'text-orange-400' : 'text-zinc-600'} />
                          <span className="text-[10px] font-black text-white uppercase">{t.inventory.items.meat}</span>
                        </div>
                        {meat > 0 && <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-[10px] font-black flex items-center justify-center rounded-lg shadow-lg">{meat}</div>}
                      </div>

                      {/* Bandages */}
                      <div className={`relative group aspect-square rounded-2xl border transition-all ${inventory.bandages > 0 ? 'bg-zinc-800/50 border-white/10 hover:border-red-500/50 cursor-pointer' : 'bg-zinc-900 border-white/5 opacity-40'}`}
                        onClick={() => inventory.bandages > 0 && onUseBandage()}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Heart size={24} className={inventory.bandages > 0 ? 'text-red-400' : 'text-zinc-600'} />
                          <span className="text-[10px] font-black text-white uppercase">{t.inventory.items.bandage.split(' ')[0]}</span>
                        </div>
                        {inventory.bandages > 0 && <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-lg shadow-lg">{inventory.bandages}</div>}
                      </div>

                      {/* Warm Coat */}
                      <div className={`relative group aspect-square rounded-2xl border transition-all ${inventory.warmCoat ? 'bg-blue-500/20 border-blue-500/50' : 'bg-zinc-900 border-white/5 opacity-40'}`}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Shield size={24} className={inventory.warmCoat ? 'text-blue-400' : 'text-zinc-600'} />
                          <span className="text-[10px] font-black text-white uppercase">{t.inventory.items.coat.split(' ')[0]}</span>
                        </div>
                        {inventory.warmCoat && (
                          <div className="absolute -top-1 -left-1 bg-blue-500 text-white px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <Check size={8} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase">{language === 'es' ? "Activo" : "Actiu"}</span>
                          </div>
                        )}
                      </div>

                      {/* Sharpened Stick */}
                      <div className={`relative group aspect-square rounded-2xl border transition-all ${inventory.sharpenedStick ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-zinc-900 border-white/5 opacity-40'}`}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Sword size={24} className={inventory.sharpenedStick ? 'text-emerald-400' : 'text-zinc-600'} />
                          <span className="text-[10px] font-black text-white uppercase">{t.inventory.items.stick.split(' ')[0]}</span>
                        </div>
                        {inventory.sharpenedStick && (
                          <div className="absolute -top-1 -left-1 bg-emerald-500 text-white px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <Check size={8} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase">{language === 'es' ? "Equipado" : "Equipat"}</span>
                          </div>
                        )}
                      </div>

                      {/* Axe */}
                      <div className={`relative group aspect-square rounded-2xl border transition-all ${inventory.axe ? 'bg-orange-500/20 border-orange-500/50' : 'bg-zinc-900 border-white/5 opacity-40'}`}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Axe size={24} className={inventory.axe ? 'text-orange-400' : 'text-zinc-600'} />
                          <span className="text-[10px] font-black text-white uppercase">{t.inventory.items.axe.split(' ')[0]}</span>
                        </div>
                        {inventory.axe && (
                          <div className="absolute -top-1 -left-1 bg-orange-500 text-white px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <Check size={8} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase">{language === 'es' ? "Equipado" : "Equipat"}</span>
                          </div>
                        )}
                      </div>

                      {/* Pickaxe */}
                      <div className={`relative group aspect-square rounded-2xl border transition-all ${inventory.pickaxe ? 'bg-gray-500/20 border-gray-500/50' : 'bg-zinc-900 border-white/5 opacity-40'}`}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Pickaxe size={24} className={inventory.pickaxe ? 'text-gray-400' : 'text-zinc-600'} />
                          <span className="text-[10px] font-black text-white uppercase">{t.inventory.items.pickaxe.split(' ')[0]}</span>
                        </div>
                        {inventory.pickaxe && (
                          <div className="absolute -top-1 -left-1 bg-gray-500 text-white px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <Check size={8} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase">{language === 'es' ? "Equipado" : "Equipat"}</span>
                          </div>
                        )}
                      </div>

                      {/* Thermal Suit */}
                      <div className={`relative group aspect-square rounded-2xl border transition-all ${inventory.thermalSuit ? 'bg-purple-500/20 border-purple-500/50' : 'bg-zinc-900 border-white/5 opacity-40'}`}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Shield size={24} className={inventory.thermalSuit ? 'text-purple-400' : 'text-zinc-600'} />
                          <span className="text-[10px] font-black text-white uppercase">{t.inventory.items.thermal.split(' ')[0]}</span>
                        </div>
                        {inventory.thermalSuit && (
                          <div className="absolute -top-1 -left-1 bg-purple-500 text-white px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <Check size={8} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase">{language === 'es' ? "Activo" : "Actiu"}</span>
                          </div>
                        )}
                      </div>

                      {/* Shelter */}
                      <div className={`relative group aspect-square rounded-2xl border transition-all ${inventory.shelter ? 'bg-orange-500/20 border-orange-500/50' : 'bg-zinc-900 border-white/5 opacity-40'}`}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Tent size={24} className={inventory.shelter ? 'text-orange-400' : 'text-zinc-600'} />
                          <span className="text-[10px] font-black text-white uppercase">{t.inventory.items.shelter.split(' ')[0]}</span>
                        </div>
                        {inventory.shelter && (
                          <div className="absolute -top-1 -left-1 bg-orange-500 text-white px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <Check size={8} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase">{language === 'es' ? "Listo" : "Llest"}</span>
                          </div>
                        )}
                      </div>

                      {/* Torch */}
                      <div className={`relative group aspect-square rounded-2xl border transition-all ${inventory.torch ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-zinc-900 border-white/5 opacity-40'}`}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Flame size={24} className={inventory.torch ? 'text-yellow-400' : 'text-zinc-600'} />
                          <span className="text-[10px] font-black text-white uppercase">{t.inventory.items.torch.split(' ')[0]}</span>
                        </div>
                        {inventory.torch && (
                          <div className="absolute -top-1 -left-1 bg-yellow-500 text-white px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <Check size={8} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase">{language === 'es' ? "Equipado" : "Equipat"}</span>
                          </div>
                        )}
                      </div>

                      {/* Fire */}
                      <div className={`relative group aspect-square rounded-2xl border transition-all ${inventory.fire ? 'bg-orange-600/20 border-orange-600/50' : 'bg-zinc-900 border-white/5 opacity-40'}`}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Flame size={24} className={inventory.fire ? 'text-orange-500' : 'text-zinc-600'} />
                          <span className="text-[10px] font-black text-white uppercase">{t.inventory.items.fire.split(' ')[0]}</span>
                        </div>
                        {inventory.fire && (
                          <div className="absolute -top-1 -left-1 bg-orange-600 text-white px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <Check size={8} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase">{language === 'es' ? "Listo" : "Llest"}</span>
                          </div>
                        )}
                      </div>

                      {[...Array(1)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-2xl border border-white/5 bg-zinc-900/50 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white/5 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">{language === 'es' ? "Recetas Disponibles" : "Receptes Disponibles"}</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {recipes.map(recipe => {
                        const canCraft = 
                          (recipe.ingredients.meat || 0) <= meat &&
                          (recipe.ingredients.fur || 0) <= fur &&
                          (recipe.ingredients.wood || 0) <= wood &&
                          (recipe.ingredients.stone || 0) <= stone;
                        
                        const isUniqueAndOwned = 
                          (recipe.result === 'warmCoat' && inventory.warmCoat) || 
                          (recipe.result === 'sharpenedStick' && inventory.sharpenedStick) ||
                          (recipe.result === 'axe' && inventory.axe) ||
                          (recipe.result === 'pickaxe' && inventory.pickaxe) ||
                          (recipe.result === 'thermalSuit' && inventory.thermalSuit) ||
                          (recipe.result === 'shelter' && inventory.shelter) ||
                          (recipe.result === 'torch' && inventory.torch) ||
                          (recipe.result === 'fire' && inventory.fire);

                        return (
                          <div key={recipe.id} className={`p-4 rounded-2xl border transition-all ${isUniqueAndOwned ? 'bg-zinc-800/20 border-white/5 opacity-50' : 'bg-zinc-800/50 border-white/10'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="text-sm font-bold text-white">{recipe.name}</h4>
                                <p className="text-[10px] text-zinc-400">{recipe.description}</p>
                              </div>
                              <button 
                                disabled={!canCraft || isUniqueAndOwned}
                                onClick={() => onCraft(recipe)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${canCraft && !isUniqueAndOwned ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}
                              >
                                {isUniqueAndOwned ? (
                                  <span className="flex items-center gap-1">
                                    <Check size={12} strokeWidth={3} />
                                    {language === 'es' ? "Poseído" : "Posseït"}
                                  </span>
                                ) : (language === 'es' ? 'Fabricar' : 'Fabricar')}
                              </button>
                            </div>
                            <div className="flex gap-3 mt-3">
                              {Object.entries(recipe.ingredients).map(([res, amount]) => (
                                <div key={res} className="flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    res === 'meat' ? 'bg-orange-500' : 
                                    res === 'fur' ? 'bg-blue-400' : 
                                    res === 'wood' ? 'bg-emerald-400' : 'bg-gray-400'
                                  }`} />
                                  <span className={`text-[10px] font-mono ${
                                    (res === 'meat' && meat >= amount) ||
                                    (res === 'fur' && fur >= amount) ||
                                    (res === 'wood' && wood >= amount) ||
                                    (res === 'stone' && stone >= amount) ? 'text-white' : 'text-zinc-600'
                                  }`}>
                                    {amount} {res === 'meat' ? t.inventory.resources.meat : res === 'fur' ? t.inventory.resources.fur : res === 'wood' ? t.inventory.resources.wood : t.inventory.resources.stone}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-zinc-500 font-mono">{language === 'es' ? "PULSA" : "PREM"} <span className="text-white font-bold">[I]</span> {language === 'es' ? "PARA CERRAR" : "PER TANCAR"}</p>
                    <button 
                      onClick={onClose}
                      className="text-[10px] text-blue-400 font-black uppercase tracking-widest hover:text-white transition-colors text-left"
                    >
                      {language === 'es' ? "O HAZ CLIC AQUÍ PARA SALIR" : "O FES CLIC AQUÍ PER SORTIR"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{language === 'es' ? "Sistema Activo" : "Sistema Actiu"}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Inventory;
