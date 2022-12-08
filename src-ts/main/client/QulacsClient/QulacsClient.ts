import { convertCircuitInfo, convertObservableInfo } from "../../util/toWasmUtil";
import { convertAlternateArrayToComplexArray, convertWasmVectorToArray } from "../../util/fromWasmUtil";
import { StateVectorWithObservableRequest, QulacsWasmModule, RunShotTaskRequest, GetExpectationValueMapRequest } from "../../emsciptenModule/QulacsWasmModule";
import { CalcStateInfo, CircuitInfo } from "../../type/ClientType";;

export interface QulacsClientParameterObject {
    module: QulacsWasmModule;
}

export class QulacsClient {
    module: QulacsWasmModule;

    constructor(param: QulacsClientParameterObject) {
        this.module = param.module;
    }

    getStateVectorWithExpectationValue(
        info: CalcStateInfo
        ) {
        const request: StateVectorWithObservableRequest = {
            circuitInfo: convertCircuitInfo(info.circuitInfo),
            observableInfo: convertObservableInfo(info.observableInfo)
        };
        console.log("request", JSON.stringify(request));
        const result = this._callWasmWithThrowableException(() => this.module.getStateVectorWithExpectationValue(request));
        const stateVector = convertAlternateArrayToComplexArray(convertWasmVectorToArray(result.stateVector));
        return {
            stateVector,
            expectationValue: result.expectationValue
        }
    }    

    runShotTask(circuitInfo: CircuitInfo, shot: number): number[] {
        const request: RunShotTaskRequest = {
            circuitInfo: convertCircuitInfo(circuitInfo),
            shot
        };
        const result = this._callWasmWithThrowableException(() => this.module.runShotTask(request));
        // const resultMap
        return convertWasmVectorToArray(result.sampleMap);
    }

    getExpectationValueMap(
        info: CalcStateInfo,
        parametricPositionStep: number, // infoオブジェクトにまとめる。プロパティ名で意味を明示する。ファイルの上にinterfaceつくる
        parametricPositionQubitIndex: number,
        stepSize: number
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
        const result = this._callWasmWithThrowableException(() => this.module.getExpectationValueMap(request));
        return convertWasmVectorToArray(result.expectationValues);
    }
    _callWasmWithThrowableException<T>(moduleFunc: () => T): T {
        try {
            return moduleFunc();
        } catch (exception) {
            if (typeof exception === "number") {
                const wasmErrorMessage = this.module.getExceptionMessage(exception as number);
                throw new Error(wasmErrorMessage);
            }
            throw exception;
        }
    }
}
