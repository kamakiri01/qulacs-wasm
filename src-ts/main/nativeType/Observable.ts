import { QulacsNativeClassClient } from "../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { QuantumState } from "./QuantumState";

export class Observable {
    static client: QulacsNativeClassClient;

    constructor(qubit_count: number) {

    }

    add_operator() {};
    get_expectation_value(state: QuantumState) { // wasm

    }
}
