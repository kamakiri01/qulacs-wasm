import { CircuitInfo, ObservableInfo, ToWasmCircuitInfo, ToWasmObservableInfo } from "../type/ClientType";
import { MultiQuantumGate, ParametricQuantumGate, QuantumGate } from "../type/QuantumGate";
import { MultiQuantumGateType, ParametricQuantumGateType, PauliGateType, QuantumGateType } from "../type/QuantumGateType";
import { WasmPauliGateType, WasmQuantumGate, WasmQuantumGateType } from "../type/WasmGateType";

export function convertCircuitInfo(circuitInfo: CircuitInfo): ToWasmCircuitInfo {
    const wasmCircuitInfo: ToWasmCircuitInfo = {
        size: circuitInfo.size,
        circuit: []
    };
    circuitInfo.circuit.forEach((step, index) => {
        wasmCircuitInfo.circuit[index] = [];
        step.forEach((gate, i) => {
            let wasmGate = translateDefaultGateToWasmGate(gate);
            wasmCircuitInfo.circuit[index].push(wasmGate);
        });
    });
    return wasmCircuitInfo;
}

export function convertObservableInfo(observableInfo: ObservableInfo): ToWasmObservableInfo {
    const wasmObsevableInfo: ToWasmObservableInfo = {
        observable: []
    };
    observableInfo.observable.forEach((step, index) => {
        wasmObsevableInfo.observable[index] = {
            coefficient: step.coefficient,
            operators: []
        };
        step.operators.forEach((operator, i) => {
            if (!operator) {
                wasmObsevableInfo.observable[index].operators.push("0");
            }

            switch(step.operators[i]) {
                case PauliGateType.X:
                case PauliGateType.Y:
                case PauliGateType.Z:
                    wasmObsevableInfo.observable[index].operators.push(translateGateType(step.operators[i]) as WasmPauliGateType);
                    break;
            }
        });
    });
    return wasmObsevableInfo;
}

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

function translateGateType(defaultGateType: QuantumGateType): WasmQuantumGateType {
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
