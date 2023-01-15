import { QulacsNativeClassClient } from "../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { CNOT, CZ } from "./QuantumGate/OneControlOneTargetGate";
import { QuantumState } from "./QuantumState";
import { translateGateQueuesToOperatorQueue } from "../util/toWasmUtil";
import { QuantumGateBase } from "./QuantumGate/QuantumGateBase";
import { X, Y, Z, H, T, S, RX, RY, RZ, RotX, RotY, RotZ } from "./QuantumGate/QuantumGate";

export class QuantumCircuit {
    static client: QulacsNativeClassClient;
    qubit_count: number;
    gateQueues: QuantumGateBase[];

    constructor(qubit_count: number) {
        this.qubit_count = qubit_count;
        this.gateQueues = [];
    }

    update_quantum_state(state: QuantumState) {
        state._operatorQueues = state._operatorQueues.concat(this.gateQueues.map(translateGateQueuesToOperatorQueue));
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

    add_RX_gate(index: number, angle: number) {
        this.gateQueues.push(new RX(index, angle));
    }

    add_RY_gate(index: number, angle: number) {
        this.gateQueues.push(new RY(index, angle));
    }

    add_RZ_gate(index: number, angle: number) {
        this.gateQueues.push(new RZ(index, angle));
    }

    add_RotX_gate(index: number, angle: number) {
        this.gateQueues.push(new RotX(index, angle));
    }

    add_RotY_gate(index: number, angle: number) {
        this.gateQueues.push(new RotY(index, angle));
    }

    add_RotZ_gate(index: number, angle: number) {
        this.gateQueues.push(new RotZ(index, angle));
    }

    add_CNOT_gate(control: number, index: number) {
        this.gateQueues.push(new CNOT(control, index));
    }

    add_CZ_gate(control: number, index: number) {
        this.gateQueues.push(new CZ(control, index));
    }
}
