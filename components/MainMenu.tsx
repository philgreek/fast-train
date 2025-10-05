import React, { useState } from 'react';
import { GameScreen, Difficulty } from '../types';
import { PlayIcon, PuzzleIcon, SettingsIcon, BubbleIcon } from './icons';
import { Scenery } from './Scenery';
import { SettingsModal } from './SettingsModal';

interface MainMenuProps {
  onScreenChange: (screen: GameScreen) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  currentDifficulty: Difficulty;
}

const MenuButton: React.FC<{ onClick: () => void; children: React.ReactNode; className: string; }> = ({ onClick, children, className }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center w-full max-w-sm px-6 py-3 sm:px-8 sm:py-4 landscape:py-2 landscape:px-4 text-2xl sm:text-3xl landscape:text-xl font-black text-white rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out ${className}`}
        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
    >
        {children}
    </button>
);


export const MainMenu: React.FC<MainMenuProps> = ({ onScreenChange, setDifficulty, currentDifficulty }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center p-4 sm:p-8 landscape:p-2 overflow-hidden">
      <Scenery speed={1} targetNumber={10} />
      
      <div className="relative z-50 flex flex-col items-center justify-center space-y-6 sm:space-y-8 landscape:space-y-2 text-center">
        <h1 className="text-6xl sm:text-8xl landscape:text-5xl font-black text-white drop-shadow-lg" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.2)' }}>
          Числовой <br /> Экспресс
        </h1>
        <div className="flex flex-col space-y-4 sm:space-y-6 landscape:space-y-3 w-full items-center pt-4 sm:pt-8 landscape:pt-2">
            <MenuButton onClick={() => onScreenChange(GameScreen.Playing)} className="bg-[#A5D6A7] hover:bg-green-500">
                <PlayIcon className="w-7 h-7 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 mr-4 landscape:mr-3" />
                Числовой экспресс
            </MenuButton>
             <MenuButton onClick={() => onScreenChange(GameScreen.BubbleGame)} className="bg-sky-500 hover:bg-sky-600">
                <BubbleIcon className="w-7 h-7 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 mr-4 landscape:mr-3" />
                Пузыри чисел
            </MenuButton>
            <MenuButton onClick={() => onScreenChange(GameScreen.PuzzleAlbum)} className="bg-[#FFD54F] hover:bg-amber-400">
                <PuzzleIcon className="w-7 h-7 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 mr-4 landscape:mr-3" />
                Мои пазлы
            </MenuButton>
             <MenuButton onClick={() => setIsSettingsOpen(true)} className="bg-gray-400 hover:bg-gray-500">
                <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 mr-4 landscape:mr-3" />
                Настройки
            </MenuButton>
        </div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentDifficulty={currentDifficulty}
        onDifficultyChange={setDifficulty}
      />
    </div>
  );
};
