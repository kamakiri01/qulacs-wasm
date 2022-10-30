import { ToWasmDefaultGateType } from "./DefaultGateType";
import { ToWasmRawGateType } from "./RawGateType";

type ToWasmQuantumCircuitStep<QuantumGate> = QuantumGate[];
type ToWasmQuantumCircuitData<QuantumGate> = ToWasmQuantumCircuitStep<QuantumGate>[];

// observable

type ToWasmObservableGateType = Extract<ToWasmDefaultGateType, undefined | "x" | "y" | "z" > | Extract<ToWasmRawGateType, | 0 | 1 | 2 | 3>;
type ToWasmObservableData<GateType> = ToWasmObservableStep<GateType>[];
type ToWasmObservableStep<GateType> = {
    // NOTE: ジェネリクスのGateType.Xなどを値として扱えないため、 ToWasmDefaultGateTypeとToWasmRawGateTypeのX/Y/Z/undefinedを指定する
    operators: ToWasmObservableGateType[];
    coefficient: number;
};

export interface ToWasmCircuitInfo<QuantumGate> {
    circuit: ToWasmQuantumCircuitData<QuantumGate>,
    size: number
}

export interface ToWasmObservableInfo<GateType> {
    observable: ToWasmObservableData<GateType>
}

export interface ToWasmCalcStateInfo<GateType, QuantumGate> {
    circuitInfo: ToWasmCircuitInfo<QuantumGate>,
    observableInfo: ToWasmObservableInfo<GateType>
}
