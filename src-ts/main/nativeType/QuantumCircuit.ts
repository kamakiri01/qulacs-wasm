import { QulacsNativeClassClient } from "../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { OperatorQueueType, QuantumGateOperatorQueue } from "./helper/OperatorQueue";
import { H, QuantumGateBase, X, Y, Z, T, S } from "./QuantumGate/QuantumGateBase";
import { CNOT } from "./QuantumGate/OneControlOneTargetGate";
import { QuantumState } from "./QuantumState";

export class QuantumCircuit {
    static client: QulacsNativeClassClient;
    qubit_count: number;
    gateQueues: QuantumGateBase[];

    constructor(qubit_count: number) {
        this.qubit_count = qubit_count;
        this.gateQueues = [];
    }

    update_quantum_state(state: QuantumState) {
        state._operatorQueues = state._operatorQueues.concat(translateGateQueuesToOperatorQueues(this.gateQueues));
    }

    add_gate(gate: QuantumGateBase) {
        this.gateQueues.push(gate);
    }

    add_X_gate(index: number) {
        this.gateQueues.push(new X(index));
    }

    add_Y_gate(index: number) {
        this.gateQueues.push(new Y(index));
    }

    add_Z_gate(index: number) {
        this.gateQueues.push(new Z(index));
    }

    add_H_gate(index: number) {
        this.gateQueues.push(new H(index));
    }

    add_T_gate(index: number) {
        this.gateQueues.push(new T(index));
    }

    add_S_gate(index: number) {
        this.gateQueues.push(new S(index));
    }

    add_CNOT_gate(control: number, index: number) {
        this.gateQueues.push(new CNOT(control, index));
    }
}

function translateGateQueuesToOperatorQueues(gates: QuantumGateBase[]): QuantumGateOperatorQueue[] {
    return gates.map(gate => {
        return {
            queueType: OperatorQueueType.Gate,
            queueData: gate
        };
    });
}
