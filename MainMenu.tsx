
import React from 'react';
import { Mountain, Users, User, Play, BookOpen, AlertCircle, Globe } from 'lucide-react';
import { io } from 'socket.io-client';
import { useLanguage } from '../src/LanguageContext';

interface MainMenuProps {
  onStartSolo: () => void;
  onStartMultiplayer: (roomId: string) => void;
  onOpenTutorial: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartSolo, onStartMultiplayer, onOpenTutorial }) => {
  const { t, language, setLanguage } = useLanguage();
  const [showJoinInput, setShowJoinInput] = React.useState(false);
  const [joinRoomId, setJoinRoomId] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const handleCreateRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    onStartMultiplayer(randomId);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'ca' : 'es');
  };

  const handleJoinRoom = () => {
    const code = joinRoomId.trim().toUpperCase();
    if (!code) return;

    setIsChecking(true);
    setError(null);

    const socket = io();
    socket.emit("check-room", code, (response: { exists: boolean }) => {
      setIsChecking(false);
      if (response.exists) {
        onStartMultiplayer(code);
      } else {
        setError(language === 'es' ? "Esa sala no existe" : "Aquesta sala no existeix");
      }
      socket.disconnect();
    });
  };
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-sky-400 to-blue-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-white/20 text-center max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-white rounded-full shadow-lg">
            <Mountain className="w-16 h-16 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">{t.mainMenu.title}</h1>
        <p className="text-blue-100 mb-10 text-lg">{t.mainMenu.subtitle}</p>

        <div className="flex flex-col gap-4">
          <button 
            onClick={onStartSolo}
            className="flex items-center justify-center gap-3 w-full py-4 bg-white text-blue-600 rounded-xl font-bold text-xl hover:bg-blue-50 transform transition-all active:scale-95 shadow-lg"
          >
            <Play className="w-6 h-6" />
            {t.mainMenu.solo}
          </button>

          <div className="flex flex-col gap-2">
            {!showJoinInput ? (
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleCreateRoom}
                  className="flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-400 transform transition-all active:scale-95 shadow-md border border-blue-400"
                >
                  <Users className="w-5 h-5" />
                  {language === 'es' ? "Crear Sala" : "Crear Sala"}
                </button>
                <button 
                  onClick={() => setShowJoinInput(true)}
                  className="flex items-center justify-center gap-2 py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transform transition-all active:scale-95 border border-white/20"
                >
                  <User className="w-5 h-5" />
                  {language === 'es' ? "Unirse" : "Unir-se"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="CÓDIGO" 
                    value={joinRoomId}
                    onChange={(e) => {
                      setJoinRoomId(e.target.value);
                      setError(null);
                    }}
                    className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white placeholder:text-white/50 font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                    maxLength={6}
                    disabled={isChecking}
                  />
                  <button 
                    onClick={handleJoinRoom}
                    disabled={isChecking}
                    className="px-4 py-2 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isChecking ? "..." : "IR"}
                  </button>
                  <button 
                    onClick={() => {
                      setShowJoinInput(false);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-red-500/50 text-white rounded-xl font-bold hover:bg-red-500/70 active:scale-95 transition-all"
                  >
                    X
                  </button>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-200 text-sm font-bold bg-red-500/20 p-2 rounded-lg border border-red-500/30 animate-shake">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={onOpenTutorial}
            className="flex items-center justify-center gap-3 w-full py-3 bg-white/10 text-white/80 rounded-xl font-bold text-lg hover:bg-white/20 transform transition-all active:scale-95 border border-white/10"
          >
            <BookOpen className="w-5 h-5" />
            {t.mainMenu.tutorial}
          </button>

          <button 
            onClick={toggleLanguage}
            className="flex items-center justify-center gap-3 w-full py-3 bg-blue-700/30 text-white rounded-xl font-bold text-lg hover:bg-blue-700/50 transform transition-all active:scale-95 border border-white/10"
          >
            <Globe className="w-5 h-5" />
            {t.mainMenu.language}
          </button>
        </div>

        <div className="mt-8 text-blue-200 text-sm">
          PC: WASD + Mouse + E + Click<br/>
          Mobile: Joystick + Botones
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
