import { QuantumState } from "../instance";
import { Complex } from "./common";

// QuantumStateBase
export type QuantumStateImpl = {
    new (qubit_count: number): QuantumStateImpl;
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
    load(stateOrArray: QuantumStateImpl | number[] | Complex[]): void;
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

export interface QuantumCircuitImpl {
    new (qubit_count: number): QuantumCircuitImpl;
    update_quantum_state(state: QuantumState, start_index?: number, end_index?: number): void;
    copy(): QuantumCircuitImpl;
    add_gate(gate: QuantumGateBase, index?: number): void;
    remove_gate(index: number): void;
    calculate_depth(): number;
    add_X_gate(target_index: number): void;
    add_Y_gate(target_index: number): void;
    add_Z_gate(target_index: number): void;
    add_H_gate(target_index: number): void;
    add_S_gate(target_index: number): void;
    add_Sdag_gate(target_index: number): void;
    add_T_gate(target_index: number): void;
    add_Tdag_gate(target_index: number): void;
    add_CNOT_gate(control_index: number, target_index: number): void;
    add_CZ_gate(control_index: number, target_index: number): void;
    add_SWAP_gate(target_index1: number, target_index2: number): void;
    add_RX_gate(target_index: number, angle: number): void;
    add_RY_gate(target_index: number, angle: number): void;
    add_RZ_gate(target_index: number, angle: number): void;
    add_RotInvX_gate(target_index: number, angle: number): void;
    add_RotInvY_gate(target_index: number, angle: number): void;
    add_RotInvZ_gate(target_index: number, angle: number): void;
    add_RotX_gate(target_index: number, angle: number): void;
    add_RotY_gate(target_index: number, angle: number): void;
    add_RotZ_gate(target_index: number, angle: number): void;
}

export interface ParametricQuantumCircuitImpl extends QuantumCircuitImpl {
    add_parametric_RX_gate(target_index: number, initial_angle: number): void;
    add_parametric_RY_gate(target_index: number, initial_angle: number): void;
    add_parametric_RZ_gate(target_index: number, initial_angle: number): void;
    copy(): ParametricQuantumCircuitImpl;
}

export interface DensityMatrixImpl extends QuantumStateImpl {
    load(stateOrArrayOrMatrix: QuantumStateImpl | number[] | Complex[] | number[][] | Complex[][]): void;
}

export interface QuantumGateBase {
    update_quantum_state(state: QuantumState): void;
}

export interface ClsOneQubitGate extends QuantumGateBase {
}

export interface ClsOneQubitRotationGate extends QuantumGateBase {

}

export interface ClsOneControlOneTargetGate extends QuantumGateBase {

}

export interface QuantumGateMatrix extends QuantumGateBase {

}
