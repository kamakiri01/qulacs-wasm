import { GateMatrixOperatorQueue } from "../nativeType/helper/GateMatrixOperatorQueue";
import { StateAction } from "../type/StateAction";
import { WasmQuantumGateData } from "../type/WasmGateType";

// ゲート操作やstate setなどの単位の操作
export const ToWasmOperatorQueueType = {
    StateAction: "stateaction",
    Gate: "gate"
} as const;
export type ToWasmOperatorQueueType = typeof ToWasmOperatorQueueType[keyof typeof ToWasmOperatorQueueType];

export type ToWasmOperator = [typeof ToWasmOperatorQueueType.StateAction, StateAction] | [typeof ToWasmOperatorQueueType.Gate, WasmQuantumGateData];

/**
 * QuantumState の操作ログを wasm に送るためのフォーマット
 * ToWasmOperator は StateAction を含むため、量子回路の表現型である ToWasmCircuitInfo と共通化はしない
 */
export interface ToWasmSerialInfo {
    operators: ToWasmOperator[];
    size: number;
}

export interface ToWasmSamplingInfo extends ToWasmSerialInfo {
    sampling_count: number;
}

export interface GetZeroProbabilityInfo extends ToWasmSerialInfo {
    target_qubit_index: number;
}

export interface GetMarginalProbabilityInfo extends ToWasmSerialInfo {
    measured_values: number[];
}

export interface GateBaseGetMatrixInfo {
    gate: WasmQuantumGateData;
}

export interface GateMatrixGetMatrixInfo {
    operators: GateMatrixOperatorQueue[];
}
