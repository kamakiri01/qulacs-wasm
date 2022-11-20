import { QulacsNativeClassClient } from "../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { Complex } from "../type/common";
import { OperatorQueue, OperatorQueueType } from "./helper/OperatorQueue";
import { StateActionType } from "./helper/StateAction";

export class QuantumState {
    static client: QulacsNativeClassClient;
    qubit_count: number;
    // wasmに送る命令キューを持つ
    // NOTE: Gateを追加するかも
    _operatorQueues: OperatorQueue[] = [];

    constructor(qubit_count: number) {
        this.qubit_count = qubit_count;
        this.set_zero_state();
    }

    /*

    // Complex[]かも
    load(state: number[]) {
    }
    */
    
    set_zero_state() {
        this._operatorQueues = [{ queueType: OperatorQueueType.StateAction , queueData: {type: StateActionType.set_zero_state} }];
    };

    get_vector(): Complex[] {
        return QuantumState.client.state.get_vector(this);
    };

    get_amplitude(index: number): Complex {
        return QuantumState.client.state.get_amplitude(this, index);
    }

    load(stateOrArray: QuantumState | number[] | Complex[]): void {
        
    }

    /*
    sampling(sampling_count: number) {
        return QuantumState.client.state.sampling();
    }; // wasm
    */
}
