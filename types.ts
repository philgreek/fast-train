export enum GameScreen {
  MainMenu,
  Playing,
  PuzzleAlbum,
  BubbleGame,
  TowerGame,
  NumberCounter,
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

export interface TowerNode {
  id: number;
  x: number;
  y: number;
  value: number;
  radius: number;
  isBase: boolean;
  parents: [number, number] | null;
  decomposedFrom: number | null; // ID of the parent node this node was decomposed from
  state: 'idle' | 'spawning' | 'selected';
  animationProgress: number; // 0 to 1
}

// Types for NumberCounter Game
export type ActionType = 'DECOMPOSE' | 'INPUT_ANSWER' | 'SELECT_PARTS' | 'END_STEP';

export interface NumberPart {
  id: string; // Unique ID, e.g. "n1_tens"
  text: string;
  value: number;
  type: 'number' | 'operator' | 'equals' | 'question';
  placeValue: 0 | 1 | 2 | 3; // units, tens, etc.
  isClickable: boolean;
  isPulsing: boolean;
  isSolved: boolean;
}

export type EquationLine = NumberPart[];

export interface GameStep {
  lines: EquationLine[];
  action: {
    type: ActionType;
    triggerPartIds: string[];
    correctAnswer?: number;
    requiredSelections?: number;
    validator?: (selection: number[]) => boolean;
  };
  prompt?: string;
}

export interface NumberCounterProblem {
  id: string;
  steps: GameStep[];
}
