// qulacsと同名の型のclient

import { QuantumState } from "../../nativeType/QuantumState";
import { convertAlternateArrayToComplexArray, convertWasmVectorToArray } from "../../util/fromWasmUtil";
import { Complex } from "../../type/common";
import { translateOperatorQueueToSerialInfo } from "./util";
import { QulacsWasmModule } from "../../emsciptenModule/QulacsWasmModule";
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
                const stateInfo = translateOperatorQueueToSerialInfo(state._operatorQueues, size);
                const data = this.module.state_dataCpp(stateInfo);
                state._operatorQueues = [{ queueType: OperatorQueueType.StateAction, queueData: [StateActionType.load_wasmVector, data.cppVec] }];
                const stateVector = convertAlternateArrayToComplexArray(convertWasmVectorToArray(data.doubleVec));
                return stateVector;
            },
            get_amplitude: (state, index) => {
                return this.state.get_vector(state)[index];
            }
        };
    }
}

interface StateAPI {
    get_vector: (state: QuantumState) => Complex[];
    get_amplitude: (state: QuantumState, index: number) => Complex;
    //sampling: (sampling_count: number) => void;
}