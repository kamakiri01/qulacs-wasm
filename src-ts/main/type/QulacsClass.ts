import { QuantumState } from "../instance";
import { Complex } from "./common";

export interface QuantumStateBase {};

export type QuantumStateImpl = QuantumStateBase & {
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
    load(stateOrArray: QuantumStateBase | number[] | Complex[]): void;
    get_device_name(): string;
    add_state(state: QuantumStateImpl): void;
    multiply_coef(coef: number | Complex): void;
    // multiply_elementwise_function(): void;
    get_classical_value(index: number): number;
    set_classical_value(index: number, val: number): void;
    to_string(): string;
    sampling(sampling_count: number, random_seed?: number): number[];
    get_vector(): Complex[];
    get_amplitude(): Complex;
    get_qubit_count(): number;
};

export type DensityMatrixImpl = QuantumStateBase & {
    new (qubit_count: number): DensityMatrixImpl;
    set_zero_state(): void;
    set_Haar_random_state(seed?: number): void;
    set_computational_basis(comp_basis: number): void;
    get_zero_probability(target_qubit_index: number): void;
    get_marginal_probability(measured_values: number[]): void;
    get_qubit_count(): number;
    get_entropy(): number;
    get_squared_norm(): number;
    normalize(squared_norm: number): void;
    allocate_buffer(): DensityMatrixImpl;
    copy(): DensityMatrixImpl;
    load(stateOrArrayOrMatrix: QuantumStateBase | number[] | Complex[] | number[][] | Complex[][]): void;
    get_device_name(): string;
    add_state(state: QuantumStateBase): void;
    multiply_coef(coef: number | Complex): void;
    // multiply_elementwise_function(): void;
    get_classical_value(index: number): number;
    set_classical_value(index: number, val: number): void;
    to_string(): string;
    sampling(sampling_count: number, random_seed?: number): number[];
    get_matrix(): Complex[][];
}

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

export interface QuantumGateBase {
    update_quantum_state(state: QuantumState): void;
    get_matrix(): Complex[][];
}

export interface ClsOneQubitGate extends QuantumGateBase {}
export interface ClsOneQubitRotationGate extends QuantumGateBase {}
export interface ClsOneControlOneTargetGate extends QuantumGateBase {}
export interface QuantumGateMatrix extends QuantumGateBase {
    to_string(): string;
    copy(): QuantumGateMatrix;
    multiply_scalar: (value: number | Complex) => void;
    add_control_qubit: (qubit_index: number, control_value: number) => void;
}
export interface QuantumGateSparseMatrix extends QuantumGateBase {}
export interface QuantumGateDiagonalMatrix extends QuantumGateBase {}
export interface ClsReversibleBooleanGate extends QuantumGateBase {}
export interface ClsStateReflectionGate extends QuantumGateBase {}
export interface QuantumGate_Probabilistic extends QuantumGateBase {}
export interface QuantumGate_CPTP extends QuantumGateBase {}
export interface QuantumGate_Probabilistic extends QuantumGateBase {}
export type QuantumGate_ProbabilisticInstrument = QuantumGate_Probabilistic;
export type QuantumGate_Instrument = QuantumGate_CPTP;
export interface ClsNoisyEvolution_fast extends QuantumGateBase {};

export interface GeneralQuantumOperatorImpl {
    new (qubit_count: number): GeneralQuantumOperatorImpl;
    add_operator(coef: number | Complex, pauli_string: string): void;
    add_operator(target_qubit_index_list: number[], target_qubit_pauli_list: number[], pauli_string: number | Complex): void;
    get_expectation_value(state: QuantumStateBase): Complex;
};

export type HermitianQuantumOperatorImpl = GeneralQuantumOperatorImpl & {}
export type Observable = HermitianQuantumOperatorImpl;

export interface PauliOperatorImpl {
    new (): PauliOperatorImpl;
    new (coef: number | Complex): PauliOperatorImpl;
    new (strings: string, coef: number): PauliOperatorImpl;
    add_single_Pauli(qubit_index: number, pauli_type: number): void;
    get_index_list(): number[];
    get_pauli_id_list(): number[];
    get_coef(): Complex;
    copy(): PauliOperatorImpl;
    change_coef(new_coef: Complex): void;
    get_pauli_string(): string;
    get_expectation_value(state: QuantumStateBase): Complex;
    get_transition_amplitude(state_bra: QuantumStateBase, state_ket: QuantumStateBase): Complex;
};
