import { QuantumGate } from "./QuantumGate";
import { PauliGateType } from "./QuantumGateType";
import { WasmQuantumGate, WasmPauliGateType } from "./WasmGateType";

//circuit

type QuantumCircuitStep<T extends (QuantumGate | WasmQuantumGate)> = T[];
type QuantumCircuitData<T extends (QuantumGate | WasmQuantumGate)> = QuantumCircuitStep<T>[];

// observable

type ObservableGateType<T extends (PauliGateType | WasmPauliGateType)> = T;
type ObservableStep<T extends (PauliGateType | WasmPauliGateType)> = {
    operators: ObservableGateType<T>[];
    coefficient: number;
};
type ObservableData<T extends (PauliGateType | WasmPauliGateType)> = ObservableStep<T>[];

/**
 * QulacsClient 向けの回路表現
 * QulacsClient と QulacsWasmModule 先の wasm モジュールの双方で利用するため、
 * 量子ゲート表現をジェネリクスで分離している
 */
export interface CircuitInfoBase<T extends (QuantumGate | WasmQuantumGate)> {
    circuit: QuantumCircuitData<T>;
    size: number;
}
export type CircuitInfo = CircuitInfoBase<QuantumGate>;
export type ToWasmCircuitInfo = CircuitInfoBase<WasmQuantumGate>;

/**
 * QulacsWasmClient 向けのオブザーバブル表現
 * QulacsWasmClient と QulacsWasmModule 先の wasm モジュールの双方で利用するため、
 * 量子ゲート表現をジェネリクスで分離している
 */
export interface ObservableInfoBase<T extends (PauliGateType | WasmPauliGateType)> {
    observable: ObservableData<T>;
}
export type ObservableInfo = ObservableInfoBase<PauliGateType>;
export type ToWasmObservableInfo = ObservableInfoBase<WasmPauliGateType>;

/**
 * QulacsWasmClient と QulacsWasmModule 向けの量子状態の環境設定表現
 */
export interface CalcStateInfoBase<
    T extends (PauliGateType | WasmPauliGateType),
    U extends (QuantumGate | WasmQuantumGate)> {
    circuitInfo: CircuitInfoBase<U>;
    observableInfo: ObservableInfoBase<T>;
}

export type CalcStateInfo = CalcStateInfoBase<PauliGateType, QuantumGate>;
export type ToWasmCalcStateInfo = CalcStateInfoBase<WasmPauliGateType, WasmQuantumGate>;
