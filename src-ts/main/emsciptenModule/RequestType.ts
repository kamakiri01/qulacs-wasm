import { GateMatrixOperatorQueue } from "../nativeType/helper/GateMatrixOperatorQueue";
import { StateOperatorQueue } from "../nativeType/helper/StateOperatorQueue";
import { WasmQuantumGateData } from "../type/WasmQuantumGateData";

/**
 * QuantumState の操作ログを wasm に送るためのフォーマット
 * ToWasmOperator は StateAction を含むため、量子回路の表現型である ToWasmCircuitInfo と共通化はしない
 */
export interface ToWasmSerialInfo {
    operators: StateOperatorQueue[];
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
