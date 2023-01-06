import { WasmVector } from "../type/common";
import { StateAction } from "../type/StateAction";
import { WasmQuantumGate } from "../type/WasmGateType";

export interface QulacsWasmModule extends EmscriptenWasm.Module {
    getExceptionMessage(exceptionPtr: number): string;
    state_dataCpp(request: ToWasmSerialInfo): StateDataCppResult;
    state_sampling(request: ToWasmSamplingInfo): SamplingResult;
    state_get_zero_probability(request: GetZeroProbabilityInfo): GetZeroProbabilityResult;
    state_get_marginal_probability(request: GetMarginalProbabilityInfo): GetMarginalProbabilityResult;
}

// ゲート操作やstate setなどの単位の操作
export type ToWasmOperator = [0, StateAction] | [1, WasmQuantumGate[]]; // TODO: 0番目を型付け

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

export interface StateDataCppResult {
    /**
     * std::vector<double>
     */
    doubleVec: WasmVector<number>,

    /**
     * std::vector<CPPTYPE>
     * 
     * stateを継続利用する際にwasmに返送するためJS側で参照を維持する。JS側でこの値を利用することはない
     */
    cppVec: WasmVector<unknown>;
}

export interface SamplingResult extends StateDataCppResult {
    samplingVec: WasmVector<number>;
}

export interface GetZeroProbabilityResult {
    prob: number;
}

export interface GetMarginalProbabilityResult {
    marginal_prob: number;
}
