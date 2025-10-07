import React, { useRef, useEffect, useCallback } from 'react';
import { useBubbleGameLogic } from '../hooks/useBubbleGameLogic';
import { Bubble, Difficulty } from '../types';
import { StarIcon, TimerIcon } from './icons';

interface BubbleGameProps {
  onBackToMenu: () => void;
  difficulty: Difficulty;
}

const drawBubble = (ctx: CanvasRenderingContext2D, bubble: Bubble) => {
    ctx.save();
    
    let currentRadius = bubble.radius;
    let opacity = 1;

    switch (bubble.state) {
        case 'spawning':
            currentRadius = bubble.radius * bubble.animationProgress;
            opacity = bubble.animationProgress;
            break;
        case 'splitting':
            currentRadius = bubble.radius * (1 - bubble.animationProgress);
            opacity = 1 - bubble.animationProgress;
            break;
        case 'merging':
            const pulse = 1 - 0.5 * Math.sin(bubble.animationProgress * Math.PI);
            currentRadius = bubble.radius * pulse;
            break;
    }
    
    ctx.globalAlpha = opacity;
    
    const isDragged = bubble.isDragged;

    const gradient = ctx.createRadialGradient(bubble.x - currentRadius * 0.2, bubble.y - currentRadius * 0.2, currentRadius * 0.1, bubble.x, bubble.y, currentRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(1, isDragged ? 'rgba(255, 235, 59, 0.8)' : 'rgba(100, 181, 246, 0.7)');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = isDragged ? 'rgba(255, 235, 59, 1)' : 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = isDragged ? 5 : 3;
    
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, currentRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (currentRadius > 10) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${currentRadius * 0.7}px Nunito`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(String(bubble.value), bubble.x, bubble.y);
    }
    
    ctx.restore();
};

type Ripple = { x: number; y: number; progress: number; maxRadius: number };

export const BubbleGame: React.FC<BubbleGameProps> = ({ onBackToMenu, difficulty }) => {
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
    const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const ripplesRef = useRef<Ripple[]>([]);
    const timeRef = useRef(0);

    const createRipple = useCallback((x: number, y: number, radius: number) => {
        ripplesRef.current.push({ x, y, progress: 0, maxRadius: radius * 2 });
    }, []);
    
    const { bubbles, targetValue, score, timeLeft, isGameOver, resetGame, handleDoubleClick, handleMouseDown, handleMouseMove, handleMouseUp } = useBubbleGameLogic(mainCanvasRef, createRipple, difficulty);
    
    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!mainCanvasRef.current) return;
        const rect = mainCanvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleMouseDown(x, y);
    };
    
    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!mainCanvasRef.current) return;
        const rect = mainCanvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleMouseMove(x, y);
    };

    const onMouseUp = () => {
        handleMouseUp();
    };
    
    const onMouseLeave = () => {
        handleMouseUp();
    };

    const onDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!mainCanvasRef.current) return;
        const rect = mainCanvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleDoubleClick(x, y);
    };

    useEffect(() => {
        const mainCanvas = mainCanvasRef.current;
        const backgroundCanvas = backgroundCanvasRef.current;
        const foregroundCanvas = foregroundCanvasRef.current;
        if (!mainCanvas || !backgroundCanvas || !foregroundCanvas) return;
        
        const mainCtx = mainCanvas.getContext('2d');
        const backgroundCtx = backgroundCanvas.getContext('2d');
        const foregroundCtx = foregroundCanvas.getContext('2d');
        if (!mainCtx || !backgroundCtx || !foregroundCtx) return;
        
        let animationFrameId: number;

        const setupCanvases = () => {
             const dpr = window.devicePixelRatio || 1;
             [mainCanvas, backgroundCanvas, foregroundCanvas].forEach(canvas => {
                const rect = canvas.getBoundingClientRect();
                if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                    canvas.width = rect.width * dpr;
                    canvas.height = rect.height * dpr;
                    canvas.getContext('2d')?.scale(dpr, dpr);
                }
             });
        };

        const drawCaustics = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
            ctx.fillStyle = '#60a5fa'; // tailwind blue-400, for a nice water color
            ctx.fillRect(0, 0, width, height);
            ctx.save();
            ctx.globalCompositeOperation = 'soft-light';

            const drawLayer = (speed: number, size: number, opacity: number, offset: number) => {
                const x = Math.sin(time * speed + offset) * width * 0.4 + width / 2;
                const y = Math.cos(time * speed * 0.7 + offset * 2) * height * 0.4 + height / 2;
                const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
                grad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            };

            // Increased opacity for better visibility
            drawLayer(0.0003, width * 0.6, 0.2, 1);
            drawLayer(0.0005, width * 0.5, 0.25, 3);
            drawLayer(0.0007, width * 0.4, 0.15, 5);
            ctx.restore();
        };

        const drawRipples = (ctx: CanvasRenderingContext2D) => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ripplesRef.current = ripplesRef.current.filter(r => r.progress < 1);
            
            ripplesRef.current.forEach(ripple => {
                ripple.progress += 0.02;
                const currentRadius = ripple.maxRadius * ripple.progress;
                const opacity = 1 - ripple.progress;
                const lineWidth = 4 * (1 - ripple.progress);

                ctx.save();
                // Crest (lighter)
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, currentRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
                ctx.lineWidth = lineWidth + 1;
                ctx.stroke();

                // Trough (darker, slightly offset)
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, Math.max(0, currentRadius - lineWidth), 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 50, 100, ${opacity * 0.1})`;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
                ctx.restore();
            });
        };

        const render = () => {
            timeRef.current += 1;
            const { clientWidth, clientHeight } = mainCanvas;

            drawCaustics(backgroundCtx, clientWidth, clientHeight, timeRef.current);

            mainCtx.clearRect(0, 0, clientWidth, clientHeight);
            bubbles.forEach(bubble => {
                drawBubble(mainCtx, bubble);
            });

            drawRipples(foregroundCtx);
            
            animationFrameId = requestAnimationFrame(render);
        };
        
        setupCanvases();
        render();

        const handleResize = () => setupCanvases();
        window.addEventListener('resize', handleResize);
        
        return () => {
             window.removeEventListener('resize', handleResize);
             cancelAnimationFrame(animationFrameId);
        }
    }, [bubbles]);


    return (
        <div className="relative w-full h-screen bg-gradient-to-br from-sky-200 to-indigo-300 overflow-hidden select-none">
            <div className="absolute top-0 left-0 right-0 p-2 sm:p-4 z-50 flex justify-between items-center text-white">
                <div className="flex items-center bg-white/50 backdrop-blur-sm p-1 px-2 sm:p-2 sm:px-4 rounded-full shadow-md">
                    <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                    <span className="ml-2 text-2xl sm:text-3xl font-bold text-gray-800">{score}</span>
                </div>
                <div className="flex flex-col items-center p-1 sm:p-2 rounded-2xl bg-black/20 backdrop-blur-sm">
                    <span className="text-base sm:text-xl font-bold text-white/80">ЦЕЛЬ</span>
                    <span className="text-4xl sm:text-5xl font-black text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>{targetValue}</span>
                </div>
                <div className="flex items-center bg-white/50 backdrop-blur-sm p-1 px-2 sm:p-2 sm:px-4 rounded-full shadow-md">
                    <TimerIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                    <span className="ml-2 text-2xl sm:text-3xl font-bold text-gray-800">{timeLeft}</span>
                </div>
            </div>

            <canvas ref={backgroundCanvasRef} className="absolute top-0 left-0 w-full h-full z-10" />
            <canvas 
              ref={mainCanvasRef} 
              className="absolute top-0 left-0 w-full h-full z-20 cursor-pointer"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onDoubleClick={onDoubleClick}
            />
            <canvas ref={foregroundCanvasRef} className="absolute top-0 left-0 w-full h-full z-30 pointer-events-none" />

            {isGameOver && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[101] p-4">
                    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl text-center flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-md">
                        <h2 className="text-4xl sm:text-5xl font-black text-gray-800">Время вышло!</h2>
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