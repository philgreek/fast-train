
import { useState, useEffect, useRef, useCallback, RefObject } from 'react';
import { Bubble, Difficulty } from '../types';

const BASE_BUBBLE_SIZE = 5;
const GAME_DURATION = 60;
const TIME_BONUS_BUBBLE = 5;

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const radiusFromValue = (value: number) => Math.sqrt(value) * BASE_BUBBLE_SIZE + 15;

const getLevelSettings = (difficulty: Difficulty) => {
    switch (difficulty) {
        case Difficulty.Easy:
            return { maxBubbles: 7, maxSpeed: 0.5, minBubbles: 5, targetRange: [15, 30] as [number, number] };
        case Difficulty.Medium:
            return { maxBubbles: 10, maxSpeed: 0.8, minBubbles: 7, targetRange: [30, 60] as [number, number] };
        case Difficulty.Hard:
            return { maxBubbles: 13, maxSpeed: 1.1, minBubbles: 9, targetRange: [50, 100] as [number, number] };
        default:
            return { maxBubbles: 7, maxSpeed: 0.5, minBubbles: 5, targetRange: [15, 30] as [number, number] };
    }
};

const createBubble = (value: number, x: number, y: number, vx?: number, vy?: number): Bubble => ({
    id: Date.now() + Math.random(),
    x, y,
    radius: radiusFromValue(value),
    value,
    vx: vx ?? random(-0.5, 0.5),
    vy: vy ?? random(-0.5, 0.5),
    isCollidingWith: null,
    state: 'spawning',
    animationProgress: 0,
});

export const useBubbleGameLogic = (
    // FIX: Replaced `React.RefObject` with the imported `RefObject` type to resolve the "Cannot find namespace 'React'" error.
    canvasRef: RefObject<HTMLCanvasElement>,
    createRipple: (x: number, y: number, radius: number) => void,
    difficulty: Difficulty
) => {
    const bubblesRef = useRef<Bubble[]>([]);
    const [targetValue, setTargetValue] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [isGameOver, setIsGameOver] = useState(false);
    
    const animationFrameId = useRef<number | null>(null);
    const timerId = useRef<number | null>(null);
    const timeScaleRef = useRef(1);
    
    const draggedBubbleIdRef = useRef<number | null>(null);
    const dragOffsetRef = useRef<{ x: number, y: number } | null>(null);


    const generateTarget = useCallback(() => {
        const settings = getLevelSettings(difficulty);
        setTargetValue(Math.floor(random(settings.targetRange[0], settings.targetRange[1])));
    }, [difficulty]);

    const resetGame = useCallback(() => {
        if (!canvasRef.current) return;
        
        setIsGameOver(false);
        setScore(0);
        setTimeLeft(GAME_DURATION);
        generateTarget();
        bubblesRef.current = [];
        const settings = getLevelSettings(difficulty);
        for (let i = 0; i < settings.maxBubbles; i++) {
            const value = Math.floor(random(5, 30));
            bubblesRef.current.push(
                createBubble(
                    value,
                    random(radiusFromValue(value), canvasRef.current.clientWidth - radiusFromValue(value)),
                    random(radiusFromValue(value), canvasRef.current.clientHeight - radiusFromValue(value))
                )
            );
        }
    }, [canvasRef, generateTarget, difficulty]);

    useEffect(() => {
        const timeoutId = setTimeout(() => resetGame(), 100);
        return () => clearTimeout(timeoutId);
    }, [resetGame]);

    useEffect(() => {
        if (isGameOver) {
            if (timerId.current) clearInterval(timerId.current);
            return;
        }
        timerId.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsGameOver(true);
                    clearInterval(timerId.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            if (timerId.current) clearInterval(timerId.current);
        };
    }, [isGameOver]);

    const handleMerge = useCallback((b1: Bubble, b2: Bubble) => {
        timeScaleRef.current = 0.1; // Slow-mo
        b1.state = 'merging';
        b2.state = 'merging';
        b1.animationProgress = 0;
        b2.animationProgress = 0;
    }, []);

    const handleSplit = useCallback((bubble: Bubble) => {
        if (bubble.value < 2) return;
        timeScaleRef.current = 0.1; // Slow-mo
        bubble.state = 'splitting';
        bubble.animationProgress = 0;
    }, []);
    
    const handleMouseDown = useCallback((x: number, y: number) => {
        if (isGameOver) return;
        for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
            const b = bubblesRef.current[i];
            const dist = Math.hypot(x - b.x, y - b.y);
            if (dist < b.radius) {
                createRipple(b.x, b.y, b.radius);
                draggedBubbleIdRef.current = b.id;
                dragOffsetRef.current = { x: x - b.x, y: y - b.y };
                b.isDragged = true;
                b.vx = 0;
                b.vy = 0;
                // Move bubble to the end of the array to draw it on top
                bubblesRef.current.splice(i, 1);
                bubblesRef.current.push(b);
                return;
            }
        }
    }, [isGameOver, createRipple]);

    const handleMouseMove = useCallback((x: number, y: number) => {
        if (draggedBubbleIdRef.current === null) return;
        const draggedBubble = bubblesRef.current.find(b => b.id === draggedBubbleIdRef.current);
        if (draggedBubble && dragOffsetRef.current) {
            draggedBubble.x = x - dragOffsetRef.current.x;
            draggedBubble.y = y - dragOffsetRef.current.y;
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        if (draggedBubbleIdRef.current === null) return;
        const draggedBubble = bubblesRef.current.find(b => b.id === draggedBubbleIdRef.current);
        if (!draggedBubble) return;

        let targetBubble: Bubble | null = null;
        for (const b of bubblesRef.current) {
            if (b.id === draggedBubble.id) continue;
            const dist = Math.hypot(draggedBubble.x - b.x, b.y - b.y);
            if (dist < b.radius + draggedBubble.radius * 0.7) {
                targetBubble = b;
                break;
            }
        }
        
        if (targetBubble) {
            handleMerge(draggedBubble, targetBubble);
        } else {
            draggedBubble.vx = random(-0.5, 0.5);
            draggedBubble.vy = random(-0.5, 0.5);
        }

        draggedBubble.isDragged = false;
        draggedBubbleIdRef.current = null;
        dragOffsetRef.current = null;
    }, [handleMerge]);

    const handleDoubleClick = useCallback((x: number, y: number) => {
        if (isGameOver || draggedBubbleIdRef.current !== null) return;

        let clickedBubble: Bubble | null = null;
        for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
            const b = bubblesRef.current[i];
            const dist = Math.hypot(x - b.x, y - b.y);
            if (dist < b.radius) {
                clickedBubble = b;
                // Ripple is now handled by onMouseDown, which fires before onDoubleClick
                break;
            }
        }

        if (clickedBubble) {
            handleSplit(clickedBubble);
        }
    }, [isGameOver, handleSplit]);

    useEffect(() => {
        const gameLoop = () => {
            animationFrameId.current = requestAnimationFrame(gameLoop);
            if (!canvasRef.current) return;
            const { clientWidth, clientHeight } = canvasRef.current;
            const currentBubbles = bubblesRef.current;
            
            timeScaleRef.current += (1 - timeScaleRef.current) * 0.05;

            const settings = getLevelSettings(difficulty);
            if (currentBubbles.length < settings.minBubbles && clientWidth > 0) {
                 const value = Math.floor(random(5, 30));
                 bubblesRef.current.push(createBubble(value, random(radiusFromValue(value), clientWidth - radiusFromValue(value)), -radiusFromValue(value)));
            }

            currentBubbles.forEach(b => b.isCollidingWith = null);

            for (let i = currentBubbles.length - 1; i >= 0; i--) {
                const b = currentBubbles[i];
                b.animationProgress = Math.min(1, b.animationProgress + 0.07);

                if ((b.state === 'idle' || b.state === 'spawning') && !b.isDragged) {
                    if (b.state === 'spawning' && b.animationProgress >= 1) {
                        b.state = 'idle';
                    }
                    b.x += b.vx * timeScaleRef.current;
                    b.y += b.vy * timeScaleRef.current;
    
                    if ((b.x - b.radius < 0 && b.vx < 0) || (b.x + b.radius > clientWidth && b.vx > 0)) b.vx *= -1;
                    if ((b.y - b.radius < 0 && b.vy < 0) || (b.y + b.radius > clientHeight && b.vy > 0)) b.vy *= -1;

                    for (let j = i - 1; j >= 0; j--) {
                        const other = currentBubbles[j];
                        if (other.isDragged || (other.state !== 'idle' && other.state !== 'spawning')) continue;

                        const dist = Math.hypot(b.x - other.x, b.y - other.y);
                        if (dist < b.radius + other.radius) {
                            const overlap = b.radius + other.radius - dist;
                            const dx = (b.x - other.x) / dist;
                            const dy = (b.y - other.y) / dist;
                            
                            b.x += dx * overlap * 0.5;
                            b.y += dy * overlap * 0.5;
                            other.x -= dx * overlap * 0.5;
                            other.y -= dy * overlap * 0.5;
                        }
                    }
                } else if (b.state === 'splitting') {
                    if (b.animationProgress >= 1) {
                        const val1 = Math.ceil(random(1, b.value - 1));
                        const val2 = b.value - val1;
                        if (val1 > 0 && val2 > 0) {
                            bubblesRef.current.push(createBubble(val1, b.x - 10, b.y - 10, -b.vx - 1, -b.vy - 1));
                            bubblesRef.current.push(createBubble(val2, b.x + 10, b.y + 10, b.vx + 1, b.vy + 1));
                        }
                        bubblesRef.current.splice(i, 1);
                    }
                } else if (b.state === 'merging') {
                    if (b.animationProgress >= 1) {
                        const colliding = bubblesRef.current.filter(bub => bub.state === 'merging');
                        if (colliding.length === 2) {
                             const [b1, b2] = colliding;
                             const newValue = b1.value + b2.value;
                             const newX = (b1.x + b2.x) / 2;
                             const newY = (b1.y + b2.y) / 2;
                             const newBubble = createBubble(newValue, newX, newY);
                             bubblesRef.current.push(newBubble);
                             
                             if (newValue === targetValue) {
                                setScore(s => s + newValue);
                                setTimeLeft(t => t + TIME_BONUS_BUBBLE);
                                generateTarget();
                             }
                        }
                        bubblesRef.current = bubblesRef.current.filter(bub => bub.state !== 'merging');
                        break;
                    }
                }
            }
        };
        if (!isGameOver) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [isGameOver, difficulty, generateTarget, canvasRef]);

    return { bubbles: bubblesRef.current, targetValue, score, timeLeft, isGameOver, resetGame, handleDoubleClick, handleMouseDown, handleMouseMove, handleMouseUp };
};
