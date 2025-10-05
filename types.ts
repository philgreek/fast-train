
export enum GameScreen {
  MainMenu,
  Playing,
  PuzzleAlbum,
}

export interface Choice {
  value: number;
  isCorrect: boolean;
}

export interface Problem {
  startNumber: number;
  targetNumber: number;
  operation: '+' | '-';
  choices: Choice[];
}

export enum Difficulty {
    Easy,
    Medium,
    Hard
}

export type PuzzlePieceId = string; // e.g., 'puzzle1_0_0'

// FIX: Added missing StickerId type to resolve compilation errors in 'StickerAlbum.tsx' and 'stickers.tsx'.
export type StickerId = 'locomotive' | 'sun' | 'tree' | 'cloud' | 'station';

export interface Puzzle {
  id: string;
  name: string;
  imageSrc: string;
  rows: number;
  cols: number;
}