
import React from 'react';
import { PuzzlePieceId, Puzzle } from '../types';
import { PUZZLES } from '../constants';
import { PuzzlePiece } from './puzzles';
import { StarIcon } from './icons';

interface PuzzleAlbumProps {
  onBack: () => void;
  unlockedPieces: PuzzlePieceId[];
}

const isPuzzleComplete = (puzzle: Puzzle, unlockedSet: Set<PuzzlePieceId>): boolean => {
    for (let r = 0; r < puzzle.rows; r++) {
        for (let c = 0; c < puzzle.cols; c++) {
            if (!unlockedSet.has(`${puzzle.id}_${r}_${c}`)) {
                return false;
            }
        }
    }
    return true;
};

export const PuzzleAlbum: React.FC<PuzzleAlbumProps> = ({ onBack, unlockedPieces }) => {
  // FIX: Explicitly typed the Set to `Set<PuzzlePieceId>` to resolve a TypeScript type inference issue where it was being inferred as `Set<unknown>`.
  const unlockedSet = new Set<PuzzlePieceId>(unlockedPieces);

  return (
    <div className="w-full h-screen flex flex-col items-center p-4 sm:p-8 bg-amber-100 overflow-y-auto" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d2b48c' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}>
      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-5xl">
        <h1 className="text-4xl sm:text-5xl font-black mb-8 text-center text-yellow-900">Мои пазлы</h1>
        
        <div className="space-y-12">
          {PUZZLES.map(puzzle => {
            const isComplete = isPuzzleComplete(puzzle, unlockedSet);
            return (
              <div key={puzzle.id}>
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-800 mb-4 flex items-center">
                  {puzzle.name}
                  {isComplete && <StarIcon className="w-8 h-8 ml-3 text-yellow-500" />}
                </h2>
                <div
                  className={`grid gap-1 bg-gray-300 p-2 rounded-lg shadow-inner relative overflow-hidden transition-all duration-500 ${isComplete ? 'shadow-yellow-400/50 shadow-lg ring-4 ring-yellow-400' : ''}`}
                  style={{
                    gridTemplateColumns: `repeat(${puzzle.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${puzzle.rows}, 1fr)`,
                  }}
                >
                  {Array.from({ length: puzzle.rows }).flatMap((_, r) =>
                    Array.from({ length: puzzle.cols }).map((_, c) => {
                      const pieceId: PuzzlePieceId = `${puzzle.id}_${r}_${c}`;
                      const isUnlocked = unlockedSet.has(pieceId);
                      return (
                          <div key={pieceId} className="aspect-square">
                              <PuzzlePiece
                                  puzzle={puzzle}
                                  row={r}
                                  col={c}
                                  className={`w-full h-full ${isUnlocked ? 'opacity-100' : 'opacity-20'}`}
                              />
                          </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {unlockedPieces.length === 0 && (
             <p className="text-xl text-center text-yellow-800 my-8">
              У вас пока нет фрагментов пазлов. Начните поездку, чтобы заработать их!
          </p>
        )}

        <div className="flex justify-center mt-10">
            <button
                onClick={onBack}
                className="px-10 py-4 text-2xl font-bold text-white bg-blue-500 rounded-xl shadow-lg hover:bg-blue-600 transition-colors"
            >
                Назад
            </button>
        </div>
      </div>
    </div>
  );
};
