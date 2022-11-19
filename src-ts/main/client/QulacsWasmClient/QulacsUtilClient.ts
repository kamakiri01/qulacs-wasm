import { convertCircuitInfo, convertObservableInfo } from "../../util/toWasmUtil";
import { convertAlternateArrayToComplexArray, convertWasmVectorToArray } from "../../util/fromWasmUtil";
import { StateVectorWithObservableRequest, QulacsWasmModule, RunShotTaskRequest, GetExpectationValueMapRequest } from "../../emsciptenModule/QulacsWasmModule";
import { ToWasmCalcStateInfo, ToWasmCircuitInfo } from "../../type/ClientType";
import { QuantumGate } from "../../type/QuantumGate";
import { PauliGateType } from "../../type/QuantumGateType";

export interface QulacsUtilClientParameterObject {
    module: QulacsWasmModule;
}

export class QulacsUtilClient {
    module: QulacsWasmModule;

    constructor(param: QulacsUtilClientParameterObject) {
        this.module = param.module;
    }

    getStateVectorWithExpectationValue(
        info: ToWasmCalcStateInfo<PauliGateType, QuantumGate>
        ) {
        const request: StateVectorWithObservableRequest = {
            circuitInfo: convertCircuitInfo(info.circuitInfo),
            observableInfo: convertObservableInfo(info.observableInfo)
        };
        const result = this.module.getStateVectorWithExpectationValue(request);
        const stateVector = convertAlternateArrayToComplexArray(convertWasmVectorToArray(result.stateVector));
        return {
            stateVector,
            expectationValue: result.expectationValue
        }
    }    

    runShotTask(circuitInfo: ToWasmCircuitInfo<QuantumGate>, shot: number): number[] {
        const request: RunShotTaskRequest = {
            circuitInfo: convertCircuitInfo(circuitInfo),
            shot
        };
        const result = this.module.runShotTask(request);
        // const resultMap
        return convertWasmVectorToArray(result.sampleMap);
    }

    getExpectationValueMap(
        info: ToWasmCalcStateInfo<PauliGateType, QuantumGate>,
        parametricPositionStep: number, // infoオブジェクトにまとめる。プロパティ名で意味を明示する。ファイルの上にinterfaceつくる
        parametricPositionQubitIndex: number,
        stepSize: any
    ) {
        console.log("stepSize", stepSize);
        const request: GetExpectationValueMapRequest = {
            circuitInfo: convertCircuitInfo(info.circuitInfo),
            observableInfo: convertObservableInfo(info.observableInfo),
            parametricPositionStep,
            parametricPositionQubitIndex,
            stepSize
        };
        console.log("request", request);
        const result = this.module.getExpectationValueMap(request);
        return convertWasmVectorToArray(result.expectationValues);
    }
}
