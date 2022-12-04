// qulacsと同名の型のclient

import { QuantumState } from "../../nativeType/QuantumState";
import { convertAlternateArrayToComplexArray, convertWasmVectorToArray } from "../../util/fromWasmUtil";
import { Complex } from "../../type/common";
import { translateOperatorQueueToSerialInfo } from "./util";
import { GetMarginalProbabilityInfo, GetZeroProbabilityInfo, QulacsWasmModule, ToWasmSamplingInfo } from "../../emsciptenModule/QulacsWasmModule";
import { OperatorQueueType } from "../../nativeType/helper/OperatorQueue";
import { StateActionType } from "../../nativeType/helper/StateAction";

export interface QulacsNativeClassClientParameterObjeect {
    module: QulacsWasmModule;
}

export class QulacsNativeClassClient {
    module: QulacsWasmModule;
    state: StateAPI;
    // observable: ObservableAPI;

    constructor(param: QulacsNativeClassClientParameterObjeect) {
        this.module = param.module;
        this.state = {
            get_vector: (state) => {
                const size = state.qubit_count;
                const request = translateOperatorQueueToSerialInfo(state._operatorQueues, size);
                const result = this.module.state_dataCpp(request);
                state._operatorQueues = [{ queueType: OperatorQueueType.StateAction, queueData: [StateActionType.load_wasmVector, result.cppVec] }];
                const stateVector = convertAlternateArrayToComplexArray(convertWasmVectorToArray(result.doubleVec));
                return stateVector;
            },
            get_amplitude: (state, index) => {
                return this.state.get_vector(state)[index];
            },
            sampling: (state, sampling_count) => {
                const size = state.qubit_count;
                const serialInfo = translateOperatorQueueToSerialInfo(state._operatorQueues, size);
                const request: ToWasmSamplingInfo = {...serialInfo, ...{sampling_count}};
                const result = this.module.state_sampling(request);
                state._operatorQueues = [{ queueType: OperatorQueueType.StateAction, queueData: [StateActionType.load_wasmVector, result.cppVec] }];
                const samplingResult = convertWasmVectorToArray(result.samplingVec);
                return samplingResult;
            },
            get_zero_probability: (state, target_qubit_index) => {
                const size = state.qubit_count;
                const serialInfo = translateOperatorQueueToSerialInfo(state._operatorQueues, size);
                const request: GetZeroProbabilityInfo = {...serialInfo, ...{target_qubit_index}};
                const result = this.module.state_get_zero_probability(request);
                return result.prob;
            },
            get_marginal_probability: (state: QuantumState, measured_values: number[]) => {
                const size = state.qubit_count;
                const serialInfo = translateOperatorQueueToSerialInfo(state._operatorQueues, size);
                const request: GetMarginalProbabilityInfo = {...serialInfo, ...{measured_values}};
                const result = this.module.state_get_marginal_probability(request);
                return result.marginal_prob;
            }
        };
    }
}

interface StateAPI {
    get_vector: (state: QuantumState) => Complex[];
    get_amplitude: (state: QuantumState, index: number) => Complex;
    sampling: (state: QuantumState, sampling_count: number) => number[];
    get_zero_probability: (state: QuantumState, target_qubit_index: number) => number;
    get_marginal_probability: (state: QuantumState, measured_values: number[]) => number;
}
