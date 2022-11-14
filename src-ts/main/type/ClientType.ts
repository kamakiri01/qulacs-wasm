import { ToWasmDefaultGateType, ToWasmDefaultQuantumGate } from "./DefaultGateType";
import { ToWasmRawGateType, ToWasmRawQuantumGate } from "./RawGateType";

//circuit

type ToWasmQuantumCircuitStep<QuantumGate extends (ToWasmDefaultQuantumGate | ToWasmRawQuantumGate)> = QuantumGate[];
type ToWasmQuantumCircuitData<QuantumGate extends (ToWasmDefaultQuantumGate | ToWasmRawQuantumGate)> = ToWasmQuantumCircuitStep<QuantumGate>[];

// observable

type ToWasmObservableGateType<T extends (ToWasmDefaultGateType | ToWasmRawGateType)> =
    Extract<T, typeof ToWasmDefaultGateType.EMPTY | typeof ToWasmDefaultGateType.X | typeof ToWasmDefaultGateType.Y | typeof ToWasmDefaultGateType.Z > |
    Extract<T, typeof ToWasmRawGateType.EMPTY | typeof ToWasmRawGateType.X | typeof ToWasmRawGateType.Y | typeof ToWasmRawGateType.Z>;
type ToWasmObservableData<GateType extends (ToWasmDefaultGateType | ToWasmRawGateType)> = ToWasmObservableStep<GateType>[];
type ToWasmObservableStep<GateType extends (ToWasmDefaultGateType | ToWasmRawGateType)> = {
    operators: ToWasmObservableGateType<GateType>[];
    coefficient: number;
};

/**
 * QulacsWasmClient 向けの回路表現
 * QulacsWasmClient と QulacsWasmModule 先の wasm モジュールの双方で利用するため、
 * 量子ゲート表現をジェネリクスで分離している
 */
export interface ToWasmCircuitInfo<QuantumGate extends (ToWasmDefaultQuantumGate | ToWasmRawQuantumGate)> {
    circuit: ToWasmQuantumCircuitData<QuantumGate>;
    size: number;
}

/**
 * QulacsWasmClient 向けのオブザーバブル表現
 * QulacsWasmClient と QulacsWasmModule 先の wasm モジュールの双方で利用するため、
 * 量子ゲート表現をジェネリクスで分離している
 */
export interface ToWasmObservableInfo<GateType extends (ToWasmDefaultGateType | ToWasmRawGateType)> {
    observable: ToWasmObservableData<GateType>;
}

/**
 * QulacsWasmClient と QulacsWasmModule 向けの量子状態の環境設定表現
 */
export interface ToWasmCalcStateInfo<
    GateType extends (ToWasmDefaultGateType | ToWasmRawGateType),
    QuantumGate extends (ToWasmDefaultQuantumGate | ToWasmRawQuantumGate)> {
    circuitInfo: ToWasmCircuitInfo<QuantumGate>;
    observableInfo: ToWasmObservableInfo<GateType>;
}
