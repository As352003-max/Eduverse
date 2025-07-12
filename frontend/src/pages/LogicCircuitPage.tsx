import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { startLogicCircuitGame, saveLogicCircuit, testLogicCircuit } from '../api/logicCircuitApi';
import { LogicCircuitGame, CircuitGate, CircuitWire, LogicCircuitTestResult } from '../types/logicCircuitTypes';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { nanoid } from 'nanoid'; // npm install nanoid for unique IDs

// --- Dummy Components/Logic for demonstration ---
// In a real app, these would be robust drag-and-drop components
interface GatePaletteProps {
    onDragStart: (e: React.DragEvent, type: string) => void;
    availableGates: string[];
}
const GatePalette: React.FC<GatePaletteProps> = ({ onDragStart, availableGates }) => (
    <div className="bg-gray-200 p-4 rounded-lg shadow-inner">
        <h3 className="font-semibold text-lg mb-3">Gates</h3>
        <div className="grid grid-cols-2 gap-2">
            {availableGates.map(gateType => (
                <div
                    key={gateType}
                    className="bg-white p-2 border border-gray-300 rounded cursor-grab text-center text-sm hover:bg-blue-100 transition"
                    draggable
                    onDragStart={(e) => onDragStart(e, gateType)}
                >
                    {gateType}
                </div>
            ))}
        </div>
    </div>
);

interface CircuitCanvasProps {
    gates: CircuitGate[];
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onGateClick: (gateId: string) => void;
    selectedGateId: string | null;
    onConnectStart: (gateId: string) => void;
    onConnectEnd: (targetGateId: string) => void;
    activeWireSource: string | null;
    wires: CircuitWire[];
}
const CircuitCanvas: React.FC<CircuitCanvasProps> = ({ gates, onDrop, onDragOver, onGateClick, selectedGateId, onConnectStart, onConnectEnd, activeWireSource, wires }) => {
    const canvasRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={canvasRef}
            className="relative bg-gray-50 border-2 border-dashed border-gray-300 min-h-[500px] w-full rounded-lg overflow-hidden"
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            {gates.map(gate => (
                <motion.div
                    key={gate.id}
                    className={`absolute p-2 bg-white border rounded shadow-md cursor-pointer ${selectedGateId === gate.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'}`}
                    style={{ left: gate.position.x, top: gate.position.y }}
                    onClick={() => onGateClick(gate.id)}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    drag // Enable drag for already placed gates
                    onDragEnd={(event, info) => {
                        // Update gate position after drag
                        const updatedGate = { ...gate, position: { x: info.point.x, y: info.point.y } };
                        // This would trigger a saveLogicCircuit call
                        // console.log("Gate dragged to:", updatedGate.position);
                    }}
                >
                    {gate.type}
                    {gate.type.startsWith('INPUT') && <div className="w-2 h-2 bg-blue-500 rounded-full absolute -left-1 top-1/2 -translate-y-1/2"></div>}
                    {gate.type === 'OUTPUT' && <div className="w-2 h-2 bg-red-500 rounded-full absolute -right-1 top-1/2 -translate-y-1/2"></div>}
                    <button
                        className="absolute -right-2 -bottom-2 w-4 h-4 bg-green-500 rounded-full text-white text-xs flex items-center justify-center"
                        onClick={(e) => { e.stopPropagation(); onConnectStart(gate.id); }}
                    >
                        +
                    </button>
                    {activeWireSource === gate.id && <div className="absolute w-full h-full border-2 border-dashed border-purple-500"></div>}
                </motion.div>
            ))}
            {wires.map((wire, index) => (
                <svg key={index} className="absolute inset-0 w-full h-full pointer-events-none">
                    {(() => {
                        const fromGate = gates.find(g => g.id === wire.from.gateId);
                        const toGate = gates.find(g => g.id === wire.to.gateId);
                        if (!fromGate || !toGate) return null;

                        const x1 = fromGate.position.x + 32; // Assuming gate width
                        const y1 = fromGate.position.y + 16; // Assuming gate height
                        const x2 = toGate.position.x;
                        const y2 = toGate.position.y + 16;

                        return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="gray" strokeWidth="2" />;
                    })()}
                </svg>
            ))}
        </div>
    );
};

interface TestResultsDisplayProps {
    results: LogicCircuitTestResult[];
}
const TestResultsDisplay: React.FC<TestResultsDisplayProps> = ({ results }) => (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
        <h3 className="font-semibold text-lg mb-3">Test Results</h3>
        {results.length === 0 ? (
            <p className="text-gray-600">Run tests to see results.</p>
        ) : (
            <table className="w-full text-left table-auto">
                <thead>
                    <tr>
                        <th className="px-2 py-1 border-b">Inputs</th>
                        <th className="px-2 py-1 border-b">Your Output</th>
                        <th className="px-2 py-1 border-b">Correct</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((r, i) => (
                        <tr key={i} className={r.correct ? 'bg-green-50' : 'bg-red-50'}>
                            <td className="px-2 py-1 border-b">{r.inputs.join(', ')}</td>
                            <td className="px-2 py-1 border-b">{r.userOutput.join(', ')}</td>
                            <td className="px-2 py-1 border-b">{r.correct ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);
// --- End of Dummy Components ---


const LogicCircuitPage: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const [game, setGame] = useState<LogicCircuitGame | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string>('');

    const [draggingGateType, setDraggingGateType] = useState<string | null>(null);
    const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
    const [activeWireSource, setActiveWireSource] = useState<string | null>(null);

    const fetchNewGame = useCallback(async (difficulty: string = 'easy') => {
        if (!moduleId) return;
        setIsLoading(true);
        try {
            const newGame = await startLogicCircuitGame(moduleId, difficulty);
            setGame(newGame);
            setMessage('Drag gates to build your circuit!');
        } catch (err) {
            console.error('Error starting game:', err);
            toast.error('Failed to start Logic Circuit game.');
            setMessage('Failed to load game. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [moduleId]);

    useEffect(() => {
        fetchNewGame();
    }, [fetchNewGame]);

    const handleDragStart = (e: React.DragEvent, type: string) => {
        setDraggingGateType(type);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggingGateType || !game) return;

        const canvasRect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;

        const newGate: CircuitGate = {
            id: nanoid(),
            type: draggingGateType,
            position: { x, y },
            inputs: [] // Inputs will be defined by wires
        };

        const updatedGates = [...game.userCircuit.gates, newGate];
        const updatedCircuit = { ...game.userCircuit, gates: updatedGates };
        setGame({ ...game, userCircuit: updatedCircuit });

        try {
            await saveLogicCircuit(game._id, updatedCircuit);
            toast.success(`${draggingGateType} gate added!`);
        } catch (err) {
            console.error('Error saving circuit:', err);
            toast.error('Failed to save circuit changes.');
        } finally {
            setDraggingGateType(null);
        }
    };

    const handleGateClick = (gateId: string) => {
        setSelectedGateId(gateId);
    };

    const handleConnectStart = (gateId: string) => {
        setActiveWireSource(gateId);
        toast.info('Click another gate to connect');
    };

    const handleConnectEnd = async (targetGateId: string) => {
        if (!activeWireSource || !game || activeWireSource === targetGateId) {
            setActiveWireSource(null);
            return;
        }

        const sourceGate = game.userCircuit.gates.find(g => g.id === activeWireSource);
        const targetGate = game.userCircuit.gates.find(g => g.id === targetGateId);

        if (!sourceGate || !targetGate) {
            setActiveWireSource(null);
            return;
        }

        // Simple validation: Prevent connecting to input gates' outputs and output gates' inputs
        if (sourceGate.type.startsWith('INPUT') || targetGate.type === 'OUTPUT') {
             // For output gates, allow one input connection
             if (targetGate.type === 'OUTPUT' && targetGate.inputs.length === 0) {
                 // OK
             } else {
                 toast.error('Invalid connection.');
                 setActiveWireSource(null);
                 return;
             }
        }
        
        // Prevent duplicate wires
        const isDuplicate = game.userCircuit.wires.some(w =>
            (w.from.gateId === activeWireSource && w.to.gateId === targetGateId) ||
            (w.from.gateId === targetGateId && w.to.gateId === activeWireSource)
        );

        if (isDuplicate) {
            toast.warn('Connection already exists.');
            setActiveWireSource(null);
            return;
        }

        const newWire: CircuitWire = {
            from: { gateId: activeWireSource, port: 0 },
            to: { gateId: targetGateId, port: 0 }
        };

        const updatedWires = [...game.userCircuit.wires, newWire];
        const updatedGates = game.userCircuit.gates.map(g => {
            if (g.id === targetGateId) {
                return { ...g, inputs: [...g.inputs, { fromGateId: activeWireSource, fromPort: 0 }] };
            }
            return g;
        });

        const updatedCircuit = { gates: updatedGates, wires: updatedWires };
        setGame({ ...game, userCircuit: updatedCircuit });

        try {
            await saveLogicCircuit(game._id, updatedCircuit);
            toast.success('Gates connected!');
        } catch (err) {
            console.error('Error saving circuit:', err);
            toast.error('Failed to save connection.');
        } finally {
            setActiveWireSource(null);
        }
    };

    const handleRunTests = async () => {
        if (!game || game.completed) return;
        setIsLoading(true);
        try {
            const response = await testLogicCircuit(game._id, game.userCircuit);
            setGame(response.game);
            setMessage(response.msg);
            if (response.game.passedAllTests) {
                toast.success(`Challenge Complete! Earned ${response.game.xpEarned} XP!`);
            } else {
                toast.info('Some tests failed. Check results below.');
            }
        } catch (err: any) {
            console.error('Error running tests:', err);
            toast.error(err.response?.data?.msg || 'Failed to run tests.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-600">Loading Logic Circuit Builder...</p>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-red-500">Could not load game. Please check module ID.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 flex flex-col items-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Logic Circuit Builder</h1>

            {game.completed && game.passedAllTests ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center w-full max-w-md">
                    <p className="text-2xl font-semibold text-green-600 mb-4">Challenge Completed!</p>
                    <p className="text-lg text-gray-700">Attempts: {game.attempts}</p>
                    <p className="text-lg text-gray-700">Time Taken: {(new Date(game.endTime!).getTime() - new Date(game.startTime).getTime()) / 1000} seconds</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-4">XP Earned: {game.xpEarned}</p>
                    <button
                        onClick={() => fetchNewGame('medium')} // Offer next difficulty
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Next Challenge
                    </button>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
                    <div className="md:w-1/4">
                        <GatePalette
                            onDragStart={handleDragStart}
                            availableGates={game.challenge.availableGates}
                        />
                    </div>
                    <div className="md:w-3/4 flex flex-col">
                        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                            <h2 className="text-xl font-semibold mb-2">Challenge:</h2>
                            <p className="text-lg text-gray-700">{game.challenge.description}</p>
                        </div>

                        <CircuitCanvas
                            gates={game.userCircuit.gates}
                            wires={game.userCircuit.wires}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onGateClick={handleGateClick}
                            selectedGateId={selectedGateId}
                            onConnectStart={handleConnectStart}
                            onConnectEnd={handleConnectEnd}
                            activeWireSource={activeWireSource}
                        />

                        <div className="mt-4 flex justify-between items-center">
                            <button
                                onClick={handleRunTests}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
                                disabled={game.completed}
                            >
                                Run Tests ({game.attempts})
                            </button>
                            <p className="text-lg font-medium text-gray-700">{message}</p>
                        </div>
                        <TestResultsDisplay results={game.testResults} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogicCircuitPage;