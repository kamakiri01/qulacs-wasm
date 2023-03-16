import { QulacsWasmModule } from "./emsciptenModule/QulacsWasmModule";
import { Complex } from "./type/common";
import type { ClsOneControlOneTargetGate, ClsOneQubitGate, ClsOneQubitRotationGate, DensityMatrixImpl, ParametricQuantumCircuitImpl, QuantumCircuitImpl, QuantumGateBase, QuantumGateMatrix, QuantumStateBase, QuantumStateImpl } from "./type/QulacsClass";

export type QuantumState = QuantumStateImpl;
export type QuantumCircuit = QuantumCircuitImpl;
export type ParametricQuantumCircuit = ParametricQuantumCircuitImpl;
export type DensityMatrix = DensityMatrixImpl;

export var getExceptionMessage: (exceptionPtr: number) => string;

export var QuantumState: QuantumState;
export var QuantumCircuit: QuantumCircuit;
export var ParametricQuantumCircuit: ParametricQuantumCircuit;
export var DensityMatrix: DensityMatrix;
export var Identity: (target_qubit_index: number) => ClsOneQubitGate;;
export var X: (target_qubit_index: number) => ClsOneQubitGate;;
export var Y: (target_qubit_index: number) => ClsOneQubitGate;;
export var Z: (target_qubit_index: number) => ClsOneQubitGate;;
export var H: (target_qubit_index: number) => ClsOneQubitGate;
export var S: (target_qubit_index: number) => ClsOneQubitGate;;
export var Sdag: (target_qubit_index: number) => ClsOneQubitGate;;
export var T: (target_qubit_index: number) => ClsOneQubitGate;;
export var Tdag: (target_qubit_index: number) => ClsOneQubitGate;
export var U1: (target_qubit_index: number) => ClsOneQubitGate;;
export var U2: (target_qubit_index: number) => ClsOneQubitGate;;
export var U3: (target_qubit_index: number) => ClsOneQubitGate;;
export var RX: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RY: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RZ: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotInvX: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotInvY: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotInvZ: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotX: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotY: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotZ: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var CNOT: (control_qubit_index: number, target_qubit_index: number) => ClsOneControlOneTargetGate;
export var CZ: (control_qubit_index: number, target_qubit_index: number) => ClsOneControlOneTargetGate;
export var SWAP: (qubit_index1: number, qubit_index2: number) => ClsOneControlOneTargetGate;
export var TOFFOLI: (control_index1: number, control_index2: number, target_index: number) => QuantumGateMatrix;

export var partial_trace: (state: QuantumState | DensityMatrix, target_traceout: number[]) => DensityMatrix;
export var to_matrix_gate: (gate: QuantumGateBase) => QuantumGateMatrix;
export var inner_product: (state_bra: QuantumState, state_ket: QuantumState) => Complex;
export var tensor_product: <T = QuantumState | DensityMatrix>(state_left: T, state_right: T) => QuantumState;
export var make_superposition: (coef1: number | Complex, state1: QuantumState, coef2: number | Complex, state2: QuantumState) => QuantumState;
export var make_mixture: (prob1: number | Complex, state1: QuantumStateBase, prob2: number | Complex, state2: QuantumStateBase) => DensityMatrix;
export var permutate_qubit: <T = QuantumState | DensityMatrix>(state: T, qubit_order: number[]) => T;

export function applyModule(qulacsModule: QulacsWasmModule) {
    Object.keys(module.exports).forEach(key => {
        const wasmExportedImpl = (qulacsModule as any)[key];
        if (wasmExportedImpl) module.exports[key] = wasmExportedImpl;
    });
    applyQuantumStateOverload();
    applyDensityMatrixOverload();
    applyFunctionOverload(qulacsModule);
}

function applyQuantumStateOverload() {
    QuantumState.prototype.load = function(arg: any) {
        if (Array.isArray(arg)) return QuantumState.prototype.load_Vector.call(this, arg);
        return QuantumState.prototype.load_QuantumStateBase.call(this, arg);
    }

    QuantumState.prototype.multiply_coef = function(arg: any) {
        const that = this;
        if (typeof arg === "number") {
            return QuantumState.prototype.multiply_coef_double.call(this, arg);
        } else {
            return QuantumState.prototype.multiply_coef_complex.call(this, arg);
        }
    }
}

function applyDensityMatrixOverload() {
    DensityMatrix.prototype.load = function(arg: any) {
        const that = this;
        if (Array.isArray(arg)) {
            if (Array.isArray(arg[0])) {
                return DensityMatrix.prototype.load_Matrix.call(this, arg);
            } else {
                return DensityMatrix.prototype.load_Vector.call(this, arg);
            }
        }
        return DensityMatrix.prototype.load_QuantumStateBase.call(this, arg);
    }

    DensityMatrix.prototype.multiply_coef = function(arg: any) {
        const that = this;
        if (typeof arg === "number") {
            return DensityMatrix.prototype.multiply_coef_double.call(this, arg);
        } else {
            return DensityMatrix.prototype.multiply_coef_complex.call(this, arg);
        }
    }
}

function applyFunctionOverload(qulacsModule: any) {
    tensor_product = <T>(state_left: any, state_right: any) => {
        // NOTE: 暫定。より確実な判定方法を検討する
        if (state_left.$$.ptrType.name === "QuantumState*" && state_right.$$.ptrType.name === "QuantumState*") {
            return qulacsModule["tensor_product_QuantumState"](state_left, state_right);
        } else {
            return qulacsModule["tensor_product_DensityMatrix"](state_left, state_right);
        }
    };
}
