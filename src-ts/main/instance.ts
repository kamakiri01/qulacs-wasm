import { QulacsWasmModule } from "./emsciptenModule/QulacsWasmModule";
import type { ClsOneControlOneTargetGate, ClsOneQubitGate, ClsOneQubitRotationGate, DensityMatrixImpl, ParametricQuantumCircuitImpl, QuantumCircuitImpl, QuantumGateBase, QuantumGateMatrix, QuantumStateImpl } from "./type/QulacsClass";

export type QuantumState = QuantumStateImpl;
export type QuantumCircuit = QuantumCircuitImpl;
export type ParametricQuantumCircuit = ParametricQuantumCircuitImpl;
export type DensityMatrix = DensityMatrixImpl;

export var getExceptionMessage: (exceptionPtr: number) => string;

export var QuantumState: QuantumState;
export var QuantumCircuit: QuantumCircuit;
export var ParametricQuantumCircuit: ParametricQuantumCircuit;
export var DensityMatrix: DensityMatrix;
export var Identity: ClsOneQubitGate;
export var X: ClsOneQubitGate;
export var Y: ClsOneQubitGate;
export var Z: ClsOneQubitGate;
export var H: ClsOneQubitGate;
export var S: ClsOneQubitGate;
export var Sdag: ClsOneQubitGate;
export var T: ClsOneQubitGate;
export var Tdag: ClsOneQubitGate;
export var RX: ClsOneQubitRotationGate;
export var RY: ClsOneQubitRotationGate;
export var RZ: ClsOneQubitRotationGate;
export var RotInvX: ClsOneQubitRotationGate;
export var RotInvY: ClsOneQubitRotationGate;
export var RotInvZ: ClsOneQubitRotationGate;
export var RotX: ClsOneQubitRotationGate;
export var RotY: ClsOneQubitRotationGate;
export var RotZ: ClsOneQubitRotationGate;
export var CNOT: ClsOneControlOneTargetGate;
export var CZ: ClsOneControlOneTargetGate;
export var SWAP: ClsOneControlOneTargetGate;
export var TOFFOLI: QuantumGateMatrix;

export var partial_trace: (state: DensityMatrix, target_traceout: number[]) => DensityMatrix;
export var to_matrix_gate: (gate: QuantumGateBase) => QuantumGateMatrix;

export function applyModule(qulacsModule: QulacsWasmModule) {
    Object.keys(module.exports).forEach(key => {
        const wasmExportedClass = (qulacsModule as any)[key];
        if (wasmExportedClass) module.exports[key] = wasmExportedClass;
        console.log("key", key, !!wasmExportedClass);
    });

    QuantumState.prototype.load = function(arg: any) {
        const that = this;
        console.log("QuantumState.prototype.load");
        console.log(
            Object.getPrototypeOf(arg).isPrototypeOf(QuantumState),
            Object.getPrototypeOf(arg).isPrototypeOf(Object.getPrototypeOf(QuantumState))
        );
        if (Array.isArray(arg)) return QuantumState.prototype.load_Vector.call(that, arg); // TODO: 暫定。Complexとnumberを考慮する必要がある
        //if (arg && arg.$$ && arg.$$.ptrType && arg.$$.ptrType.name === "")
        //if (Object.getPrototypeOf(arg).isPrototypeOf(Object.getPrototypeOf(QuantumState))) return QuantumState.prototype.load_QuantumState(arg); // 暫定
        return QuantumState.prototype.load_QuantumState.call(that, arg);
        //throw new Error("illegal arg type" + arg);
    }
}
