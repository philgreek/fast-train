import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { Difficulty, Choice, PuzzlePieceId } from '../types';
import { Scenery } from './Scenery';
import { StarIcon, TimerIcon, PauseIcon } from './icons';
import { PuzzlePiece } from './puzzles';
import { PUZZLE_PIECE_AWARD_INTERVAL, ALL_PUZZLE_PIECES, PUZZLES, TIME_BONUS, TIME_PENALTY } from '../constants';

const Train: React.FC<{ number: number; state: 'normal' | 'correct' | 'wrong'; speed: number }> = ({ number, state, speed }) => {
    const stateClasses = {
        normal: '',
        correct: 'animate-[correct-answer_0.5s_ease-in-out]',
        wrong: 'animate-[wrong-answer_0.5s_ease-in-out]',
    };

    const [particles, setParticles] = useState<number[]>([]);

    useEffect(() => {
        if (state === 'correct') {
            setParticles(Array.from({ length: 15 }, (_, i) => i));
            const timer = setTimeout(() => setParticles([]), 1000);
            return () => clearTimeout(timer);
        }
    }, [state]);

    const wheelAnimationDuration = Math.max(0.2, 1.5 / speed);

    return (
        <div className={`relative transition-transform duration-500 transform scale-x-[-1] ${stateClasses[state]}`}>
            {/* Steam Particles */}
            <div className="absolute -top-20 -left-6 w-16 h-20 pointer-events-none">
                {particles.map((p) => (
                    <div
                        key={p}
                        className="absolute bottom-0 left-1/2 w-3 h-3 bg-white/80 rounded-full animate-[steam-puff_1s_ease-out_forwards]"
                        style={{
                            animationDelay: `${Math.random() * 0.2}s`,
                            transform: `translateX(-50%) translateX(${(Math.random() - 0.5) * 40}px) translateY(${-Math.random() * 20}px) scale(${Math.random() * 0.5 + 0.5})`,
                        }}
                    />
                ))}
            </div>
            {/* Train body */}
            <div className="flex items-end">
                {/* Locomotive */}
                <div className="w-24 h-20 bg-[#EF5350] rounded-t-lg relative flex items-center justify-center shadow-lg animate-[sway_3s_ease-in-out_infinite]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%, 0 80%)' }}>
                    <div className="w-10 h-10 bg-blue-200 rounded-lg shadow-inner"></div>
                </div>
                {/* Number Wagon */}
                <div className="w-32 h-24 bg-[#FFD54F] rounded-lg shadow-lg flex items-center justify-center relative ml-2 z-10 animate-[sway_3s_ease-in-out_infinite]" style={{ animationDelay: '-0.2s' }}>
                    <span className="text-5xl font-black text-white inline-block transform scale-x-[-1]" style={{ textShadow: '2px 2px 2px rgba(0,0,0,0.3)' }}>{number}</span>
                </div>
                 {/* Extra Wagon (Caboose) */}
                <div className="w-28 h-20 bg-sky-400 rounded-lg shadow-lg flex items-center justify-center relative ml-2 z-0 animate-[sway_3s_ease-in-out_infinite]" style={{ animationDelay: '-0.4s' }}>
                    {/* decorative window */}
                    <div className="w-8 h-8 bg-blue-100/50 rounded-md"></div>
                </div>
            </div>
             {/* Wheels */}
            <div className="absolute -bottom-4 left-4 flex space-x-10">
                {[...Array(5)].map((_, i) => (
                     <div
                        key={i}
                        className="relative w-10 h-10 animate-[spin-wheel_linear_infinite]"
                        style={{ animationDuration: `${wheelAnimationDuration}s` }}
                    >
                        <div className="w-full h-full rounded-full border-4 border-gray-700">
                            {/* Spokes */}
                            <div className="absolute inset-[4px] flex items-center justify-center" style={{ transform: `rotate(${i * 25}deg)` }}>
                                <div className="w-full h-[3px] bg-gray-600 absolute rotate-0"></div>
                                <div className="w-full h-[3px] bg-gray-600 absolute rotate-60"></div>
                                <div className="w-full h-[3px] bg-gray-600 absolute rotate-120"></div>
                            </div>
                        </div>
                        {/* Hub */}
                        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-500 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-gray-600"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ChoiceButton: React.FC<{ choice: Choice, operation: string, onClick: (choice: Choice) => void }> = ({ choice, operation, onClick }) => {
    return (
        <button 
            onClick={() => onClick(choice)}
            className="w-32 h-32 sm:w-40 sm:h-40 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col items-center justify-center transform hover:scale-110 hover:bg-white transition-all duration-300"
        >
            <span className="text-5xl sm:text-6xl font-black text-gray-700">{operation}{choice.value}</span>
        </button>
    );
};

const GameOverModal: React.FC<{ score: number, onRestart: () => void, onMenu: () => void }> = ({ score, onRestart, onMenu }) => (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[101] p-4">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl text-center flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-md">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-800">Время вышло!</h2>
            <p className="text-xl sm:text-2xl text-gray-600">Ваш счёт: <span className="font-bold text-2xl sm:text-3xl text-yellow-500">{score}</span></p>
            <button onClick={onRestart} className="px-6 py-3 sm:px-8 sm:py-4 text-xl sm:text-2xl font-bold text-white bg-green-500 rounded-xl shadow-lg hover:bg-green-600 transition-colors w-full">Играть снова</button>
            <button onClick={onMenu} className="px-6 py-3 sm:px-8 sm:py-4 text-xl sm:text-2xl font-bold text-white bg-blue-500 rounded-xl shadow-lg hover:bg-blue-600 transition-colors w-full">Главное меню</button>
        </div>
    </div>
);

const PauseModal: React.FC<{ onContinue: () => void, onMenu: () => void }> = ({ onContinue, onMenu }) => (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[101] p-4">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl text-center flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-md">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-800">Пауза</h2>
            <button onClick={onContinue} className="px-6 py-3 sm:px-8 sm:py-4 text-xl sm:text-2xl font-bold text-white bg-green-500 rounded-xl shadow-lg hover:bg-green-600 transition-colors w-full">Продолжить</button>
            <button onClick={onMenu} className="px-6 py-3 sm:px-8 sm:py-4 text-xl sm:text-2xl font-bold text-white bg-blue-500 rounded-xl shadow-lg hover:bg-blue-600 transition-colors w-full">Главное меню</button>
        </div>
    </div>
);

const NewPieceNotification: React.FC<{ pieceId: PuzzlePieceId | null }> = ({ pieceId }) => {
    if (!pieceId) return null;

    const [puzzleId, row, col] = pieceId.split('_');
    const puzzle = PUZZLES.find(p => p.id === puzzleId);

    if (!puzzle) return null;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-[sticker-appear_3s_ease-in-out_forwards]">
            <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-2xl text-center flex flex-col items-center space-y-2 sm:space-y-4">
                <h3 className="text-2xl sm:text-3xl font-black text-yellow-500" style={{ textShadow: '2px 2px 2px rgba(0,0,0,0.2)' }}>
                    Новый пазл!
                </h3>
                <PuzzlePiece puzzle={puzzle} row={parseInt(row)} col={parseInt(col)} className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>
        </div>
    );
};


export const GameScreen: React.FC<{ 
  onBackToMenu: () => void; 
  difficulty: Difficulty;
  unlockedPieceCount: number;
  onPieceUnlock: () => void;
}> = ({ onBackToMenu, difficulty, unlockedPieceCount, onPieceUnlock }) => {
  const { problem, score, timeLeft, isGameOver, isPaused, setPause, startGame, handleAnswer } = useGameLogic(difficulty);
  const [trainState, setTrainState] = useState<'normal' | 'correct' | 'wrong'>('normal');
  const [scenerySpeed, setScenerySpeed] = useState(1);
  const [lastAwardedPieceId, setLastAwardedPieceId] = useState<PuzzlePieceId | null>(null);
  
  const [scoreChange, setScoreChange] = useState<{ value: number; key: number } | null>(null);
  const [timeChange, setTimeChange] = useState<{ value: number; key: number } | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prevScoreRef = useRef(0);

  useEffect(() => {
    startGame();
    prevScoreRef.current = 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const oldMilestone = Math.floor(prevScoreRef.current / PUZZLE_PIECE_AWARD_INTERVAL);
    const newMilestone = Math.floor(score / PUZZLE_PIECE_AWARD_INTERVAL);

    if (newMilestone > oldMilestone && unlockedPieceCount < ALL_PUZZLE_PIECES.length) {
      onPieceUnlock();
      const newPieceId = ALL_PUZZLE_PIECES[unlockedPieceCount];
      setLastAwardedPieceId(newPieceId);
      setTimeout(() => setLastAwardedPieceId(null), 3000); // Notification lasts 3s
    }

    prevScoreRef.current = score;
  }, [score, onPieceUnlock, unlockedPieceCount]);

  const onChoiceClick = (choice: Choice) => {
    const isCorrect = handleAnswer(choice);
    setTrainState(isCorrect ? 'correct' : 'wrong');
    
    if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
    }

    if (isCorrect) {
      setScoreChange({ value: 10, key: Date.now() });
      setTimeChange({ value: TIME_BONUS, key: Date.now() });
      setScenerySpeed(prev => Math.min(prev + 0.15, 2.5));
    } else {
      setTimeChange({ value: -TIME_PENALTY, key: Date.now() });
      setScenerySpeed(prev => Math.max(prev * 0.75, 0.5));
    }
    
    feedbackTimeoutRef.current = setTimeout(() => {
        setScoreChange(null);
        setTimeChange(null);
    }, 1500);

    setTimeout(() => {
        setTrainState('normal');
    }, 500);
  };

  const restartGame = () => {
    startGame();
    prevScoreRef.current = 0;
    setScenerySpeed(1);
  };
  
  if (!problem) {
    return <div className="w-full h-screen flex items-center justify-center bg-blue-100">Загрузка...</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {isGameOver && <GameOverModal score={score} onRestart={restartGame} onMenu={onBackToMenu} />}
      {isPaused && !isGameOver && <PauseModal onContinue={() => setPause(false)} onMenu={onBackToMenu} />}
      <NewPieceNotification pieceId={lastAwardedPieceId} />
      <Scenery speed={scenerySpeed} targetNumber={problem.targetNumber} />
      
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 p-2 sm:p-4 z-50 flex justify-between items-center text-white">
          <div className="relative flex items-center bg-white/50 backdrop-blur-sm p-1 px-2 sm:p-2 sm:px-4 rounded-full shadow-md">
              {scoreChange && (
                  <span key={scoreChange.key} className="absolute -top-8 left-1/2 -translate-x-1/2 text-xl sm:text-2xl font-bold text-yellow-500 animate-float-up">
                      +{scoreChange.value}
                  </span>
              )}
              <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              <span className="ml-2 text-2xl sm:text-3xl font-bold text-gray-800">{score}</span>
          </div>
           <button onClick={() => setPause(true)} className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/50 backdrop-blur-sm rounded-full shadow-md transform hover:scale-110 transition-transform">
              <PauseIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800" />
          </button>
          <div className="relative flex items-center bg-white/50 backdrop-blur-sm p-1 px-2 sm:p-2 sm:px-4 rounded-full shadow-md">
              {timeChange && (
                  <span
                      key={timeChange.key}
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xl sm:text-2xl font-bold animate-float-up ${
                          timeChange.value > 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                  >
                      {timeChange.value > 0 ? `+${timeChange.value}` : timeChange.value}
                  </span>
              )}
              <TimerIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              <span className="ml-2 text-2xl sm:text-3xl font-bold text-gray-800">{timeLeft}</span>
          </div>
      </div>
      
      {/* Game Area */}
      <div className="relative z-50 w-full h-full flex flex-col justify-end items-center pb-24 sm:pb-32">
        {/* Choices */}
        <div className="flex justify-center space-x-4 sm:space-x-8 md:space-x-12">
            {problem.choices.map((choice, index) => (
                <ChoiceButton key={index} choice={choice} operation={problem.operation} onClick={onChoiceClick} />
            ))}
        </div>
      </div>
       {/* Train Position */}
       <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 z-50">
           <div className="transform scale-75 sm:scale-100">
             <Train number={problem.startNumber} state={trainState} speed={scenerySpeed}/>
           </div>
       </div>
       <button
            onClick={onBackToMenu}
            className="absolute bottom-4 left-4 px-4 py-2 sm:px-6 sm:py-3 text-lg sm:text-xl font-bold text-white bg-gray-500/50 backdrop-blur-sm rounded-xl shadow-lg hover:bg-gray-600/70 transition-colors z-50"
        >
            Меню
        </button>
    </div>
  );
};

const style = document.createElement('style');
if (!document.getElementById('game-screen-styles')) {
    style.id = 'game-screen-styles';
    style.innerHTML = `
    @keyframes correct-answer {
        0% { transform: scaleX(-1) scale(1) translateX(0); }
        50% { transform: scaleX(-1) scale(1.1) translateX(20px); }
        100% { transform: scaleX(-1) scale(1) translateX(0); }
    }
    @keyframes wrong-answer {
        0%, 100% { transform: scaleX(-1) translateX(0); }
        25% { transform: scaleX(-1) translateX(10px) rotate(2deg); }
        75% { transform: scaleX(-1) translateX(-10px) rotate(-2deg); }
    }
    @keyframes steam-puff {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-80px) scale(0);
            opacity: 0;
        }
    }
    @keyframes sticker-appear {
      0% { opacity: 0; transform: scale(0.5) translate(-50%, -50%); }
      15% { opacity: 1; transform: scale(1.1) translate(-50%, -50%); }
      30% { opacity: 1; transform: scale(1) translate(-50%, -50%); }
      85% { opacity: 1; transform: scale(1) translate(-50%, -50%); }
      100% { opacity: 0; transform: scale(0.8) translate(-50%, -50%); }
    }
    @keyframes float-up {
      0% {
          opacity: 1;
          transform: translate(-50%, 0);
      }
      100% {
          opacity: 0;
          transform: translate(-50%, -50px);
      }
    }
    @keyframes spin-wheel {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
    }
    @keyframes sway {
        0%, 100% { transform: rotate(0deg) translateY(0px); }
        50% { transform: rotate(1.8deg) translateY(2px); }
    }
    .animate-float-up {
        animation: float-up 1.5s ease-out forwards;
    }
    .animate-\\[spin-wheel_linear_infinite\\] {
        animation-name: spin-wheel;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
    }
    .animate-\\[sway_3s_ease-in-out_infinite\\] {
      animation: sway 3s ease-in-out infinite;
    }
    `;
    document.head.appendChild(style);
}