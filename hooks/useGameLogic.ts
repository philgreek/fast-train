
import { useState, useCallback, useEffect, useRef } from 'react';
import { Problem, Choice, Difficulty } from '../types';
import { GAME_SETTINGS, INITIAL_TIME, TIME_BONUS, TIME_PENALTY } from '../constants';

export const useGameLogic = (difficulty: Difficulty) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const generateProblem = useCallback(() => {
    const settings = GAME_SETTINGS[difficulty];
    const [min, max] = settings.numberRange;
    const operation = settings.operations[Math.floor(Math.random() * settings.operations.length)];

    let startNumber: number;
    let targetNumber: number;
    
    if (operation === '+') {
        targetNumber = Math.floor(Math.random() * (max - min)) + min + 1;
        startNumber = Math.floor(Math.random() * (targetNumber - 1)) + 1;
    } else { // '-'
        startNumber = Math.floor(Math.random() * (max - min)) + min + 1;
        targetNumber = Math.floor(Math.random() * (startNumber - 1)) + 1;
    }

    const correctValue = Math.abs(targetNumber - startNumber);
    
    let incorrectValue;
    do {
      const offset = Math.random() > 0.5 ? 1 : -1;
      incorrectValue = correctValue + offset;
    } while (incorrectValue <= 0 || incorrectValue === correctValue);

    const choices = [
      { value: correctValue, isCorrect: true },
      { value: incorrectValue, isCorrect: false },
    ].sort(() => Math.random() - 0.5);

    setProblem({ startNumber, targetNumber, operation, choices });
  }, [difficulty]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
  }, []);


  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setIsGameOver(false);
    setIsPaused(false);
    generateProblem();
  }, [generateProblem]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
        timerRef.current = window.setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    stopTimer();
                    setIsGameOver(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    } else {
        stopTimer();
    }

    return () => stopTimer();
  }, [isPaused, isGameOver, stopTimer]);

  const handleAnswer = useCallback((choice: Choice) => {
    if (isGameOver || isPaused) return;

    if (choice.isCorrect) {
      setScore(prev => prev + 10);
      setTimeLeft(prev => Math.min(INITIAL_TIME, prev + TIME_BONUS));
      generateProblem();
      return true;
    } else {
      setTimeLeft(prev => Math.max(0, prev - TIME_PENALTY));
      return false;
    }
  }, [isGameOver, isPaused, generateProblem]);

  return { problem, score, timeLeft, isGameOver, isPaused, setPause: setIsPaused, startGame, handleAnswer };
};