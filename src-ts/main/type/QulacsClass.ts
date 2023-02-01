import { QuantumState } from "../instance";

export interface QuantumGateBase {
    update_quantum_state(state: QuantumState): void;
}

export interface ClsOneQubitGate extends QuantumGateBase {
}

export interface ClsOneQubitRotationGate extends QuantumGateBase {

}

export interface ClsOneControlOneTargetGate extends QuantumGateBase {

}