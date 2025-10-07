import React, { useRef, useEffect } from 'react';
import { useTowerGameLogic } from '../hooks/useTowerGameLogic';
import { TowerNode, Difficulty } from '../types';
import { StarIcon, TimerIcon } from './icons';

interface TowerGameProps {
    onBackToMenu: () => void;
    difficulty: Difficulty;
}

const drawNode = (ctx: CanvasRenderingContext2D, node: TowerNode) => {
    ctx.save();
    
    let scale = (node.state === 'spawning') ? node.animationProgress : 1;
    if (node.state === 'selected') {
        scale = 1.1;
    }

    ctx.translate(node.x, node.y);
    ctx.scale(scale, scale);

    const gradient = ctx.createRadialGradient(-node.radius * 0.3, -node.radius * 0.3, node.radius * 0.1, 0, 0, node.radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(1, node.state === 'selected' ? 'rgba(255, 213, 79, 0.8)' : (node.decomposedFrom !== null ? 'rgba(179, 229, 252, 0.7)' : 'rgba(129, 212, 250, 0.7)'));


    ctx.fillStyle = gradient;
    ctx.strokeStyle = node.state === 'selected' ? 'rgba(255, 193, 7, 1)' : 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = node.state === 'selected' ? 6 : 4;
    
    ctx.beginPath();
    ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1E3A8A'; // Dark blue for text
    ctx.font = `bold ${node.radius * 0.8}px Nunito`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 5;
    ctx.fillText(String(node.value), 0, 0);
    
    ctx.restore();
};

const drawConnection = (ctx: CanvasRenderingContext2D, from: TowerNode, to: TowerNode) => {
    ctx.save();
    
    const isDecompositionLink = to.decomposedFrom === from.id;
    const isSummationLink = to.parents?.includes(from.id);

    if (isDecompositionLink) {
        ctx.strokeStyle = '#BDBDBD'; // Grey for support beams
        ctx.lineWidth = 8;
    } else if (isSummationLink) {
        ctx.strokeStyle = '#A1887F'; // Brownish color for plank
        ctx.lineWidth = 15;
    } else {
        // Fallback for any other connection type if needed
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
    }

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
};

const drawDragLine = (ctx: CanvasRenderingContext2D, start: {x:number, y:number}, end: {x:number, y:number}) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}

export const TowerGame: React.FC<TowerGameProps> = ({ onBackToMenu, difficulty }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { nodes, connections, score, timeLeft, isGameOver, targetNumber, resetGame, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleDoubleClick, getDragLine, viewOffset, scale } = useTowerGameLogic(canvasRef, difficulty);

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        handleMouseDown(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        handleMouseMove(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        handleMouseUp(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        handleDoubleClick(e.clientX - rect.left, e.clientY - rect.top);
    };


    const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        handleWheel(e);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const setupCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
            }
        };

        const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#81D4FA'); // Light Blue
            gradient.addColorStop(1, '#E1F5FE'); // Lighter Blue
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        };
        
        const drawGround = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
             // Ground - stays relative to the screen bottom
             const groundY = height - 50;
             ctx.fillStyle = '#A5D6A7'; // Green
             ctx.fillRect(0, groundY, width, 50);
             ctx.fillStyle = '#8BC34A'; // Darker green top line
             ctx.fillRect(0, groundY, width, 5);
        }

        const render = () => {
            setupCanvas();
            const { clientWidth, clientHeight } = canvas;
            
            ctx.clearRect(0, 0, clientWidth, clientHeight);
            
            // Background is drawn in screen space
            drawBackground(ctx, clientWidth, clientHeight);
            
            // Apply camera transforms for world space
            ctx.save();
            ctx.translate(viewOffset.x, viewOffset.y);
            ctx.scale(scale, scale);

            // Draw connections first
            connections.forEach(conn => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (fromNode && toNode) {
                    drawConnection(ctx, fromNode, toNode);
                }
            });

            // Draw ground (in world space, so it scrolls)
            drawGround(ctx, clientWidth / scale, clientHeight / scale);

            // Draw nodes
            nodes.forEach(node => drawNode(ctx, node));

            // Draw drag line
            const dragLine = getDragLine();
            if (dragLine) {
                drawDragLine(ctx, dragLine.start, dragLine.end);
            }

            ctx.restore();
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        const resizeListener = () => setupCanvas();
        window.addEventListener('resize', resizeListener);

        return () => {
            window.removeEventListener('resize', resizeListener);
            cancelAnimationFrame(animationFrameId);
        };
    }, [nodes, connections, getDragLine, viewOffset, scale]);

    return (
        <div className="relative w-full h-screen bg-sky-200 overflow-hidden select-none">
            {/* UI Elements */}
            <div className="absolute top-0 left-0 right-0 p-2 sm:p-4 z-50 flex justify-between items-center text-white">
                <div className="flex items-center bg-white/50 backdrop-blur-sm p-1 px-2 sm:p-2 sm:px-4 rounded-full shadow-md">
                    <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                    <span className="ml-2 text-2xl sm:text-3xl font-bold text-gray-800">{score}</span>
                </div>
                 <div className="flex flex-col items-center p-1 sm:p-2 rounded-2xl bg-black/20 backdrop-blur-sm">
                    <span className="text-base sm:text-xl font-bold text-white/80">ЦЕЛЬ</span>
                    <span className="text-4xl sm:text-5xl font-black text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>{targetNumber}</span>
                </div>
                <div className="flex items-center bg-white/50 backdrop-blur-sm p-1 px-2 sm:p-2 sm:px-4 rounded-full shadow-md">
                    <TimerIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                    <span className="ml-2 text-2xl sm:text-3xl font-bold text-gray-800">{timeLeft}</span>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full z-10 cursor-grab active:cursor-grabbing"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onDoubleClick={onDoubleClick}
                onWheel={onWheel}
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
                className="absolute bottom-4 left-4 px-4 py-2 sm:px-6 sm:py-3 text-lg sm:text-xl font-bold text-white bg-gray-500/50 backdrop-blur-sm rounded-xl shadow-lg hover:bg-gray-600/70 transition-colors z-50"
            >
                Меню
            </button>
        </div>
    );
};
