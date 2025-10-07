
import { Puzzle, PuzzlePieceId } from './types';

export const COLORS = {
  background: '#E3F2FD', // soft blue
  accentYellow: '#FFD54F',
  accentGreen: '#A5D6A7',
  accentRed: '#EF5350',
  textDark: '#263238',
  white: '#FFFFFF',
};

export const GAME_SETTINGS = {
  [0]: { // Easy
    numberRange: [1, 10],
    operations: ['+'] as ('+' | '-')[],
    time: 60,
  },
  [1]: { // Medium
    numberRange: [1, 20],
    operations: ['+', '-'] as ('+' | '-')[],
    time: 45,
  },
  [2]: { // Hard
    numberRange: [10, 50],
    operations: ['+', '-'] as ('+' | '-')[],
    time: 30,
  }
};

export const INITIAL_TIME = 60;
export const TIME_BONUS = 5;
export const TIME_PENALTY = 3;

export const PUZZLES: Puzzle[] = [
  {
    id: 'puzzle1',
    name: 'Лисёнок',
    imageSrc: 'data:image/png;base64,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',
    // FIX: Добавлены недостающие свойства `rows` и `cols` для соответствия типу Puzzle.
    rows: 4,
    cols: 3,
  },
];

// FIX: Добавлена константа ALL_PUZZLE_PIECES для предоставления канонического списка всех доступных частей пазла.
export const ALL_PUZZLE_PIECES: PuzzlePieceId[] = PUZZLES.flatMap(puzzle =>
  Array.from({ length: puzzle.rows }).flatMap((_, r) =>
    Array.from({ length: puzzle.cols }).map((_, c) => `${puzzle.id}_${r}_${c}`)
  )
);

// FIX: Добавлена константа PUZZLE_PIECE_AWARD_INTERVAL для определения количества очков, необходимых для разблокировки новой части пазла.
export const PUZZLE_PIECE_AWARD_INTERVAL = 50;


// FIX: Добавлена константа PLACE_VALUE_COLORS для обеспечения тематических цветов в игре NumberCounter.
export const PLACE_VALUE_COLORS = {
  0: 'from-green-300 to-green-500', // единицы
  1: 'from-blue-300 to-blue-500',   // десятки
  2: 'from-red-300 to-red-500',     // сотни
  3: 'from-purple-300 to-purple-500', // тысячи
};
