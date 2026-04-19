
import React, { useRef, useState, useEffect } from 'react';
import { Sword, Hand, Coffee, ArrowUp, ShoppingBag } from 'lucide-react';
import { useSounds } from './SoundManager';

interface MobileControlsProps {
  onEat: () => void;
  onCollect: () => void;
  onOpenInventory: () => void;
  onJoystickMove: (vector: { x: number, y: number }) => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({ onEat, onCollect, onOpenInventory, onJoystickMove }) => {
  const { playSound } = useSounds();
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleTouch = (e: React.TouchEvent) => {
    if (!joystickRef.current) return;
    const touch = e.touches[0];
    // Fix: Cast current to any to bypass missing getBoundingClientRect property
    const rect = (joystickRef.current as any).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2;
    
    if (distance > maxRadius) {
      dx *= maxRadius / distance;
      dy *= maxRadius / distance;
    }
    
    setKnobPos({ x: dx, y: dy });
    onJoystickMove({ x: dx / maxRadius, y: -dy / maxRadius });
  };

  const resetJoystick = () => {
    setKnobPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[80]">
      {/* Joystick Area */}
      <div 
        className="absolute bottom-12 left-12 w-40 h-40 flex items-center justify-center pointer-events-auto"
        onTouchStart={() => setIsDragging(true)}
        onTouchMove={handleTouch}
        onTouchEnd={resetJoystick}
      >
        <div ref={joystickRef} className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center relative">
          <div 
            className="w-14 h-14 rounded-full bg-white/50 shadow-xl transition-transform duration-75"
            style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
          />
        </div>
      </div>

      {/* Action Buttons Area */}
      <div className="absolute bottom-12 right-12 flex flex-col items-end gap-6 pointer-events-auto">
        <div className="flex gap-4">
            <button 
                onPointerDown={(e) => { 
                  e.stopPropagation(); 
                  playSound('collect');
                  onCollect(); 
                }}
                className="w-16 h-16 rounded-full bg-yellow-500/80 backdrop-blur-md flex items-center justify-center text-white active:scale-90 shadow-lg border border-white/20"
            >
                <Hand size={30} />
            </button>
            <button 
                onPointerDown={(e) => { 
                  e.stopPropagation(); 
                  playSound('eat');
                  onEat(); 
                }}
                className="w-16 h-16 rounded-full bg-blue-500/80 backdrop-blur-md flex items-center justify-center text-white active:scale-90 shadow-lg border border-white/20"
            >
                <Coffee size={30} />
            </button>
            <button 
                onPointerDown={(e) => { 
                  e.stopPropagation(); 
                  onOpenInventory(); 
                }}
                className="w-16 h-16 rounded-full bg-zinc-800/80 backdrop-blur-md flex items-center justify-center text-white active:scale-90 shadow-lg border border-white/20"
            >
                <ShoppingBag size={30} />
            </button>
            <button 
                onPointerDown={(e) => { 
                    e.stopPropagation();
                    // Fix: Access window and event constructors via any cast
                    (window as any).dispatchEvent(new (window as any).KeyboardEvent('keydown', { code: 'Space' }));
                    setTimeout(() => (window as any).dispatchEvent(new (window as any).KeyboardEvent('keyup', { code: 'Space' })), 100);
                }}
                className="w-16 h-16 rounded-full bg-gray-600/80 backdrop-blur-md flex items-center justify-center text-white active:scale-90 shadow-lg border border-white/20"
            >
                <ArrowUp size={30} />
            </button>
        </div>
        
        <button 
            className="w-28 h-28 rounded-full bg-red-600/90 backdrop-blur-lg flex items-center justify-center text-white active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.5)] border-2 border-white/30"
            onPointerDown={(e) => {
                e.stopPropagation();
                playSound('attack');
                // Fix: Access window and event constructors via any cast
                (window as any).dispatchEvent(new (window as any).MouseEvent('mousedown', { bubbles: true }));
                (window as any).dispatchEvent(new (window as any).MouseEvent('click', { bubbles: true }));
            }}
        >
          <Sword size={50} />
        </button>
      </div>
    </div>
  );
};

export default MobileControls;