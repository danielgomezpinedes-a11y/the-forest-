
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MousePointer2, Keyboard, Move, Hand, ShoppingBag, Heart, Utensils, X, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { useLanguage } from '../src/LanguageContext';

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = useMemo(() => [
    {
      title: t.tutorial.steps.movement.title,
      description: t.tutorial.steps.movement.description,
      icon: <Move className="w-12 h-12 text-blue-400" />,
      controls: "WASD / SHIFT"
    },
    {
      title: t.tutorial.steps.gathering.title,
      description: t.tutorial.steps.gathering.description,
      icon: <Hand className="w-12 h-12 text-emerald-400" />,
      controls: "CLICK IZQUIERDO / E"
    },
    {
      title: t.tutorial.steps.combat.title,
      description: t.tutorial.steps.combat.description,
      icon: <MousePointer2 className="w-12 h-12 text-red-400" />,
      controls: "CLICK IZQUIERDO"
    },
    {
      title: t.tutorial.steps.survival.title,
      description: t.tutorial.steps.survival.description,
      icon: <Heart className="w-12 h-12 text-pink-400" />,
      controls: "HUD SUPERIOR"
    },
    {
      title: t.tutorial.steps.inventory.title,
      description: t.tutorial.steps.inventory.description,
      icon: <ShoppingBag className="w-12 h-12 text-orange-400" />,
      controls: "TECLA I"
    },
    {
      title: t.tutorial.steps.building.title,
      description: t.tutorial.steps.building.description,
      icon: <Keyboard className="w-12 h-12 text-purple-400" />,
      controls: "TECLAS B / F"
    }
  ], [t]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Info className="text-blue-400" size={20} />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">{t.tutorial.title}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                {steps[currentStep].icon}
              </div>
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">
                {steps[currentStep].title}
              </h3>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                {steps[currentStep].description}
              </p>
              
              <div className="px-4 py-2 bg-zinc-800 rounded-full border border-white/5">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-2">{language === 'es' ? "Control:" : "Control:"}</span>
                <span className="text-xs font-bold text-blue-400 font-mono">{steps[currentStep].controls}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 border-t border-white/5 flex justify-between items-center">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-blue-500' : 'w-2 bg-zinc-700'}`} 
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button 
                onClick={prev}
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white font-bold transition-colors"
              >
                <ChevronLeft size={20} />
                {language === 'es' ? "Atrás" : "Enrere"}
              </button>
            )}
            <button 
              onClick={next}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-600/20"
            >
              {currentStep === steps.length - 1 ? (language === 'es' ? '¡Entendido!' : 'Entès!') : (language === 'es' ? 'Siguiente' : 'Següent')}
              {currentStep < steps.length - 1 && <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Tutorial;
