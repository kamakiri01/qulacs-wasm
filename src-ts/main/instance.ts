import { QulacsWasmModule } from "./emsciptenModule/QulacsWasmModule";
import { Complex } from "./type/common";
import type { ClsOneControlOneTargetGate, ClsOneQubitGate, ClsOneQubitRotationGate, ClsReversibleBooleanGate, ClsStateReflectionGate, DensityMatrixImpl, ParametricQuantumCircuitImpl, QuantumCircuitImpl, QuantumGateBase, QuantumGateDiagonalMatrix, QuantumGateMatrix, QuantumGateSparseMatrix, QuantumStateBase, QuantumStateImpl } from "./type/QulacsClass";

export type QuantumState = QuantumStateImpl;
export type QuantumCircuit = QuantumCircuitImpl;
export type ParametricQuantumCircuit = ParametricQuantumCircuitImpl;
export type DensityMatrix = DensityMatrixImpl;

export var getExceptionMessage: (exceptionPtr: number) => string;
export var addFunction: (func: any, flag: string) => number;
export var removeFunction: (funcPtr: number) => void;

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
export var sqrtX: (target_qubit_index: number) => ClsOneQubitGate;
export var sqrtXdag: (target_qubit_index: number) => ClsOneQubitGate;
export var sqrtY: (target_qubit_index: number) => ClsOneQubitGate;
export var sqrtYdag: (target_qubit_index: number) => ClsOneQubitGate;
export var P0: (target_qubit_index: number) => ClsOneQubitGate;;
export var P1: (target_qubit_index: number) => ClsOneQubitGate;;
export var U1: (target_qubit_index: number, lambda: number) => QuantumGateMatrix;
export var U2: (target_qubit_index: number, phi: number, lambda: number) => QuantumGateMatrix;
export var U3: (target_qubit_index: number, theta: number, phi: number, lambda: number) => QuantumGateMatrix;
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
export var FREDKIN: (control_index: number, target_index1: number, target_index2: number) => QuantumGateMatrix;
export var Pauli: (target_qubit_index_list: number[], pauli_ids: number[]) => QuantumGateMatrix;
export var PauliRotation: (target_qubit_index_list: number[], pauli_ids: number[], angle: number) => QuantumGateMatrix;
export var DenseMatrix: (target_qubit_index_list: number | number[], matrix: (Complex | number)[][]) => QuantumGateMatrix;
export var SparseMatrix: (target_qubit_index_list: number[], matrix: (Complex | number)[][]) => QuantumGateSparseMatrix;
export var DiagonalMatrix: (target_qubit_index_list: number[], diagonal_element: (Complex | number)[]) => QuantumGateDiagonalMatrix;
export var RandomUnitary: (target_qubit_index_list: number[], seed?: number) => QuantumGateMatrix;
export var ReversibleBoolean: (target_qubit_index_list: number[], function_ptr: (val: number, dim: number) => number) => ClsReversibleBooleanGate;
export var StateReflection: (reflection_state: QuantumStateBase) => ClsStateReflectionGate;

export var partial_trace: (state: QuantumState | DensityMatrix, target_traceout: number[]) => DensityMatrix;
export var to_matrix_gate: (gate: QuantumGateBase) => QuantumGateMatrix;
export var inner_product: (state_bra: QuantumState, state_ket: QuantumState) => Complex;
export var tensor_product: <T = QuantumState | DensityMatrix>(state_left: T, state_right: T) => QuantumState;
export var drop_qubit: (state: QuantumState, target: number[], order: number[]) => QuantumState;
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
    partial_trace = (state: any, target_traceout: number[]) => {
        // NOTE: 暫定。より確実な判定方法を検討する
        if (state.$$.ptrType.name === "QuantumState*" && state.$$.ptrType.name === "QuantumState*") {
            return qulacsModule["partial_trace_QuantumState"](state, target_traceout);
        } else {
            return qulacsModule["partial_trace_DensityMatrix"](state, target_traceout);
        }
    }

    tensor_product = (state_left: any, state_right: any) => {
        // NOTE: 暫定。より確実な判定方法を検討する
        if (state_left.$$.ptrType.name === "QuantumState*" && state_right.$$.ptrType.name === "QuantumState*") {
            return qulacsModule["tensor_product_QuantumState"](state_left, state_right);
        } else {
            return qulacsModule["tensor_product_DensityMatrix"](state_left, state_right);
        }
    };

    permutate_qubit = (state: any, qubit_order: number[]) => {
        // NOTE: 暫定。より確実な判定方法を検討する
        if (state.$$.ptrType.name === "QuantumState*" && state.$$.ptrType.name === "QuantumState*") {
            return qulacsModule["permutate_qubit_QuantumState"](state, qubit_order);
        } else {
            return qulacsModule["permutate_qubit_DensityMatrix"](state, qubit_order);
        }   
    }

    ReversibleBoolean = (target_qubit_index_list: number[], function_ptr: (val: number, dim: number) => number) => {
        const fnPointer = addFunction(function_ptr, "iii");
        const gate = qulacsModule["ReversibleBoolean"](target_qubit_index_list, fnPointer);
        //removeFunction(fnPointer); // NOTE:C++側クロージャが参照する可能性が残るので、いつ消せるか検討。ReversibleBooleanのdeleteまで？
        return gate;
    }

    DenseMatrix = (target_qubit_index_list: number | number[], matrix: (Complex | number)[][]) => {
        if (Array.isArray(target_qubit_index_list)) {
            return qulacsModule["DenseMatrix_vector_UINT"](target_qubit_index_list, matrix);
        } else {
            return qulacsModule["DenseMatrix_UINT"](target_qubit_index_list, matrix);
        }
    }
}
