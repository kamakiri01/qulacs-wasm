import { ToWasmDefaultGateType, ToWasmDefaultQuantumGate } from "../../type/DefaultGateType";
import { convertCircuitInfo, convertObservableInfo } from "./toWasmUtil";
import { convertArrayToComplexArray, convertWasmVectorToArray } from "./fromWasmUtil";
import { QulacsWasmModule } from "../../emsciptenModule/QulacsWasmModule";
import { ToWasmCalcStateInfo } from "../../type/ClientType";

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
    ) {
        const result = this.module.getStateVectorWithExpectationValue({
            circuitInfo: convertCircuitInfo(info.circuitInfo),
            observableInfo: convertObservableInfo(info.observableInfo)
            
        });
        const stateVector = convertArrayToComplexArray(convertWasmVectorToArray(result.stateVector));
        return {
            stateVector,
            expectationValue: result.expectationValue
        }
    }
}
