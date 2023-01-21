import { GateMatrixOperatorQueue } from "../nativeType/helper/GateMatrixOperatorQueue";
import { StateOperatorQueue } from "../nativeType/helper/StateOperatorQueue";
import { WasmQuantumGateData } from "../type/WasmQuantumGateData";

/**
 * QuantumState の操作ログを wasm に送るためのフォーマット
 */
export interface StateQueuesDump {
    operators: StateOperatorQueue[];
    size: number;
}

export interface StateGetVectorRequest extends StateQueuesDump {};

export interface StateSamplingRequest extends StateQueuesDump {
    sampling_count: number;
}

export interface SateGetZeroProbabilityRequest extends StateQueuesDump {
    target_qubit_index: number;
}

export interface StateGetMarginalProbabilityRequest extends StateQueuesDump {
    measured_values: number[];
}

export interface GateBaseGetMatrixRequest {
    gate: WasmQuantumGateData;
}

export interface GateMatrixGetMatrixRequest {
    operators: GateMatrixOperatorQueue[];
}
