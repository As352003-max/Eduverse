const mongoose = require('mongoose');

const LogicCircuitGameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    challenge: {
        description: { type: String, required: true },
        inputsCount: { type: Number, required: true },
        truthTable: { type: [{ inputs: [Number], expectedOutput: [Number] }], required: true },
        availableGates: { type: [String], required: true }
    },
    userCircuit: {
        gates: [{
            id: { type: String, required: true },
            type: { type: String, required: true },
            position: { x: Number, y: Number },
            inputs: [{ fromGateId: String, fromPort: Number }]
        }],
        wires: [{
            from: { gateId: String, port: Number },
            to: { gateId: String, port: Number }
        }]
    },
    testResults: {
        type: [{ inputs: [Number], userOutput: [Number], correct: Boolean }],
        default: []
    },
    completed: {
        type: Boolean,
        default: false
    },
    passedAllTests: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    xpEarned: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('LogicCircuitGame', LogicCircuitGameSchema);