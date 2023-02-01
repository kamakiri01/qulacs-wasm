import { QulacsWasmModule } from "./emsciptenModule/QulacsWasmModule";
import { Complex } from "./type/common";
import type { ClsOneControlOneTargetGate, ClsOneQubitGate, ClsOneQubitRotationGate } from "./type/QulacsClass";

// NOTE: 型名と変数名が同じため、同じモジュール内で定義する
export type QuantumState = {
    get_vector(): Complex[];
}

export interface QuantumCircuit {
    update_quantum_state(state: QuantumState): void;
}


export interface ParametricQuantumCircuit extends QuantumCircuit {
}

export interface DensityMatrix {
    set_zero_state(): void;
}

export var QuantumState: QuantumState;
export var QuantumCircuit: QuantumCircuit;
export var ParametricQuantumCircuit: ParametricQuantumCircuit;
export var DensityMatrix: DensityMatrix;
export var X: ClsOneQubitGate;
export var Y: ClsOneQubitGate;
export var Z: ClsOneQubitGate;
export var H: ClsOneQubitGate;
export var S: ClsOneQubitGate;
export var T: ClsOneQubitGate;
export var RX: ClsOneQubitRotationGate;
export var CNOT: ClsOneControlOneTargetGate;

export function applyModule(qulacsModule: QulacsWasmModule) {
    Object.keys(module.exports).forEach(key => {
        const wasmExportedClass = (qulacsModule as any)[key];
        if (wasmExportedClass) module.exports[key] = wasmExportedClass;
    });
}
