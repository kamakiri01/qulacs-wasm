import { QulacsNativeClassClient } from "../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { Complex } from "../type/common";
import { StateActionType } from "./helper/StateAction";
import { StateOperatorQueue, StateOperatorQueueType } from "./helper/StateOperatorQueue";

export class QuantumState {
    static client: QulacsNativeClassClient;

    qubit_count: number;

    // 必ず初期化するため length === 0 を想定しない
    _operatorQueues: StateOperatorQueue[] = [];

    constructor(qubit_count: number) {
        this.qubit_count = qubit_count;
        this.set_zero_state();
    }

    set_zero_state() {
        this._operatorQueues = [
            [StateOperatorQueueType.StateAction, [StateActionType.set_zero_state]]
        ];
    };

    set_computational_basis(comp_basis: number) {
        this._operatorQueues = [
            [StateOperatorQueueType.StateAction, [StateActionType.set_computational_basis, comp_basis]]
        ];
    }

    set_Haar_random_state(seed?: number) {
        if (seed) {
            this._operatorQueues = [
                [StateOperatorQueueType.StateAction, [StateActionType.set_Haar_random_state_seed, seed]]
            ];
        } else {
            this._operatorQueues = [
                [StateOperatorQueueType.StateAction, [StateActionType.set_Haar_random_state_no_seed]]
            ];
        }
    }

    get_vector(): Complex[] {
        return QuantumState.client.state.get_vector(this);
    };

    get_amplitude(index: number): Complex {
        return QuantumState.client.state.get_amplitude(this, index);
    }

    get_qubit_count(): number {
        return this.qubit_count;
    }

    get_zero_probability(index: number): number {
        return QuantumState.client.state.get_zero_probability(this, index);
    }

    get_marginal_probability(measured_values: number[]): number {
        return QuantumState.client.state.get_marginal_probability(this, measured_values);
    }

    load(stateOrArray: QuantumState | number[] | Complex[]): void {
        if (stateOrArray instanceof QuantumState) {
            const copiedQueue = stateOrArray._operatorQueues[0];
            this._operatorQueues = [copiedQueue];
        } else if (Array.isArray(stateOrArray)) {
            if (isComplexArray(stateOrArray)) {
                this._operatorQueues =
                    [
                        [StateOperatorQueueType.StateAction, [StateActionType.load_ComplexSerialVector, complexArrayToSerialArray(stateOrArray)]]
                    ];
            } else if (typeof stateOrArray[0] === "number") {
                this._operatorQueues =
                    [
                        [StateOperatorQueueType.StateAction, [StateActionType.load_ComplexSerialVector, arrayToSerialArray(stateOrArray)]]
                    ];
            } else {
                throw new Error("invalid QuantumState#load() data");
            }
        } else {
            throw new Error("invalid QuantumState#load() data");
        }
    }

    allocate_buffer(): QuantumState {
        return new QuantumState(this.qubit_count);
    }

    sampling(sampling_count: number): number[] {
        return QuantumState.client.state.sampling(this, sampling_count);
    };
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