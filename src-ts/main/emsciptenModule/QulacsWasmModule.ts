import { ToWasmOperator } from "../client/QulacsNativeClient/util";
import { ToWasmCalcStateInfo } from "../type/ClientType";
import { WasmVector } from "../type/common";
import { WasmPauliGateType, WasmQuantumGate } from "../type/WasmGateType";

export interface QulacsWasmModule extends EmscriptenWasm.Module {
    getStateVectorWithExpectationValue(request: ToWasmCalcStateInfo<WasmPauliGateType, WasmQuantumGate>): GetStateVectorWithExpectationValueResult;
    state_dataCpp(request: ToWasmSerialInfo): { doubleVec: WasmVector, cppVec: any }; // NOTE: 暫定
}

export interface GetStateVectorWithExpectationValueResult {
    stateVector: WasmVector;
    expectationValue: number;
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