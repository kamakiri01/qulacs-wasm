import { QuantumState } from "../instance";
import { Complex } from "./common";

export type QuantumStateImpl = {
    set_zero_state(): void;
    set_Haar_random_state(seed?: number): void;
    set_computational_basis(comp_basis: number): void;
    get_zero_probability(target_qubit_index: number): void;
    get_marginal_probability(measured_values: number[]): void;
    get_entropy(): number;
    get_squared_norm(): number;
    normalize(squared_norm: number): void;
    allocate_buffer(): QuantumStateImpl;
    copy(): QuantumStateImpl;
    load(state: QuantumStateImpl): void;
    get_device_name(): string;
    add_state(state: QuantumStateImpl): void;
    multiply_coef(coef: Complex): void;
    // multiply_elementwise_function(): void;
    get_classical_value(index: number): number;
    set_classical_value(index: number, val: number): void;
    to_string(): string;
    sampling(): number[];
    get_vector(): Complex[];
};

export interface QuantumGateBase {
    update_quantum_state(state: QuantumState): void;
}

export interface QuantumCircuitImpl {
    update_quantum_state(state: QuantumState): void;
}

export interface ParametricQuantumCircuitImpl extends QuantumCircuitImpl {
    add_parametric_RX_gate(target_index: number, initial_angle: number): void;
}

export interface DensityMatrixImpl {
    set_zero_state(): void;
}

export interface ClsOneQubitGate extends QuantumGateBase {
}

export interface ClsOneQubitRotationGate extends QuantumGateBase {

}

export interface ClsOneControlOneTargetGate extends QuantumGateBase {

}

export interface QuantumGateMatrix extends QuantumGateBase {

}
