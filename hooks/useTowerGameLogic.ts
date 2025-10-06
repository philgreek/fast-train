import { useState, useRef, useCallback, useEffect } from 'react';
import { TowerNode } from '../types';

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

export const useTowerGameLogic = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
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
        
        const baseValue1 = Math.floor(random(10, 25));
        const baseValue2 = Math.floor(random(10, 25));

        const baseNode1 = createNode(1, baseValue1, clientWidth * 0.3, clientHeight - BASE_Y_OFFSET, true);
        const baseNode2 = createNode(2, baseValue2, clientWidth * 0.7, clientHeight - BASE_Y_OFFSET, true);

        setNodes([baseNode1, baseNode2]);
        setConnections([]);
        setTargetNumber(baseValue1 + baseValue2 + Math.floor(random(10, 30)));
        
        // Center the view on the base nodes
        const initialOffset = { x: clientWidth / 2 - (baseNode1.x + baseNode2.x) / 2, y: 0 };
        setViewOffset(initialOffset);
        targetViewOffset.current = initialOffset;
        setScale(1);

    }, [canvasRef]);

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
                const alreadyConnected = connections.some(c => 
                    (c.from === startNode.id && c.to === endNode.id) || 
                    (c.from === endNode.id && c.to === startNode.id)
                );
    
                if (!alreadyConnected) {
                    const isStartNodeAPart = startNode.decomposedFrom !== null;
                    const isEndNodeAPart = endNode.decomposedFrom !== null;
    
                    if (isStartNodeAPart && isEndNodeAPart) {
                        // Disallow connecting two parts
                    } else if (!isStartNodeAPart && !isEndNodeAPart) {
                        // DECOMPOSITION
                        setConnections(prev => [...prev, { from: startNode.id, to: endNode.id }]);
                        const nodeToDecompose = endNode;
                        const hasBeenDecomposed = nodes.some(n => n.decomposedFrom === nodeToDecompose.id);
                        
                        if (nodeToDecompose.value >= 10 && !hasBeenDecomposed) {
                            let part1 = Math.floor(nodeToDecompose.value / 10) * 10;
                            let part2 = nodeToDecompose.value % 10;
                            if (part2 === 0) { // e.g. 20 -> 10, 10
                                part1 = nodeToDecompose.value / 2;
                                part2 = nodeToDecompose.value / 2;
                            }
    
                            if (part1 > 0 && part2 > 0) {
                                const yPos = nodeToDecompose.y - VERTICAL_SPACING / 1.5;
                                const xOffset = NODE_RADIUS * 1.5;
                                const newNode1 = createNode(Date.now() + 1, part1, nodeToDecompose.x - xOffset, yPos, false, null, nodeToDecompose.id);
                                const newNode2 = createNode(Date.now() + 2, part2, nodeToDecompose.x + xOffset, yPos, false, null, nodeToDecompose.id);
                                
                                setNodes(prev => [...prev, newNode1, newNode2]);
                                setConnections(prev => [...prev, { from: nodeToDecompose.id, to: newNode1.id }, { from: nodeToDecompose.id, to: newNode2.id }]);
                                setScore(s => s + 5);
                            }
                        }
                    } else {
                        // SUMMATION
                        const newValue = startNode.value + endNode.value;
                        const newNode = createNode(Date.now(), newValue, (startNode.x + endNode.x) / 2, Math.min(startNode.y, endNode.y) - VERTICAL_SPACING, false, [startNode.id, endNode.id]);
                        setNodes(prev => [...prev, newNode]);
                        setConnections(prev => [...prev, { from: startNode.id, to: endNode.id }]);
                        setScore(s => s + 10);
    
                        if (newValue === targetNumber) {
                            setScore(s => s + 50);
                            setTimeLeft(t => t + 15);
                            const otherNodes = nodes.filter(n => n.decomposedFrom === null && n.id !== startNode.id && n.id !== endNode.id);
                            if (otherNodes.length > 0) {
                               setTargetNumber(newValue + otherNodes[otherNodes.length-1].value);
                            } else {
                               setTargetNumber(newValue + Math.floor(random(10,30)));
                            }
                        }
                    }
                }
            }
        }
        
        setNodes(prev => prev.map(n => ({...n, state: 'idle'})));
        draggingNodeId.current = null;
        dragLineEnd.current = null;
        isPanning.current = false;

    }, [nodes, connections, targetNumber, screenToWorld]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
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

    return { nodes, connections, score, timeLeft, isGameOver, targetNumber, resetGame, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, getDragLine, viewOffset, scale };
};
