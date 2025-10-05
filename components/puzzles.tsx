
import React from 'react';
import { Puzzle } from '../types';

interface PuzzlePieceProps {
    puzzle: Puzzle;
    row: number;
    col: number;
    className?: string;
}

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({ puzzle, row, col, className }) => {
    const { imageSrc, rows, cols } = puzzle;
    
    // Correct calculation for background-position percentage to avoid seams
    const bgPosX = cols > 1 ? (col / (cols - 1)) * 100 : 0;
    const bgPosY = rows > 1 ? (row / (rows - 1)) * 100 : 0;

    return (
        <div
            className={`transition-opacity duration-500 ${className}`}
            style={{
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            }}
        />
    );
};