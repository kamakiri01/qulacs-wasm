import { QulacsNativeClient } from "../client/QulacsNativeClient/QulacsNativeClient";
import { OperatorQueue, OperatorQueueType } from "./helper/OperatorQueue";
import { StateActionType } from "./helper/StateAction";

export class QuantumState {
    static client: QulacsNativeClient;
    qubit_count: number;
    // wasmに送る命令キューを持つ
    // NOTE: Gateを追加するかも
    _operatorQueues: OperatorQueue[] = [];

    constructor(qubit_count: number) {
        this.qubit_count = qubit_count;
        this.set_zero_state();
    }

    /*
    get_amplitude(index: number): Complex {
    }

    // Complex[]かも
    load(state: number[]) {
    }
    */
    
    set_zero_state() {
        this._operatorQueues = [{ queueType: OperatorQueueType.StateAction , queueData: {type: StateActionType.set_zero_state} }];
    };

    get_vector() {
        return QuantumState.client.state.get_vector(this);
    }; // wasm

    /*
    sampling(sampling_count: number) {
        return QuantumState.client.state.sampling();
    }; // wasm
    */
}
