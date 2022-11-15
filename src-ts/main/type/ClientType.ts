import { QuantumGate } from "./QuantumGate";
import { PauliGateType } from "./QuantumGateType";
import { WasmQuantumGate, WasmPauliGateType } from "./WasmGateType";

//circuit

type ToWasmQuantumCircuitStep<T extends (QuantumGate | WasmQuantumGate)> = T[];
type ToWasmQuantumCircuitData<T extends (QuantumGate | WasmQuantumGate)> = ToWasmQuantumCircuitStep<T>[];

// observable

type ToWasmObservableGateType<T extends (PauliGateType | WasmPauliGateType)> = T;
type ToWasmObservableData<T extends (PauliGateType | WasmPauliGateType)> = ToWasmObservableStep<T>[];
type ToWasmObservableStep<T extends (PauliGateType | WasmPauliGateType)> = {
    operators: ToWasmObservableGateType<T>[];
    coefficient: number;
};

/**
 * QulacsWasmClient 向けの回路表現
 * QulacsWasmClient と QulacsWasmModule 先の wasm モジュールの双方で利用するため、
 * 量子ゲート表現をジェネリクスで分離している
 */
export interface ToWasmCircuitInfo<T extends (QuantumGate | WasmQuantumGate)> {
    circuit: ToWasmQuantumCircuitData<T>;
    size: number;
}

/**
 * QulacsWasmClient 向けのオブザーバブル表現
 * QulacsWasmClient と QulacsWasmModule 先の wasm モジュールの双方で利用するため、
 * 量子ゲート表現をジェネリクスで分離している
 */
export interface ToWasmObservableInfo<T extends (PauliGateType | WasmPauliGateType)> {
    observable: ToWasmObservableData<T>;
}

/**
 * QulacsWasmClient と QulacsWasmModule 向けの量子状態の環境設定表現
 */
export interface ToWasmCalcStateInfo<
    T extends (PauliGateType | WasmPauliGateType),
    U extends (QuantumGate | WasmQuantumGate)> {
    circuitInfo: ToWasmCircuitInfo<U>;
    observableInfo: ToWasmObservableInfo<T>;
}
