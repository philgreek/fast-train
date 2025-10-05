import React, { useState, useEffect } from 'react';
import { GameScreen as GameScreenEnum, Difficulty, PuzzlePieceId } from './types';
import { MainMenu } from './components/MainMenu';
import { GameScreen } from './components/GameScreen';
import { PuzzleAlbum } from './components/PuzzleAlbum';
import { BubbleGame } from './components/BubbleGame';
import { ALL_PUZZLE_PIECES } from './constants';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreenEnum>(
    GameScreenEnum.MainMenu
  );

  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const savedDifficulty = localStorage.getItem('trainGameDifficulty');
    return savedDifficulty ? JSON.parse(savedDifficulty) : Difficulty.Easy;
  });

  const [unlockedPieces, setUnlockedPieces] = useState<PuzzlePieceId[]>(() => {
    const savedPieces = localStorage.getItem('trainGameUnlockedPieces');
    return savedPieces ? JSON.parse(savedPieces) : [];
  });

  useEffect(() => {
    localStorage.setItem('trainGameDifficulty', JSON.stringify(difficulty));
  }, [difficulty]);
  
  useEffect(() => {
    localStorage.setItem('trainGameUnlockedPieces', JSON.stringify(unlockedPieces));
  }, [unlockedPieces]);


  const handlePieceUnlock = () => {
    if (unlockedPieces.length < ALL_PUZZLE_PIECES.length) {
      const newPiece = ALL_PUZZLE_PIECES[unlockedPieces.length];
      setUnlockedPieces(prev => [...prev, newPiece]);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case GameScreenEnum.Playing:
        return <GameScreen 
                  onBackToMenu={() => setCurrentScreen(GameScreenEnum.MainMenu)} 
                  difficulty={difficulty}
                  unlockedPieceCount={unlockedPieces.length}
                  onPieceUnlock={handlePieceUnlock}
                />;
      case GameScreenEnum.PuzzleAlbum:
        return <PuzzleAlbum onBack={() => setCurrentScreen(GameScreenEnum.MainMenu)} unlockedPieces={unlockedPieces} />;
      case GameScreenEnum.BubbleGame:
        return <BubbleGame onBackToMenu={() => setCurrentScreen(GameScreenEnum.MainMenu)} />;
      case GameScreenEnum.MainMenu:
      default:
        return <MainMenu onScreenChange={setCurrentScreen} setDifficulty={setDifficulty} currentDifficulty={difficulty} />;
    }
  };

  return (
    <div className="w-screen h-screen">
       {renderScreen()}
    </div>
  );
};

export default App;
