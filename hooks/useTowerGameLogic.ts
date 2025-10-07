
import { useState, useRef, useCallback, useEffect, RefObject, WheelEvent } from 'react';
import { TowerNode, Difficulty } from '../types';

const GAME_DURATION = 120; // 2 minutes
const NODE_RADIUS = 40;
const VERTICAL_SPACING = 120;
const BASE_Y_OFFSET = 50; // from bottom
const MIN_SCALE = 0.4;
const MAX_SCALE = 2.0;

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const createNode = (id: number, value: number, x: number, y: number, isBase = false, parents: [number, number] | null = null, decomposedFrom: number | null = null): TowerNode => ({
    id,
    value,
    x,
    y,
    isBase,
    parents,
    decomposedFrom,
    radius: NODE_RADIUS,
    state: 'spawning',
    animationProgress: 0,
});

const getDifficultySettings = (difficulty: Difficulty) => {
    switch (difficulty) {
        case Difficulty.Easy:
            return { baseRange: [5, 15] as [number, number], targetBonus: [5, 15] as [number, number] };
        case Difficulty.Medium:
            return { baseRange: [10, 25] as [number, number], targetBonus: [10, 30] as [number, number] };
        case Difficulty.Hard:
            return { baseRange: [20, 50] as [number, number], targetBonus: [25, 50] as [number, number] };
        default:
            return { baseRange: [5, 15] as [number, number], targetBonus: [5, 15] as [number, number] };
    }
}

export const useTowerGameLogic = (
    // FIX: Replaced `React.RefObject` with the imported `RefObject` type to resolve the "Cannot find namespace 'React'" error.
    canvasRef: RefObject<HTMLCanvasElement>, difficulty: Difficulty) => {
    const [nodes, setNodes] = useState<TowerNode[]>([]);
    const [connections, setConnections] = useState<{from: number, to: number}[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [targetNumber, setTargetNumber] = useState(0);

    // View state
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);

    // Refs for interaction and smooth camera
    const animationFrameId = useRef<number | null>(null);
    const timerId = useRef<number | null>(null);
    const targetViewOffset = useRef({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const draggingNodeId = useRef<number | null>(null);
    const dragLineEnd = useRef<{x: number, y: number} | null>(null);

    const screenToWorld = useCallback((x: number, y: number) => {
        return {
            x: (x - viewOffset.x) / scale,
            y: (y - viewOffset.y) / scale,
        };
    }, [viewOffset, scale]);

    const resetGame = useCallback(() => {
        if (!canvasRef.current) return;
        const { clientWidth, clientHeight } = canvasRef.current;
        
        setIsGameOver(false);
        setScore(0);
        setTimeLeft(GAME_DURATION);
        
        const settings = getDifficultySettings(difficulty);
        const baseValue1 = Math.floor(random(settings.baseRange[0], settings.baseRange[1]));
        const baseValue2 = Math.floor(random(settings.baseRange[0], settings.baseRange[1]));

        const baseNode1 = createNode(1, baseValue1, clientWidth * 0.3, clientHeight - BASE_Y_OFFSET, true);
        const baseNode2 = createNode(2, baseValue2, clientWidth * 0.7, clientHeight - BASE_Y_OFFSET, true);

        setNodes([baseNode1, baseNode2]);
        setConnections([]);
        setTargetNumber(baseValue1 + baseValue2 + Math.floor(random(settings.targetBonus[0], settings.targetBonus[1])));
        
        // Center the view on the base nodes
        const initialOffset = { x: clientWidth / 2 - (baseNode1.x + baseNode2.x) / 2, y: 0 };
        setViewOffset(initialOffset);
        targetViewOffset.current = initialOffset;
        setScale(1);

    }, [canvasRef, difficulty]);

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

    const handleDoubleClick = useCallback((x: number, y: number) => {
        if (isGameOver) return;
        const { x: worldX, y: worldY } = screenToWorld(x, y);
        const clickedNode = nodes.find(node => Math.hypot(worldX - node.x, worldY - node.y) < node.radius);

        if (clickedNode && clickedNode.value >= 2) {
            const hasBeenDecomposed = nodes.some(n => n.decomposedFrom === clickedNode.id);
            if (hasBeenDecomposed) return; // Can't decompose twice

            const part1 = Math.floor(clickedNode.value / 2);
            const part2 = clickedNode.value - part1;

            if (part1 > 0 && part2 > 0) {
                const yPos = clickedNode.y + VERTICAL_SPACING / 1.5;
                const xOffset = NODE_RADIUS * 1.5;
                const newNode1 = createNode(Date.now() + 1, part1, clickedNode.x - xOffset, yPos, false, null, clickedNode.id);
                const newNode2 = createNode(Date.now() + 2, part2, clickedNode.x + xOffset, yPos, false, null, clickedNode.id);
                
                setNodes(prev => [...prev, newNode1, newNode2]);
                setConnections(prev => [...prev, { from: clickedNode.id, to: newNode1.id }, { from: clickedNode.id, to: newNode2.id }]);
                setScore(s => s + 5);
            }
        }
    }, [isGameOver, nodes, screenToWorld]);


    const handleMouseDown = useCallback((x: number, y: number) => {
        if (isGameOver) return;
        const { x: worldX, y: worldY } = screenToWorld(x, y);
        const clickedNode = nodes.find(node => Math.hypot(worldX - node.x, worldY - node.y) < node.radius);

        if (clickedNode) {
            draggingNodeId.current = clickedNode.id;
            setNodes(prev => prev.map(n => ({...n, state: n.id === clickedNode.id ? 'selected' : 'idle'})));
        } else {
            isPanning.current = true;
            lastMousePos.current = { x, y };
        }
    }, [isGameOver, nodes, screenToWorld]);

    const handleMouseMove = useCallback((x: number, y: number) => {
        if (draggingNodeId.current !== null) {
            dragLineEnd.current = screenToWorld(x, y);
        } else if (isPanning.current) {
            const dx = x - lastMousePos.current.x;
            const dy = y - lastMousePos.current.y;
            targetViewOffset.current.x += dx;
            targetViewOffset.current.y += dy;
            lastMousePos.current = { x, y };
        }
    }, [screenToWorld]);

    const handleMouseUp = useCallback((x: number, y: number) => {
        if (draggingNodeId.current !== null) {
            const { x: worldX, y: worldY } = screenToWorld(x, y);
            const startNode = nodes.find(n => n.id === draggingNodeId.current);
            const endNode = nodes.find(node => node.id !== startNode?.id && Math.hypot(worldX - node.x, worldY - node.y) < node.radius);
    
            if (startNode && endNode) {
                const childExists = nodes.some(n => 
                    (n.parents?.[0] === startNode.id && n.parents?.[1] === endNode.id) ||
                    (n.parents?.[1] === startNode.id && n.parents?.[0] === endNode.id)
                );
    
                if (!childExists) {
                    const newValue = startNode.value + endNode.value;
                    const newNode = createNode(Date.now(), newValue, (startNode.x + endNode.x) / 2, Math.min(startNode.y, endNode.y) - VERTICAL_SPACING, false, [startNode.id, endNode.id]);
                    setNodes(prev => [...prev, newNode]);
                    setConnections(prev => [...prev, { from: startNode.id, to: newNode.id }, { from: endNode.id, to: newNode.id }]);
                    setScore(s => s + 10);

                    if (newValue === targetNumber) {
                        setScore(s => s + 50);
                        setTimeLeft(t => t + 15);
                        const otherNodes = nodes.filter(n => n.decomposedFrom === null && !n.parents && n.id !== startNode.id && n.id !== endNode.id);
                        if (otherNodes.length > 0) {
                           setTargetNumber(newValue + otherNodes[otherNodes.length-1].value);
                        } else {
                           const settings = getDifficultySettings(difficulty);
                           setTargetNumber(newValue + Math.floor(random(settings.targetBonus[0],settings.targetBonus[1])));
                        }
                    }
                }
            }
        }
        
        setNodes(prev => prev.map(n => ({...n, state: 'idle'})));
        draggingNodeId.current = null;
        dragLineEnd.current = null;
        isPanning.current = false;

    }, [nodes, targetNumber, screenToWorld, difficulty]);

    const handleWheel = useCallback((e: WheelEvent) => {
        if (!canvasRef.current) return;
        e.preventDefault();

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const { x: worldXBeforeZoom, y: worldYBeforeZoom } = screenToWorld(mouseX, mouseY);
        
        const zoomFactor = 1.1;
        const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
        const clampedScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

        const newOffsetX = mouseX - worldXBeforeZoom * clampedScale;
        const newOffsetY = mouseY - worldYBeforeZoom * clampedScale;

        setScale(clampedScale);
        setViewOffset({ x: newOffsetX, y: newOffsetY });
        targetViewOffset.current = { x: newOffsetX, y: newOffsetY };

    }, [scale, screenToWorld, canvasRef]);


    useEffect(() => {
        const gameLoop = () => {
            animationFrameId.current = requestAnimationFrame(gameLoop);
            if (!canvasRef.current) return;
            const { clientHeight } = canvasRef.current;

            setNodes(prevNodes => prevNodes.map(n => {
                let newProgress = n.animationProgress;
                if (n.state === 'spawning' && n.animationProgress < 1) {
                    newProgress = Math.min(1, n.animationProgress + 0.05);
                } else if (n.state === 'spawning' && n.animationProgress >= 1) {
                    return { ...n, animationProgress: 1, state: 'idle' };
                }
                return { ...n, animationProgress: newProgress };
            }));

            // Auto-scroll camera
            const highestNode = nodes.reduce((prev, curr) => (curr.y < prev.y ? curr : prev), { y: Infinity });
            if (nodes.length > 0 && highestNode.y * scale + viewOffset.y < clientHeight * 0.4) {
                 targetViewOffset.current.y = clientHeight * 0.4 - highestNode.y * scale;
            }

            // Smooth pan/zoom
            setViewOffset(currentOffset => {
                const newX = currentOffset.x + (targetViewOffset.current.x - currentOffset.x) * 0.1;
                const newY = currentOffset.y + (targetViewOffset.current.y - currentOffset.y) * 0.1;
                
                // If the difference is negligible, snap to target to stop updates
                if (Math.abs(targetViewOffset.current.x - newX) < 0.1 && Math.abs(targetViewOffset.current.y - newY) < 0.1) {
                    // to prevent re-rendering when idle
                    if (currentOffset.x !== targetViewOffset.current.x || currentOffset.y !== targetViewOffset.current.y) {
                       return targetViewOffset.current;
                    }
                    return currentOffset;
                }
                return { x: newX, y: newY };
            });
        };

        if (!isGameOver) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [isGameOver, nodes, canvasRef, scale, viewOffset]);

    const getDragLine = () => {
        if (!draggingNodeId.current || !dragLineEnd.current) return null;
        const startNode = nodes.find(n => n.id === draggingNodeId.current);
        if (!startNode) return null;
        return { start: { x: startNode.x, y: startNode.y }, end: dragLineEnd.current };
    };

    return { nodes, connections, score, timeLeft, isGameOver, targetNumber, resetGame, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleDoubleClick, getDragLine, viewOffset, scale };
};
