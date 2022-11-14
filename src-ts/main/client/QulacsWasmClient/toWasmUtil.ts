import { ToWasmCircuitInfo, ToWasmObservableInfo } from "../../type/ClientType";
import { ToWasmDefaultQuantumGate, ToWasmDefaultGateType } from "../../type/DefaultGateType";
import { ToWasmRawGateType, ToWasmRawQuantumGate } from "../../type/RawGateType";

export function convertCircuitInfo(circuitInfo: ToWasmCircuitInfo<ToWasmDefaultQuantumGate>): ToWasmCircuitInfo<ToWasmRawQuantumGate> {
    const wasmCircuitInfo: ToWasmCircuitInfo<ToWasmRawQuantumGate> = {
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

export function convertObservableInfo(observableInfo: ToWasmObservableInfo<ToWasmDefaultGateType>): ToWasmObservableInfo<ToWasmRawGateType> {
    const wasmObsevableInfo: ToWasmObservableInfo<ToWasmRawGateType> = {
        observable: []
    };
    observableInfo.observable.forEach((step, index) => {
        wasmObsevableInfo.observable[index] = {
            coefficient: step.coefficient,
            operators: []
        };
        step.operators.forEach((operator, i) => {
            if (!operator) {
                wasmObsevableInfo.observable[index].operators.push(0);
            }

            switch(step.operators[i]) {
                case ToWasmDefaultGateType.X:
                    wasmObsevableInfo.observable[index].operators.push(1);
                    break;
                case ToWasmDefaultGateType.Y:
                    wasmObsevableInfo.observable[index].operators.push(2);
                    break;
                case ToWasmDefaultGateType.Z:
                    wasmObsevableInfo.observable[index].operators.push(3);
                    break;
            }
        });
    });
    return wasmObsevableInfo;
}

export function translateDefaultGateToWasmGate(gate: ToWasmDefaultQuantumGate): ToWasmRawQuantumGate {
    let wasmGate: ToWasmRawQuantumGate;
    if (!gate) {
        wasmGate = [0, 0, []];
    } else {
        wasmGate = [
            translateGateType(gate.type),
            gate.param ?? 0,
            gate.controllQubitIndex ?? []

        ];
    }
    return wasmGate;
}

function translateGateType(defaultGateType: ToWasmDefaultGateType | Extract<ToWasmDefaultGateType,  undefined | "x" | "y" | "z">): ToWasmRawGateType {
    switch(defaultGateType) {
        case ToWasmDefaultGateType.X:
            return 1;
        case ToWasmDefaultGateType.Y:
            return 2;
        case ToWasmDefaultGateType.Z:
            return 3;
        case ToWasmDefaultGateType.H:
            return 4;
        case ToWasmDefaultGateType.T:
            return 5;
        case ToWasmDefaultGateType.S:
            return 6;
        case ToWasmDefaultGateType.RX:
            return 7;
        case ToWasmDefaultGateType.RY:
            return 8;
        case ToWasmDefaultGateType.RZ:
            return 9;
        case ToWasmDefaultGateType.CNOT:
            return 10;
        case ToWasmDefaultGateType.CCNOT:
            return 11;
        default:
            return 0; // unreachable required
    }
}
