import type { MultiQuantumGate, ParametricQuantumGate, QuantumGate } from "../type/QuantumGate";
import { MultiQuantumGateType, ParametricQuantumGateType, QuantumGateType } from "../type/QuantumGateType";
import { WasmQuantumGate, WasmQuantumGateType } from "../type/WasmGateType";

export function translateDefaultGateToWasmGate(gate: QuantumGate): WasmQuantumGate {
    let wasmGate: WasmQuantumGate;
    if (!gate) {
        wasmGate = ["0", 0, []];
    } else {
        const gateType = translateGateType(gate.type);
        const gateParam = isParametricQuantumGateType(gate) ? gate.param : 0;
        const gateControlls = isMultiQuantumGateType(gate) ? gate.controllQubitIndex : []
        wasmGate = [gateType, gateParam, gateControlls];
    }
    return wasmGate;
}

export function translateGateType(defaultGateType: QuantumGateType): WasmQuantumGateType {
    switch(defaultGateType) {
        case QuantumGateType.X:
            return "x";
        case QuantumGateType.Y:
            return "y";
        case QuantumGateType.Z:
            return "z";
        case QuantumGateType.H:
            return "h";
        case QuantumGateType.T:
            return "t";
        case QuantumGateType.S:
            return "s";
        case QuantumGateType.RX:
            return "rx";
        case QuantumGateType.RY:
            return "ry";
        case QuantumGateType.RZ:
            return "rz";
        case QuantumGateType.CNOT:
            return "cnot";
        case QuantumGateType.CCNOT:
            return "ccnot";
        default:
            return "0"; // unreachable required
    }
}

function isParametricQuantumGateType(gate: QuantumGate): gate is ParametricQuantumGate {
    switch(gate.type) {
        case ParametricQuantumGateType.RX:
        case ParametricQuantumGateType.RY:
        case ParametricQuantumGateType.RZ:
            return true;
        }
        return false;
}

function isMultiQuantumGateType(gate: QuantumGate): gate is MultiQuantumGate {
    switch(gate.type) {
        case MultiQuantumGateType.CNOT:
        case MultiQuantumGateType.CCNOT:
            return true;
        }
        return false;
}
