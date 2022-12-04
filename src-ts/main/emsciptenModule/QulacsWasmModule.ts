import { ToWasmOperator } from "../client/QulacsNativeClassClient/util";
import { ToWasmCalcStateInfo, ToWasmCircuitInfo, ToWasmObservableInfo } from "../type/ClientType";
import { WasmVector } from "../type/common";

export interface QulacsWasmModule extends EmscriptenWasm.Module {
    getStateVectorWithExpectationValue(request: StateVectorWithObservableRequest): StateVectorWithObervableResult;
    runShotTask(request: RunShotTaskRequest): RunShotTaskResult;
    getExpectationValueMap(request: GetExpectationValueMapRequest): GetExpectationValueMapResult;
    state_dataCpp(request: ToWasmSerialInfo): StateDataCppResult;
    state_sampling(request: ToWasmSamplingInfo): SamplingResult;
    state_get_zero_probability(request: GetZeroProbabilityInfo): GetZeroProbabilityResult;
    state_get_marginal_probability(request: GetMarginalProbabilityInfo): GetMarginalProbabilityResult;
}

export type StateVectorWithObservableRequest = ToWasmCalcStateInfo;

export interface StateVectorWithObervableResult {
    stateVector: WasmVector<number>;
    expectationValue: number;
}

export interface RunShotTaskRequest {
    circuitInfo: ToWasmCircuitInfo;
    shot: number;
}

export interface RunShotTaskResult {
    sampleMap: WasmVector<number>;
}

export interface GetExpectationValueMapRequest {
    circuitInfo: ToWasmCircuitInfo;
    observableInfo: ToWasmObservableInfo;
    parametricPositionStep: number;
    parametricPositionQubitIndex: number;
    stepSize: number;
    // parametricRange: number; // 通常2を想定する。Math.PIの係数。2以外なさそう
}

export interface GetExpectationValueMapResult {
    expectationValues: WasmVector<number>; // rangeは固定値で0~2、stepSizeで配列長さは自明なのでexpectationValueごとにparamを紐づけてwasmから返す必要はない。アプリが必要ならjs側で付ける
}

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
