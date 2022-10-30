import type { ToWasmDefaultGateType, ToWasmDefaultQuantumGate } from "../type/DefaultGateType";
import type { ToWasmRawGateType, ToWasmRawQuantumGate } from "../type/RawGateType";

export interface QulacsWasmModule extends EmscriptenWasm.Module {
    getStateVectorWithExpectationValue(request: ToWasmCalcStateInfo<ToWasmRawGateType, ToWasmRawQuantumGate>): GetStateVectorWithExpectationValueResult;
}

export interface Complex {
    re: number;
    im: number;
  }

export interface GetStateVectorWithExpectationValueResult {
    stateVector: number;
    expectationValue: number;
}

export interface QulacsWasmClientParameterObjeect {
    module: QulacsWasmModule;
}

export class QulacsWasmClient {
    module: QulacsWasmModule;
    constructor(param: QulacsWasmClientParameterObjeect) {
        this.module = param.module;
    }

    getStateVectorWithExpectationValue(
        info: ToWasmCalcStateInfo<ToWasmDefaultGateType, ToWasmDefaultQuantumGate>
    ): GetStateVectorWithExpectationValueResult {
        return this.module.getStateVectorWithExpectationValue(
            convertCalcStateInfo(info)
        );
    }
}

function convertCalcStateInfo(defaultInfo: ToWasmCalcStateInfo<ToWasmDefaultGateType, ToWasmDefaultQuantumGate>): ToWasmCalcStateInfo<ToWasmRawGateType, ToWasmRawQuantumGate> {

}

