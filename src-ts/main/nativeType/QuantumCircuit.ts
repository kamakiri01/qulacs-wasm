import { QulacsNativeClient } from "../client/QulacsNativeClient/QulacsNativeClient";
import { ToWasmDefaultGateType } from "../type/DefaultGateType";
import { IndexedToWasmDefaultQuantumGate } from "./helper/IndexedToWasmDefaultQuantumGate";
import { OperatorQueue, OperatorQueueType } from "./helper/OperatorQueue";
import { QuantumState } from "./QuantumState";

export class QuantumCircuit {
    static client: QulacsNativeClient;
    qubit_count: number;
    gateQueues: IndexedToWasmDefaultQuantumGate[];

    constructor(qubit_count: number) {
        this.qubit_count = qubit_count;
        this.gateQueues = [];
    }

    update_quantum_state(state: QuantumState) {
        state._operatorQueues = state._operatorQueues.concat(translateGateQueuesToOperatorQueues(this.gateQueues));
    }

    add_X_gate(index: number) {
        this.gateQueues.push({ type: ToWasmDefaultGateType.X, index });
    }

    add_Y_gate(index: number) {
        this.gateQueues.push({ type: ToWasmDefaultGateType.Y, index });
    }

    add_Z_gate(index: number) {
        this.gateQueues.push({ type: ToWasmDefaultGateType.Z, index });
    }

    add_H_gate(index: number) {
        this.gateQueues.push({ type: ToWasmDefaultGateType.H, index });
    }

    add_T_gate(index: number) {
        this.gateQueues.push({ type: ToWasmDefaultGateType.T, index });
    }

    add_S_gate(index: number) {
        this.gateQueues.push({ type: ToWasmDefaultGateType.S, index });
    }
}

function translateGateQueuesToOperatorQueues(gateQueues: IndexedToWasmDefaultQuantumGate[]): OperatorQueue[] {
    return gateQueues.map(queueData => {
        return {
            queueType: OperatorQueueType.Gate,
            queueData
        };
    });
}
