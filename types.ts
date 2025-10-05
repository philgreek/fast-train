export enum GameScreen {
  MainMenu,
  Playing,
  PuzzleAlbum,
  BubbleGame,
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

export interface Puzzle {
  id: string;
  name: string;
  imageSrc: string;
  rows: number;
  cols: number;
}

export interface Bubble {
  id: number;
  x: number;
  y: number;
  radius: number;
  value: number;
  vx: number;
  vy: number;
  isCollidingWith: number[] | null; // IDs of bubbles it's colliding with
  isDragged?: boolean;
  state: 'idle' | 'spawning' | 'merging' | 'splitting';
  animationProgress: number; // 0 to 1 for animations
}