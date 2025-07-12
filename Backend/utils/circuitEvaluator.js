function evaluateGate(gateType, inputs) {
    switch (gateType) {
        case 'AND': return inputs.every(val => val === 1) ? 1 : 0;
        case 'OR': return inputs.some(val => val === 1) ? 1 : 0;
        case 'NOT': return inputs[0] === 1 ? 0 : 1;
        case 'XOR': return (inputs[0] !== inputs[1]) ? 1 : 0;
        case 'NAND': return !(inputs.every(val => val === 1)) ? 1 : 0;
        case 'NOR': return !(inputs.some(val => val === 1)) ? 1 : 0;
        case 'BUFFER': return inputs[0];
        case 'INPUT_A': return inputs[0];
        case 'INPUT_B': return inputs[0];
        case 'INPUT_C': return inputs[0];
        default: return 0;
    }
}

function evaluateCircuit(circuit, inputValues) {
    const gateOutputs = {};
    const processedGates = new Set();
    const evaluationOrder = [];

    const getGateById = (id) => circuit.gates.find(g => g.id === id);

    const getIncomingValue = (wireFrom, gateOutputs, inputValues) => {
        if (wireFrom.gateId.startsWith('INPUT')) {
            const inputIndex = parseInt(wireFrom.gateId.replace('INPUT_', '')) - 1;
            return inputValues[inputIndex];
        }
        return gateOutputs[wireFrom.gateId];
    };

    while (processedGates.size < circuit.gates.length) {
        let changed = false;
        for (const gate of circuit.gates) {
            if (!processedGates.has(gate.id)) {
                let allInputsReady = true;
                const currentGateInputs = [];

                if (gate.inputs && gate.inputs.length > 0) {
                    for (const inputSource of gate.inputs) {
                        if (inputSource.fromGateId.startsWith('INPUT')) {
                            const inputIndex = inputSource.fromGateId.charCodeAt(6) - 'A'.charCodeAt(0);
                            currentGateInputs.push(inputValues[inputIndex]);
                        } else if (gateOutputs[inputSource.fromGateId] !== undefined) {
                            currentGateInputs.push(gateOutputs[inputSource.fromGateId]);
                        } else {
                            allInputsReady = false;
                            break;
                        }
                    }
                } else if (gate.type.startsWith('INPUT')) {
                    const inputIndex = gate.type.charCodeAt(5) - 'A'.charCodeAt(0);
                    currentGateInputs.push(inputValues[inputIndex]);
                }


                if (allInputsReady) {
                    const output = evaluateGate(gate.type, currentGateInputs);
                    gateOutputs[gate.id] = output;
                    processedGates.add(gate.id);
                    evaluationOrder.push(gate.id);
                    changed = true;
                }
            }
        }
        if (!changed && processedGates.size < circuit.gates.length) {
            console.warn("Circular dependency or unconnectable gates detected.");
            break;
        }
    }

    const outputGates = circuit.gates.filter(g => g.type.startsWith('OUTPUT'));
    const finalOutputs = outputGates.map(outputGate => gateOutputs[outputGate.inputs[0].fromGateId]);

    return finalOutputs;
}

function generateLogicChallenge(difficulty) {
    let description = '';
    let inputsCount = 2;
    let truthTable = [];
    let availableGates = ['AND', 'OR', 'NOT'];

    switch (difficulty) {
        case 'easy':
            description = 'Build an AND gate. Output is 1 only if both inputs are 1.';
            truthTable = [
                { inputs: [0, 0], expectedOutput: [0] },
                { inputs: [0, 1], expectedOutput: [0] },
                { inputs: [1, 0], expectedOutput: [0] },
                { inputs: [1, 1], expectedOutput: [1] },
            ];
            availableGates = ['AND', 'INPUT_A', 'INPUT_B', 'OUTPUT'];
            break;
        case 'medium':
            description = 'Build an XOR gate. Output is 1 if inputs are different.';
            truthTable = [
                { inputs: [0, 0], expectedOutput: [0] },
                { inputs: [0, 1], expectedOutput: [1] },
                { inputs: [1, 0], expectedOutput: [1] },
                { inputs: [1, 1], expectedOutput: [0] },
            ];
            availableGates = ['AND', 'OR', 'NOT', 'INPUT_A', 'INPUT_B', 'OUTPUT'];
            break;
        case 'hard':
            description = 'Build a full adder circuit (3 inputs, 2 outputs: Sum, Carry Out).';
            inputsCount = 3;
            truthTable = [
                { inputs: [0, 0, 0], expectedOutput: [0, 0] },
                { inputs: [0, 0, 1], expectedOutput: [1, 0] },
                { inputs: [0, 1, 0], expectedOutput: [1, 0] },
                { inputs: [0, 1, 1], expectedOutput: [0, 1] },
                { inputs: [1, 0, 0], expectedOutput: [1, 0] },
                { inputs: [1, 0, 1], expectedOutput: [0, 1] },
                { inputs: [1, 1, 0], expectedOutput: [0, 1] },
                { inputs: [1, 1, 1], expectedOutput: [1, 1] },
            ];
            availableGates = ['AND', 'OR', 'XOR', 'NOT', 'INPUT_A', 'INPUT_B', 'INPUT_C', 'OUTPUT'];
            break;
        default:
            return generateLogicChallenge('easy');
    }

    return { description, inputsCount, truthTable, availableGates };
}

module.exports = {
    evaluateCircuit,
    generateLogicChallenge
};