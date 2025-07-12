export interface CircuitGate {
    id: string;
    type: string; // e.g., 'AND', 'OR', 'NOT', 'INPUT_A', 'OUTPUT'
    position: { x: number; y: number; };
    inputs: { fromGateId: string; fromPort: number; }[]; // Links from other gates/inputs
}

export interface CircuitWire {
    from: { gateId: string; port: number; };
    to: { gateId: string; port: number; };
}

export interface LogicCircuitChallenge {
    description: string;
    inputsCount: number;
    truthTable: { inputs: number[]; expectedOutput: number[]; }[];
    availableGates: string[];
}

export interface LogicCircuitTestResult {
    inputs: number[];
    userOutput: number[];
    correct: boolean;
}

export interface LogicCircuitGame {
    _id: string;
    userId: string;
    moduleId: string;
    challenge: LogicCircuitChallenge;
    userCircuit: {
        gates: CircuitGate[];
        wires: CircuitWire[];
    };
    testResults: LogicCircuitTestResult[];
    completed: boolean;
    passedAllTests: boolean;
    attempts: number;
    startTime: string;
    endTime?: string;
    xpEarned: number;
    createdAt: string;
    updatedAt: string;
}

export interface LogicCircuitActionResponse {
    msg: string;
    game: LogicCircuitGame;
}