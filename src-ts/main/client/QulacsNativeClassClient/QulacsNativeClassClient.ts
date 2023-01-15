import { QuantumState } from "../../nativeType/QuantumState";
import { convertSerialComplexArrayToComplexArray, convertWasmVectorToArray } from "../../util/fromWasmUtil";
import { Complex } from "../../type/common";
import { translateOperatorQueueToWasmSerialInfo } from "./util";
import { OperatorQueueType } from "../../nativeType/helper/OperatorQueue";
import { StateActionType } from "../../type/StateAction";
import { QuantumGateBase } from "../../nativeType/QuantumGate/QuantumGateBase";
import { GateBaseGetMatrixInfo, GateMatrixGetMatrixInfo, GetMarginalProbabilityInfo, GetZeroProbabilityInfo, ToWasmSamplingInfo } from "../../emsciptenModule/RequestType";
import { QulacsWasmModule } from "../../emsciptenModule/QulacsWasmModule";
import { translateDefaultGateToWasmGate } from "../../util/toWasmUtil";
import { QuantumGateMatrix } from "../../nativeType/QuantumGate/QuantumGateMatrix";
import { GateMatrixOperatorQueueType, InitCppMatQueue } from "../../nativeType/helper/GateMatrixOperatorQueue";

export interface QulacsNativeClassClientParameterObjeect {
    module: QulacsWasmModule;
}

export class QulacsNativeClassClient {
    module: QulacsWasmModule;
    state: StateAPI;
    gateBase: GateBaseAPI;
    gateMatrix: GateMatrixAPI;
    // observable: ObservableAPI;

    constructor(param: QulacsNativeClassClientParameterObjeect) {
        this.module = param.module;
        this.state = {
            get_vector: (state) => {
                const size = state.qubit_count;
                const request = translateOperatorQueueToWasmSerialInfo(state._operatorQueues, size);
                const result = this._callWasmWithThrowableException(() => this.module.state_dataCpp(request));
                state._operatorQueues = [{ queueType: OperatorQueueType.StateAction, queueData: [StateActionType.load_wasmVector, result.cppVec] }];
                const stateVector = convertSerialComplexArrayToComplexArray(convertWasmVectorToArray(result.doubleVec));
                return stateVector;
            },
            get_amplitude: (state, index) => {
                return this.state.get_vector(state)[index];
            },
            sampling: (state, sampling_count) => {
                const size = state.qubit_count;
                const serialInfo = translateOperatorQueueToWasmSerialInfo(state._operatorQueues, size);
                const request: ToWasmSamplingInfo = {...serialInfo, ...{sampling_count}};
                const result = this._callWasmWithThrowableException(() => this.module.state_sampling(request));
                state._operatorQueues = [{ queueType: OperatorQueueType.StateAction, queueData: [StateActionType.load_wasmVector, result.cppVec] }];
                const samplingResult = convertWasmVectorToArray(result.samplingVec);
                return samplingResult;
            },
            get_zero_probability: (state, target_qubit_index) => {
                const size = state.qubit_count;
                const serialInfo = translateOperatorQueueToWasmSerialInfo(state._operatorQueues, size);
                const request: GetZeroProbabilityInfo = {...serialInfo, ...{target_qubit_index}};
                const result = this._callWasmWithThrowableException(() => this.module.state_get_zero_probability(request));
                return result.prob;
            },
            get_marginal_probability: (state: QuantumState, measured_values: number[]) => {
                const size = state.qubit_count;
                const serialInfo = translateOperatorQueueToWasmSerialInfo(state._operatorQueues, size);
                const request: GetMarginalProbabilityInfo = {...serialInfo, ...{measured_values}};
                const result = this._callWasmWithThrowableException(() => this.module.state_get_marginal_probability(request));
                return result.marginal_prob;
            }
        };
        this.gateBase = {
            get_matrix: (gate: QuantumGateBase) => {
                const wasmGate = translateDefaultGateToWasmGate(gate);
                const request: GateBaseGetMatrixInfo = { gate: wasmGate };
                const result = this._callWasmWithThrowableException(() => this.module.gate_base_get_matrix(request));
                const serialVec = convertSerialComplexArrayToComplexArray(convertWasmVectorToArray(result.doubleVec));
                return serialVec;
            }
        },
        this.gateMatrix = {
            get_matrix: (gateMatrix: QuantumGateMatrix) => {
                const request: GateMatrixGetMatrixInfo = { operators: gateMatrix._queue };
                const result = this._callWasmWithThrowableException(() => this.module.gate_matrix_get_matrix(request));
                const serialVec = convertSerialComplexArrayToComplexArray(convertWasmVectorToArray(result.doubleVec));
                // NOTE: C++側のtarget/control qubitの更新をJS側に反映できるか確認できるまで、cppMatを利用したJS側のQuantumGateMatrixの更新は行わない
                // QuantumGateMatrixから_target_qubit_index_list/_control_qubit_index_listを事後取得してJS側に返すことができれば可能？
                /*
                gateMatrix._queue = [
                    [GateMatrixOperatorQueueType.InitCppMat, gateMatrix._target_qubit_index_list, result.cppMat, gateMatrix._control_qubit_index_list] as InitCppMatQueue
                ];
                */
                return serialVec;
            }
        }
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

interface StateAPI {
    get_vector: (state: QuantumState) => Complex[];
    get_amplitude: (state: QuantumState, index: number) => Complex;
    sampling: (state: QuantumState, sampling_count: number) => number[];
    get_zero_probability: (state: QuantumState, target_qubit_index: number) => number;
    get_marginal_probability: (state: QuantumState, measured_values: number[]) => number;
}

interface GateBaseAPI {
    get_matrix: (gate: QuantumGateBase) => Complex[];
}

interface GateMatrixAPI {
    get_matrix: (gateMatrix: QuantumGateMatrix) => Complex[];
}
