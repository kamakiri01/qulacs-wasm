import { QuantumGateType } from "../type/QuantumGateType";
import { StateAction } from "../type/StateAction";
import { WasmQuantumGateData } from "../type/WasmGateType";

// ゲート操作やstate setなどの単位の操作
export type ToWasmOperator = [0, StateAction] | [1, WasmQuantumGateData]; // TODO: 0番目を型付け

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
