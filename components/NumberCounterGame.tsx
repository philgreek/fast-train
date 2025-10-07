import React, { useMemo } from 'react';
import { useNumberCounterLogic } from '../hooks/useNumberCounterLogic';
import { NumberPart as NumberPartType, Difficulty } from '../types';
import { PLACE_VALUE_COLORS } from '../constants';
import { StarIcon, TimerIcon } from './icons';

interface NumberCounterGameProps {
  onBackToMenu: () => void;
  difficulty: Difficulty;
}

const NumberPart: React.FC<{ part: NumberPartType, onClick: (id: string) => void, isActive: boolean }> = ({ part, onClick, isActive }) => {
    const colorClass = useMemo(() => {
      // Use a consistent gray for operators and equals
      if (part.type === 'operator' || part.type === 'equals') return 'text-gray-400';
      // Use place value colors for numbers and questions
      return PLACE_VALUE_COLORS[part.placeValue as keyof typeof PLACE_VALUE_COLORS] || 'from-gray-400 to-gray-600';
    }, [part.type, part.placeValue]);
    
    const baseClasses = "text-5xl sm:text-7xl font-black rounded-lg transition-all duration-300 relative flex items-center justify-center";
    const activePulseClass = part.isPulsing ? "animate-pulse" : "";
    const clickableClass = part.isClickable ? "cursor-pointer hover:scale-110" : "cursor-default";
    const solvedClass = part.isSolved ? "opacity-60" : "";
    const activeInputClass = isActive ? "ring-4 ring-yellow-400" : "";
    
    const handleClick = () => {
        if (part.isClickable) {
            onClick(part.id);
        }
    };

    if (part.type === 'operator' || part.type === 'equals') {
        return <div className={`px-1 sm:px-2 ${baseClasses} ${colorClass}`}>{part.text}</div>
    }

    const numberText = (
        <span className="relative z-10 text-white" style={{WebkitTextStroke: '2px black', textShadow: '3px 3px 5px rgba(0,0,0,0.3)'}}>
            {part.text}
        </span>
    );

    return (
        <div onClick={handleClick} className={`w-16 h-16 sm:w-24 sm:h-24 ${baseClasses} ${clickableClass} ${activePulseClass} ${solvedClass} ${activeInputClass}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} rounded-lg`}></div>
            {numberText}
        </div>
    );
};

const Keypad: React.FC<{
    onInput: (value: string) => void;
    onBackspace: () => void;
    onSubmit: () => void;
    currentInput: string;
    isActive: boolean;
}> = ({ onInput, onBackspace, onSubmit, currentInput, isActive }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0'];

    const buttonClass = `py-2 sm:py-3 rounded-lg text-2xl sm:text-3xl font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed`;
    const numButtonClass = `bg-gray-200 text-gray-700 hover:bg-gray-300`;
    const actionButtonClass = `bg-orange-400 text-white hover:bg-orange-500`;
    const submitButtonClass = `bg-green-500 text-white hover:bg-green-600`;
    
    return (
        <div className="w-full max-w-sm sm:max-w-md mx-auto p-2 sm:p-4 bg-gray-500/20 backdrop-blur-sm rounded-t-2xl shadow-lg">
            <div className="h-14 sm:h-16 mb-2 sm:mb-4 bg-white/80 rounded-lg shadow-inner flex items-center justify-end px-4 text-4xl sm:text-5xl font-bold text-gray-800">
                {currentInput || (isActive ? '' : '...')}
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {keys.map(key => (
                    <button key={key} onClick={() => onInput(key)} disabled={!isActive} className={`${buttonClass} ${numButtonClass}`}>
                        {key}
                    </button>
                ))}
                <button onClick={onBackspace} disabled={!isActive} className={`${buttonClass} ${actionButtonClass} col-start-4`}>←</button>
                <button onClick={onSubmit} disabled={!isActive || currentInput.length === 0} className={`${buttonClass} ${submitButtonClass} col-span-4`}>✔ Готово</button>
            </div>
        </div>
    );
};

const Fireworks: React.FC = () => {
    return <div className="absolute inset-0 pointer-events-none z-50 animate-fireworks-container">
        {Array.from({ length: 30 }).map((_, i) => (
             <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-firework"
                style={{
                    top: '50%', left: '50%',
                    '--x': `${Math.cos((i / 30) * 2 * Math.PI) * (Math.random() * 150 + 50)}px`,
                    '--y': `${Math.sin((i / 30) * 2 * Math.PI) * (Math.random() * 150 + 50)}px`,
                    '--c': `hsl(${Math.random() * 360}, 100%, 60%)`,
                    animationDelay: `${Math.random() * 0.2}s`
                } as React.CSSProperties}
            />
        ))}
    </div>
};


export const NumberCounterGame: React.FC<NumberCounterGameProps> = ({ onBackToMenu, difficulty }) => {
    const { 
        currentStep, activeInputId, currentInput, score, timeLeft, isGameOver, feedback, 
        handlePartClick, handleKeypadInput, handleBackspace, handleSubmit, resetGame 
    } = useNumberCounterLogic(difficulty);

    const gameContainerClass = useMemo(() => {
        if (feedback === 'wrong') return 'animate-shake';
        return '';
    }, [feedback]);

    if (!currentStep) {
        return <div className="w-full h-screen flex items-center justify-center bg-blue-100">Загрузка...</div>;
    }

    return (
        <div className="relative w-full h-screen bg-gradient-to-br from-gray-100 to-blue-200 overflow-hidden select-none flex flex-col">
             {feedback === 'correct' && currentStep.action.type === 'END_STEP' && <Fireworks />}
             
             <div className="absolute top-0 left-0 right-0 p-2 sm:p-4 z-50 flex justify-between items-center">
                <div className="flex items-center bg-white/50 backdrop-blur-sm p-1 px-2 sm:p-2 sm:px-4 rounded-full shadow-md">
                    <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                    <span className="ml-2 text-2xl sm:text-3xl font-bold text-gray-800">{score}</span>
                </div>
                <div className="flex items-center bg-white/50 backdrop-blur-sm p-1 px-2 sm:p-2 sm:px-4 rounded-full shadow-md">
                    <TimerIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                    <span className="ml-2 text-2xl sm:text-3xl font-bold text-gray-800">{timeLeft}</span>
                </div>
            </div>

            <div className={`flex-grow flex flex-col items-center justify-center p-4 transition-transform duration-300 ${gameContainerClass}`}>
                <p className="text-xl sm:text-2xl text-gray-700 font-bold h-16 text-center">{currentStep.prompt || ''}</p>
                 <div className="flex flex-col items-center space-y-4">
                     {currentStep.lines.map((line, lineIndex) => (
                         <div key={lineIndex} className="flex items-center justify-center flex-wrap">
                            {line.map((part) => <NumberPart key={part.id} part={part} onClick={handlePartClick} isActive={part.id === activeInputId} />)}
                         </div>
                     ))}
                 </div>
            </div>

            <Keypad 
                onInput={handleKeypadInput}
                onBackspace={handleBackspace}
                onSubmit={handleSubmit}
                currentInput={currentInput}
                isActive={!!activeInputId}
            />

             {isGameOver && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[101] p-4">
                    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl text-center flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-md">
                        <h2 className="text-4xl sm:text-5xl font-black text-gray-800">Игра окончена!</h2>
                        <p className="text-xl sm:text-2xl text-gray-600">Ваш счёт: <span className="font-bold text-2xl sm:text-3xl text-yellow-500">{score}</span></p>
                        <button onClick={resetGame} className="px-6 py-3 sm:px-8 sm:py-4 text-xl sm:text-2xl font-bold text-white bg-green-500 rounded-xl shadow-lg hover:bg-green-600 transition-colors w-full">Играть снова</button>
                        <button onClick={onBackToMenu} className="px-6 py-3 sm:px-8 sm:py-4 text-xl sm:text-2xl font-bold text-white bg-blue-500 rounded-xl shadow-lg hover:bg-blue-600 transition-colors w-full">Главное меню</button>
                    </div>
                </div>
            )}
            <button
                onClick={onBackToMenu}
                className="absolute bottom-4 left-4 px-4 py-2 sm:px-6 sm:py-3 text-lg sm:text-xl font-bold text-white bg-gray-500/50 backdrop-blur-sm rounded-xl shadow-lg hover:bg-gray-600/70 transition-colors z-20"
            >
                Меню
            </button>
        </div>
    );
};

const style = document.createElement('style');
if (!document.getElementById('number-counter-styles')) {
    style.id = 'number-counter-styles';
    style.innerHTML = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    .animate-shake {
        animation: shake 0.5s ease-in-out;
    }
    @keyframes firework {
        0% { transform: translate(var(--x), var(--y)) scale(1); opacity: 1; }
        100% { transform: translate(calc(var(--x) * 1.5), calc(var(--y) * 1.5)) scale(0); opacity: 0; }
    }
    .animate-firework {
        background: var(--c);
        animation: firework 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    @keyframes fireworks-container-fade {
        0%, 80% { opacity: 1; }
        100% { opacity: 0; }
    }
    .animate-fireworks-container {
        animation: fireworks-container-fade 1.5s forwards;
    }
    `;
    document.head.appendChild(style);
}