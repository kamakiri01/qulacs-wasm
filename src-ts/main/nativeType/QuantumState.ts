import { QulacsNativeClassClient } from "../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { Complex } from "../type/common";
import { OperatorQueue, OperatorQueueType } from "./helper/OperatorQueue";
import { StateActionType } from "./helper/StateAction";

export class QuantumState {
    static client: QulacsNativeClassClient;
    qubit_count: number;
    /**
     * length === 0 を想定しない
     */
    _operatorQueues: OperatorQueue[] = [];

    constructor(qubit_count: number) {
        this.qubit_count = qubit_count;
        this.set_zero_state();
    }

    set_zero_state() {
        this._operatorQueues = [{ queueType: OperatorQueueType.StateAction , queueData: [StateActionType.set_zero_state] }];
    };

    get_vector(): Complex[] {
        return QuantumState.client.state.get_vector(this);
    };

    get_amplitude(index: number): Complex {
        return QuantumState.client.state.get_amplitude(this, index);
    }

    load(stateOrArray: QuantumState | number[] | Complex[]): void {
        if (stateOrArray instanceof QuantumState) {
            const copiedQueue = stateOrArray._operatorQueues[0];
            this._operatorQueues = [copiedQueue];
        } else if (Array.isArray(stateOrArray)) {
            if (isComplexArray(stateOrArray)) {
                this._operatorQueues =
                    [{ queueType: OperatorQueueType.StateAction, queueData: [StateActionType.load_ComplexSerialVector, complexArrayToSerialArray(stateOrArray)]}];
            } else if (typeof stateOrArray[0] === "number") {
                this._operatorQueues =
                    [{ queueType: OperatorQueueType.StateAction, queueData: [StateActionType.load_ComplexSerialVector, arrayToSerialArray(stateOrArray)]}];
            }
        } else {
            throw new Error("invalid load data");
        }
    }

    /*
    sampling(sampling_count: number) {
        return QuantumState.client.state.sampling();
    }; // wasm
    */
}

function isComplexArray(array: any): array is Complex[] {
    return array[0].hasOwnProperty("re") && array[0].hasOwnProperty("im");
}

function complexArrayToSerialArray(array: Complex[]): number[] {
    const arr: number[] = [];
    array.forEach(e => {
        arr.push(e.re);
        arr.push(e.im);
    });
    return arr;
}

function arrayToSerialArray(array: number[]): number[] {
    const arr: number[] = [];
    array.forEach(e => {
        arr.push(e); // re
        arr.push(0); // im
    });
    return arr;
}