import { ToWasmOperator } from "../client/QulacsNativeClassClient/util";
import { ToWasmCalcStateInfo, ToWasmCircuitInfo, ToWasmObservableInfo } from "../type/ClientType";
import { WasmVector } from "../type/common";

export interface QulacsWasmModule extends EmscriptenWasm.Module {
    getStateVectorWithExpectationValue(request: StateVectorWithObservableRequest): StateVectorWithObervableResult;
    runShotTask(request: RunShotTaskRequest): RunShotTaskResult;
    getExpectationValueMap(request: GetExpectationValueMapRequest): GetExpectationValueMapResult;
    state_dataCpp(request: ToWasmSerialInfo): { doubleVec: WasmVector, cppVec: any }; // NOTE: 暫定
}

export type StateVectorWithObservableRequest = ToWasmCalcStateInfo;

export interface StateVectorWithObervableResult {
    stateVector: WasmVector;
    expectationValue: number;
}

export interface RunShotTaskRequest {
    circuitInfo: ToWasmCircuitInfo;
    shot: number;
}

export interface RunShotTaskResult {
    sampleMap: WasmVector;
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
    expectationValues: WasmVector; // rangeは固定値で0~2、stepSizeで配列長さは自明なのでexpectationValueごとにparamを紐づけてwasmから返す必要はない。アプリが必要ならjs側で付ける
}

export interface ToWasmSerialInfo {
    operators: ToWasmOperator[];
    size: number;
}

export interface StateDataCppResult {
    /**
     * std::vector<double>
     */
    doubleVec: WasmVector,

    /**
     * std::vector<CPPTYPE>
     * 
     * stateを継続利用する際にwasmに返送するためJS側で維持する
     */
    cppVec: WasmVector;
}