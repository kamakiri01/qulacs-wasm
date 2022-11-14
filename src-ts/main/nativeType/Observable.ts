import { QulacsNativeClient } from "../client/QulacsNativeClient/QulacsNativeClient";
import { QuantumState } from "./QuantumState";

export class Observable {
    static client: QulacsNativeClient;

    constructor(qubit_count: number) {

    }

    add_operator() {};
    get_expectation_value(state: QuantumState) { // wasm

    }
}
