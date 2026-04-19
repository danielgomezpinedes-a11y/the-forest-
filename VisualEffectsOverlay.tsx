
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const VisualEffectsOverlay: React.FC = () => {
  const [showThunder, setShowThunder] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const handleThunder = () => {
      setShowThunder(true);
      setShake(true);
      setTimeout(() => setShowThunder(false), 500);
      setTimeout(() => setShake(false), 300);
    };

    const handleHit = () => {
      setShake(true);
      setTimeout(() => setShake(false), 150);
    };

    (window as any).addEventListener('vfx:thunder', handleThunder);
    (window as any).addEventListener('vfx:hit', handleHit);
    return () => {
      (window as any).removeEventListener('vfx:thunder', handleThunder);
      (window as any).removeEventListener('vfx:hit', handleHit);
    };
  }, []);

  return (
    <motion.div 
      animate={shake ? {
        x: [0, -5, 5, -5, 5, 0],
        y: [0, 5, -5, 5, -5, 0]
      } : {}}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 pointer-events-none z-[200] overflow-hidden"
    >
      <AnimatePresence>
        {showThunder && (
          <>
            {/* Flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-white"
            />
            {/* Ripple/Wave */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0, 0.4, 0],
                scale: [1, 1.2, 1.5],
                backgroundColor: ["rgba(255,255,255,0)", "rgba(255,255,255,0.2)", "rgba(255,255,255,0)"]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0"
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VisualEffectsOverlay;
