
import React from 'react';
import { Difficulty } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const difficultyMap: { [key in Difficulty]: string } = {
  [Difficulty.Easy]: 'Легко',
  [Difficulty.Medium]: 'Средне',
  [Difficulty.Hard]: 'Сложно',
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentDifficulty, onDifficultyChange }) => {
  if (!isOpen) return null;

  const handleDifficultyClick = (difficulty: Difficulty) => {
    onDifficultyChange(difficulty);
    onClose();
  };
  
  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl sm:text-4xl font-black text-gray-800">Настройки</h2>
        <div className="w-full pt-2 sm:pt-4">
            <h3 className="text-xl sm:text-2xl text-gray-600 mb-4">Уровень сложности:</h3>
            <div className="flex flex-col space-y-3 sm:space-y-4">
                {/* FIX: Replaced `Object.keys` with `Object.entries` for a more type-safe and readable way to iterate over the difficulty map. This resolves the TypeScript error related to incorrect type casting. */}
                {Object.entries(difficultyMap).map(([key, name]) => {
                    const difficultyValue = Number(key) as Difficulty;
                    const isActive = currentDifficulty === difficultyValue;
                    return (
                        <button
                            key={key}
                            onClick={() => handleDifficultyClick(difficultyValue)}
                            className={`px-6 py-3 sm:px-8 sm:py-4 text-xl sm:text-2xl font-bold rounded-xl shadow-lg transition-all duration-200 w-full
                                ${isActive 
                                    ? 'bg-green-500 text-white scale-105' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {name}
                        </button>
                    )
                })}
            </div>
        </div>
        <button 
            onClick={onClose} 
            className="mt-4 sm:mt-6 px-6 py-2 sm:px-8 sm:py-3 text-lg sm:text-xl font-bold text-white bg-blue-500 rounded-xl shadow-lg hover:bg-blue-600 transition-colors"
        >
            Закрыть
        </button>
      </div>
    </div>
  );
};