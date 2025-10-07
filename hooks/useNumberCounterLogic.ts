import { useState, useEffect, useCallback, useRef } from 'react';
import { NumberCounterProblem, GameStep, EquationLine, NumberPart, Difficulty } from '../types';

const GAME_DURATION = 180;
const TIME_BONUS_PROBLEM = 15;
const SCORE_PER_PROBLEM = 50;

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const createPart = (id: string, text: string, value: number, type: NumberPart['type'], placeValue: NumberPart['placeValue'] = 0, isClickable = false, isPulsing = false, isSolved = false): NumberPart => ({
    id, text, value, type, placeValue, isClickable, isPulsing, isSolved
});

const generateProblem = (difficulty: Difficulty): NumberCounterProblem => {
    const isSubtraction = Math.random() > 0.5;
    let problem: NumberCounterProblem;
    let n1: number, n2: number, result: number;
    
    if (difficulty === Difficulty.Easy) {
        if (isSubtraction) {
            // Easy Subtraction: 8 - 3 = ?
            n1 = random(5, 10);
            n2 = random(1, n1 - 1);
            result = n1 - n2;
            const line1: EquationLine = [
                createPart('n1', String(n1), n1, 'number'),
                createPart('op', '-', 0, 'operator'),
                createPart('n2', String(n2), n2, 'number'),
                createPart('eq', '=', 0, 'equals'),
                createPart('q', '?', 0, 'question', 0, true, true),
            ];
            problem = {
                id: `E-S-${n1}-${n2}`,
                steps: [{
                    lines: [line1],
                    action: { type: 'INPUT_ANSWER', triggerPartIds: ['q'], correctAnswer: result },
                    prompt: 'Найди разность.',
                }]
            };
        } else {
            // Easy Addition: 3 + 4 = ?
            n1 = random(1, 8);
            n2 = random(1, 9 - n1);
            result = n1 + n2;
            const line1: EquationLine = [
                 createPart('n1', String(n1), n1, 'number'),
                 createPart('op', '+', 0, 'operator'),
                 createPart('n2', String(n2), n2, 'number'),
                 createPart('eq', '=', 0, 'equals'),
                 createPart('q', '?', 0, 'question', 0, true, true),
            ];
             problem = {
                id: `E-A-${n1}-${n2}`,
                steps: [{
                    lines: [line1],
                    action: { type: 'INPUT_ANSWER', triggerPartIds: ['q'], correctAnswer: result },
                    prompt: 'Найди сумму.',
                }]
            };
        }
    } else if (difficulty === Difficulty.Medium) {
        if (isSubtraction) {
            // Medium Subtraction: 15 - 7 = ? -> 15 - 5 - 2 = ?
            n1 = random(11, 18);
            n2 = random(Math.max(2, n1 - 9), 9);
            result = n1 - n2;
            const to_ten = n1 - 10;
            const remainder = n2 - to_ten;

            const line1: EquationLine = [
                createPart('n1', String(n1), n1, 'number', 1),
                createPart('op', '-', 0, 'operator'),
                createPart('n2', String(n2), n2, 'number', 0, true, true),
                createPart('eq', '=', 0, 'equals'),
                createPart('q', '?', 0, 'question'),
            ];
            const line2: EquationLine = [
                createPart('n1_2', String(n1), n1, 'number', 1),
                createPart('op1_2', '-', 0, 'operator'),
                createPart('n2_part1', String(to_ten), to_ten, 'number', 0),
                createPart('op2_2', '-', 0, 'operator'),
                createPart('n2_part2', String(remainder), remainder, 'number', 0),
                createPart('eq_2', '=', 0, 'equals'),
                createPart('q_2', '?', 0, 'question', 0, true, true),
            ];

            problem = {
                id: `M-S-${n1}-${n2}`,
                steps: [
                    {
                        lines: [line1],
                        action: { type: 'DECOMPOSE', triggerPartIds: ['n2'], correctAnswer: n2, requiredSelections: 2, validator: (sel) => sel.includes(to_ten) },
                        prompt: `Разложи ${n2}, чтобы вычесть из ${n1} по частям.`,
                    },
                    {
                        lines: [line1.map(p => ({...p, isPulsing: false, isClickable: false})), line2],
                        action: { type: 'INPUT_ANSWER', triggerPartIds: ['q_2'], correctAnswer: result },
                        prompt: 'Теперь посчитай.',
                    },
                ]
            };
        } else {
            // Medium Addition: 9 + 7 = ?
            n1 = random(6, 9);
            n2 = random(6, 9);
            result = n1 + n2;
            const to_round = 10 - n1;
            const remainder = n2 - to_round;

            const line1: EquationLine = [
                createPart('n1', String(n1), n1, 'number', 0),
                createPart('op', '+', 0, 'operator'),
                createPart('n2', String(n2), n2, 'number', 0, true, true),
                createPart('eq', '=', 0, 'equals'),
                createPart('q', '?', 0, 'question'),
            ];
            const line2: EquationLine = [
                createPart('n1_2', String(n1), n1, 'number', 0),
                createPart('op1_2', '+', 0, 'operator'),
                createPart('n2_part1', String(to_round), to_round, 'number', 0),
                createPart('op2_2', '+', 0, 'operator'),
                createPart('n2_part2', String(remainder), remainder, 'number', 0),
                createPart('eq_2', '=', 0, 'equals'),
                createPart('q_2', '?', 0, 'question', 0, true, true),
            ];
            problem = {
                id: `M-A-${n1}-${n2}`,
                steps: [
                     {
                        lines: [line1],
                        action: { type: 'DECOMPOSE', triggerPartIds: ['n2'], correctAnswer: n2, requiredSelections: 2, validator: (sel) => sel.includes(to_round) },
                        prompt: `Разложи ${n2}, чтобы дополнить ${n1} до 10.`,
                    },
                    {
                        lines: [line1.map(p => ({...p, isPulsing: false, isClickable: false})), line2],
                        action: { type: 'INPUT_ANSWER', triggerPartIds: ['q_2'], correctAnswer: result },
                        prompt: 'Теперь посчитай сумму.',
                    },
                ]
            };
        }
    } else { // Hard
        if (isSubtraction) {
            // Hard Subtraction: 65 - 39 = ? -> 65 - 30 - 9
            n1 = random(40, 99);
            n2 = random(21, n1 - 10);
            result = n1 - n2;
            const n2_t = Math.floor(n2 / 10) * 10;
            const n2_u = n2 % 10;
            const intermediate = n1 - n2_t;

            const mainLine: EquationLine = [
                createPart('n1_t', String(Math.floor(n1/10)), Math.floor(n1/10), 'number', 1),
                createPart('n1_u', String(n1 % 10), n1 % 10, 'number', 0),
                createPart('op', '-', 0, 'operator'),
                createPart('n2_t', String(Math.floor(n2/10)), Math.floor(n2/10), 'number', 1, true, true),
                createPart('n2_u', String(n2 % 10), n2 % 10, 'number', 0, true, true),
                createPart('eq', '=', 0, 'equals'),
                createPart('q', '?', 0, 'question'),
            ];
            const tensLine: EquationLine = [
                createPart('n1_full', String(n1), n1, 'number', 1),
                createPart('op_t', '-', 0, 'operator'),
                createPart('n2t_val', String(n2_t), n2_t, 'number', 1),
                createPart('eq_t', '=', 0, 'equals'),
                createPart('q_t', '?', 0, 'question', 1, true, true),
            ];
            const unitsLine: EquationLine = [
                createPart('inter', String(intermediate), intermediate, 'number', 1),
                createPart('op_u', '-', 0, 'operator'),
                createPart('n2u_val', String(n2_u), n2_u, 'number', 0),
                createPart('eq_u', '=', 0, 'equals'),
                createPart('q_u', '?', 0, 'question', 1, true, true),
            ];
            problem = {
                id: `H-S-${n1}-${n2}`,
                steps: [
                    { lines: [mainLine], action: { type: 'SELECT_PARTS', triggerPartIds: ['n2_t'] }, prompt: 'Сначала вычтем десятки.' },
                    {
                        lines: [mainLine.map(p => ({ ...p, isPulsing: false, isClickable: false })), tensLine],
                        action: { type: 'INPUT_ANSWER', triggerPartIds: ['q_t'], correctAnswer: intermediate },
                        prompt: 'Введи результат.',
                    },
                    {
                        lines: [mainLine.map(p => p.id === 'n2_u' ? { ...p, isPulsing: true, isClickable: true } : { ...p, isPulsing: false, isClickable: false })],
                        action: { type: 'SELECT_PARTS', triggerPartIds: ['n2_u'] },
                        prompt: 'Теперь вычтем единицы.',
                    },
                    {
                        lines: [
                            mainLine.map(p => ({ ...p, isPulsing: false, isClickable: false })),
                            tensLine.map(p => p.id === 'q_t' ? createPart('res_t', String(intermediate), intermediate, 'number', 1, false, false, true) : p),
                            unitsLine,
                        ],
                        action: { type: 'INPUT_ANSWER', triggerPartIds: ['q_u'], correctAnswer: result },
                        prompt: 'Введи итоговый ответ.',
                    },
                ]
            };
        } else {
            // Hard Addition: 65 + 39 = ?
            n1 = random(21, 99);
            n2 = random(21, 99);
            result = n1 + n2;
            const n1_t = Math.floor(n1 / 10), n1_u = n1 % 10;
            const n2_t = Math.floor(n2 / 10), n2_u = n2 % 10;
            const tens_sum = (n1_t + n2_t) * 10;
            const units_sum = n1_u + n2_u;
            const mainLine: EquationLine = [
                createPart('n1_t', String(n1_t), n1_t, 'number', 1, true, true),
                createPart('n1_u', String(n1_u), n1_u, 'number', 0, true, true),
                createPart('op', '+', 0, 'operator'),
                createPart('n2_t', String(n2_t), n2_t, 'number', 1, true, true),
                createPart('n2_u', String(n2_u), n2_u, 'number', 0, true, true),
                createPart('eq', '=', 0, 'equals'),
                createPart('q', '?', 0, 'question'),
            ];
            const tensLine: EquationLine = [
                 createPart('n1t_val', String(n1_t*10), n1_t*10, 'number', 1),
                 createPart('opt', '+', 0, 'operator'),
                 createPart('n2t_val', String(n2_t*10), n2_t*10, 'number', 1),
                 createPart('eqt', '=', 0, 'equals'),
                 createPart('qt', '?', 0, 'question', 2, true, true),
            ];
            const unitsLine: EquationLine = [
                 createPart('n1u_val', String(n1_u), n1_u, 'number', 0),
                 createPart('opu', '+', 0, 'operator'),
                 createPart('n2u_val', String(n2_u), n2_u, 'number', 0),
                 createPart('equ', '=', 0, 'equals'),
                 createPart('qu', '?', 0, 'question', 1, true, true),
            ];
             const finalLine: EquationLine = [
                 createPart('tsum', String(tens_sum), tens_sum, 'number', 2),
                 createPart('opf', '+', 0, 'operator'),
                 createPart('usum', String(units_sum), units_sum, 'number', 1),
                 createPart('eqf', '=', 0, 'equals'),
                 createPart('qf', '?', 0, 'question', 2, true, true),
            ];
            problem = {
                id: `H-A-${n1}-${n2}`,
                steps: [
                    { lines: [mainLine], action: { type: 'SELECT_PARTS', triggerPartIds: ['n1_t', 'n2_t']}, prompt: 'Сначала сложим десятки.' },
                    {
                        lines: [mainLine.map(p=>({...p, isPulsing: false, isClickable: false})) , tensLine],
                        action: { type: 'INPUT_ANSWER', triggerPartIds: ['qt'], correctAnswer: tens_sum },
                        prompt: 'Введи сумму десятков.'
                    },
                    {
                        lines: [
                            mainLine.map(p => ['n1_u', 'n2_u'].includes(p.id) ? {...p, isPulsing: true, isClickable: true} : {...p, isPulsing: false, isClickable: false}),
                            tensLine.map(p => p.id === 'qt' ? createPart('rest', String(tens_sum), tens_sum, 'number', 2, false, false, true) : p),
                        ],
                        action: { type: 'SELECT_PARTS', triggerPartIds: ['n1_u', 'n2_u']},
                        prompt: 'Теперь сложим единицы.'
                    },
                    {
                        lines: [
                            mainLine.map(p=>({...p, isPulsing: false, isClickable: false})), 
                            tensLine.map(p => p.id === 'qt' ? createPart('rest', String(tens_sum), tens_sum, 'number', 2, false, false, true) : p),
                            unitsLine
                        ],
                        action: { type: 'INPUT_ANSWER', triggerPartIds: ['qu'], correctAnswer: units_sum },
                        prompt: 'Введи сумму единиц.'
                    },
                    {
                         lines: [
                            mainLine.map(p=>({...p, isPulsing: false, isClickable: false})), 
                            tensLine.map(p => p.id === 'qt' ? createPart('rest', String(tens_sum), tens_sum, 'number', 2, false, false, true) : p),
                            unitsLine.map(p => p.id === 'qu' ? createPart('resu', String(units_sum), units_sum, 'number', 1, false, false, true) : p),
                            finalLine
                        ],
                        action: { type: 'INPUT_ANSWER', triggerPartIds: ['qf'], correctAnswer: result },
                        prompt: 'Сложи результаты.'
                    }
                ]
            };
        }
    }
    
    // Add a final "END_STEP" to all generated problems
    const finalStepLine = problem.steps[problem.steps.length - 1].lines.flat();
    const finalResultPart = finalStepLine.find(p => p.type === 'question');
    const finalResultValue = finalResultPart ? problem.steps[problem.steps.length - 1].action.correctAnswer : result;

    problem.steps.push({
        lines: [ finalStepLine.map(p => p.id === finalResultPart?.id ? createPart(p.id, String(finalResultValue), finalResultValue!, 'number', p.placeValue, false, false, true) : {...p, isClickable: false, isPulsing: false, isSolved: true}) ],
        action: { type: 'END_STEP', triggerPartIds: [] },
        prompt: 'Великолепно!',
    });

    return problem;
};


export const useNumberCounterLogic = (difficulty: Difficulty) => {
    const [problem, setProblem] = useState<NumberCounterProblem | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [activeInputId, setActiveInputId] = useState<string | null>(null);
    const [currentInput, setCurrentInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    
    const selectedPartsRef = useRef<Set<string>>(new Set());
    const timerId = useRef<number | null>(null);

    const startNewProblem = useCallback(() => {
        setProblem(generateProblem(difficulty));
        setCurrentStepIndex(0);
        setActiveInputId(null);
        setCurrentInput('');
        selectedPartsRef.current.clear();
    }, [difficulty]);

    useEffect(() => {
        startNewProblem();
    }, [startNewProblem]);

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

    const advanceStep = useCallback(() => {
        if (!problem) return;
        selectedPartsRef.current.clear();
        if (currentStepIndex < problem.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
             // This case should be handled by the END_STEP effect
        }
    }, [problem, currentStepIndex]);
    
    useEffect(() => {
        const currentStep = problem?.steps[currentStepIndex];
        if (currentStep?.action.type === 'END_STEP') {
            setFeedback('correct');
            setScore(s => s + SCORE_PER_PROBLEM);
            setTimeLeft(t => t + TIME_BONUS_PROBLEM);
            
            const timer = setTimeout(() => {
                startNewProblem();
                setFeedback(null);
            }, 1200);

            return () => clearTimeout(timer);
        }
    }, [currentStepIndex, problem, startNewProblem]);


    const handlePartClick = useCallback((partId: string) => {
        if (!problem) return;
        const step = problem.steps[currentStepIndex];
        const part = step.lines.flat().find(p => p.id === partId);
        if (!part || !part.isClickable) return;
        
        const { action } = step;

        if (action.type === 'SELECT_PARTS') {
             selectedPartsRef.current.add(partId);
             setProblem(p => {
                if (!p) return p;
                return {
                    ...p,
                    steps: p.steps.map((s, idx) => idx === currentStepIndex ? {
                        ...s,
                        lines: s.lines.map(line => line.map(pt => pt.id === partId ? {...pt, isPulsing: false} : pt))
                    } : s)
                }
             })

             const allPartsSelected = action.triggerPartIds.every(id => selectedPartsRef.current.has(id));
             if (allPartsSelected) {
                advanceStep();
             }
        } else if (action.type === 'DECOMPOSE' || action.type === 'INPUT_ANSWER') {
            setActiveInputId(partId);
            setCurrentInput('');
        }
    }, [problem, currentStepIndex, advanceStep]);
    
    const handleSubmit = useCallback(() => {
        if (!problem || !activeInputId) return;
        const { action } = problem.steps[currentStepIndex];
        
        let isCorrect = false;

        if (action.type === 'DECOMPOSE') {
            const selections = currentInput.split('+').map(s => parseInt(s, 10)).filter(n => !isNaN(n));
            if (selections.length > 0) {
                const sum = selections.reduce((a, b) => a + b, 0);
                if (
                    selections.length === action.requiredSelections &&
                    sum === action.correctAnswer &&
                    (!action.validator || action.validator(selections))
                ) {
                    isCorrect = true;
                }
            }
        } else { // INPUT_ANSWER
            const answer = parseInt(currentInput, 10);
            if (!isNaN(answer) && action.correctAnswer === answer) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
             setActiveInputId(null);
             setCurrentInput('');
             advanceStep();
        } else {
            setFeedback('wrong');
            setCurrentInput('');
            setTimeout(() => setFeedback(null), 500);
        }
    }, [problem, currentStepIndex, activeInputId, currentInput, advanceStep]);

    const handleKeypadInput = (value: string) => {
        if (!activeInputId || currentInput.length > 8) return;
        setCurrentInput(prev => prev + value);
    };

    const handleBackspace = () => {
        setCurrentInput(prev => prev.slice(0, -1));
    };

    const resetGame = useCallback(() => {
        setIsGameOver(false);
        setScore(0);
        setTimeLeft(GAME_DURATION);
        startNewProblem();
    }, [startNewProblem]);

    const currentStep = problem?.steps[currentStepIndex];

    return {
        currentStep,
        activeInputId,
        currentInput,
        score,
        timeLeft,
        isGameOver,
        feedback,
        handlePartClick,
        handleKeypadInput,
        handleBackspace,
        handleSubmit,
        resetGame,
    };
};