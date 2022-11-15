// qulacsと同名の型のclient

import { QuantumState } from "../../nativeType/QuantumState";
import { convertArrayToComplexArray, convertWasmVectorToArray } from "../QulacsWasmClient/fromWasmUtil";
import { Complex } from "../../type/common";
import { translateOperatorQueueToSerialInfo } from "./util";
import { QulacsWasmModule } from "../../emsciptenModule/QulacsWasmModule";
import { OperatorQueueType } from "../../nativeType/helper/OperatorQueue";
import { StateActionType } from "../../nativeType/helper/StateAction";

export interface QulacsNativeClientParameterObjeect {
    module: QulacsWasmModule;
}

export class QulacsNativeClient {
    module: QulacsWasmModule;
    state: StateAPI;
    // observable: ObservableAPI;

    constructor(param: QulacsNativeClientParameterObjeect) {
        this.module = param.module;
        this.state = {
            get_vector: (state) => {
                const size = state.qubit_count;
                const stateInfo = translateOperatorQueueToSerialInfo(state._operatorQueues, size);
                console.log("stateInfo", JSON.stringify(stateInfo));
                const data = this.module.state_dataCpp(stateInfo);
                state._operatorQueues = [{ queueType: OperatorQueueType.StateAction, queueData: {type: StateActionType.setWasmVector, data: data.cppVec} }];
                const stateVector = convertArrayToComplexArray(convertWasmVectorToArray(data.doubleVec));
                return stateVector;
            },
        };
    }
}

// NOTE: 別ファイルに移設
interface StateAPI {
    get_vector: (state: QuantumState) => Complex[];
    //sampling: (sampling_count: number) => void;
}
