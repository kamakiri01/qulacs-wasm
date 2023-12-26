import { Complex } from "./common";

export interface QuantumStateBase {}

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
    multiply_elementwise_function(function_ptr: (i: number) => Complex): void;
    get_classical_value(index: number): number;
    set_classical_value(index: number, val: number): void;
    to_string(): string;
    sampling(sampling_count: number, random_seed?: number): number[];
    get_vector(): Complex[];
    get_amplitude(index: number): Complex;
    get_qubit_count(): number;
    to_json(): string;
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
    to_json(): string;
}

export interface QuantumCircuitImpl {
    new (qubit_count: number): QuantumCircuitImpl;
    update_quantum_state(state: QuantumStateBase, start_index?: number, end_index?: number): void;
    to_string(): string;
    copy(): QuantumCircuitImpl;
    add_gate(gate: QuantumGateBase, index?: number): void;
    add_noise_gate(gate: QuantumGateBase, noise_type: string, noise_prob: number): void;
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
    add_multi_Pauli_gate(target_index_list: number, pauli_id_list: number): void;
    add_multi_Pauli_gate(pauli_operator: PauliOperatorImpl): void;
    add_multi_Pauli_rotation_gate(target_index_list: number[], pauli_id_list: number[], angle: number): void;
    add_multi_Pauli_rotation_gate(pauli_operator: PauliOperatorImpl): void;
    add_dense_matrix_gate(target_index: number | number[], matrix: number[][] | Complex[][]): void;
    add_random_unitary_gate(target_index_list: number[], seed?: number): void;
    add_diagonal_observable_rotation_gate(observable: Observable, angle: number): void;
    to_json(): string;
}

/**
 * NOTE: EMSCRIPTEN_BINDINGS側のParametricQuantumCircuitはQuantumCircuitをextendsしていない。
 * これはbase宣言によりoverloadTableを上書きしてしまうので、これを防ぐためである。
 * よって、継承関係を利用する場合、TS側とC++側の関係構造が異なる場合があることに留意。
 */
export interface ParametricQuantumCircuitImpl extends QuantumCircuitImpl {
    new (qubit_count: number): ParametricQuantumCircuitImpl;
    copy(): ParametricQuantumCircuitImpl;
    add_parametric_gate(gate: QuantumGate_SingleParameter, index?: number): void;
    add_parametric_RX_gate(target_index: number, initial_angle: number): void;
    add_parametric_RY_gate(target_index: number, initial_angle: number): void;
    add_parametric_RZ_gate(target_index: number, initial_angle: number): void;
    add_parametric_multi_Pauli_rotation_gate(target: number[], pauli_id: number[], initial_angle: number): void;
    get_parameter_count(): number;
    get_parameter(index: number): number;
    set_parameter(index: number, value: number): void;
    get_parametric_gate_position(index: number): number;
    backprop(obs: GeneralQuantumOperatorImpl): number[];
    backprop_inner_product(bistate: QuantumStateBase): number[];
    to_json(): string;
}

export interface QuantumGateBase {
    update_quantum_state(state: QuantumStateBase): void;
    to_string(): string;
    copy(): QuantumGateMatrix;
    get_matrix(): Complex[][];
    get_target_index_list(): number[];
    get_control_index_list(): number[];
    get_name(): string;
    is_commute(gate: QuantumGateBase): boolean;
    is_Pauli(): boolean;
    is_Clifford(): boolean;
    is_Gaussian(): boolean;
    is_parametric(): boolean;
    is_diagonal(): boolean;
    to_json(): string;
}

export interface ClsOneQubitGate extends QuantumGateBase {}
export interface ClsOneQubitRotationGate extends QuantumGateBase {}
export interface ClsOneControlOneTargetGate extends QuantumGateBase {}
export interface QuantumGate_SingleParameter extends QuantumGateBase {
    set_parameter_value(value: number): void;
    get_parameter_value(): number;
}
export interface QuantumGateMatrix extends QuantumGateBase {
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
export interface ClsNoisyEvolution_fast extends QuantumGateBase {}

export interface GeneralQuantumOperatorImpl {
    new (qubit_count: number): GeneralQuantumOperatorImpl;
    get_term_count(): number;
    get_qubit_count(): number;
    get_term(index: number): PauliOperatorImpl;
    is_hermitian(): boolean;
    apply_to_state(work_state: QuantumStateBase, state_to_be_multiplied: QuantumStateBase, dst_state: QuantumStateBase): void;
    get_transition_amplitude(state_bra: QuantumStateBase, state_ket: QuantumStateBase): Complex;
    add_operator(mpt: PauliOperatorImpl): void;
    add_operator(coef: number | Complex, pauli_string: string): void;
    add_operator(target_qubit_index_list: number[], target_qubit_pauli_list: number[], pauli_string: number | Complex): void;
    get_expectation_value(state: QuantumStateBase): Complex;
    to_json(): string;
}

export type HermitianQuantumOperatorImpl = GeneralQuantumOperatorImpl & {
    new (qubit_count: number): HermitianQuantumOperatorImpl;
}
export type Observable = HermitianQuantumOperatorImpl;

export interface PauliOperatorImpl {
    new (): PauliOperatorImpl;
    new (coef: number | Complex): PauliOperatorImpl;
    new (strings: string, coef: number | Complex): PauliOperatorImpl;
    add_single_Pauli(qubit_index: number, pauli_type: number): void;
    get_index_list(): number[];
    get_pauli_id_list(): number[];
    get_coef(): Complex;
    copy(): PauliOperatorImpl;
    change_coef(new_coef: number | Complex): void;
    get_pauli_string(): string;
    get_expectation_value(state: QuantumStateBase): Complex;
    get_transition_amplitude(state_bra: QuantumStateBase, state_ket: QuantumStateBase): Complex;
}

export interface QuantumCircuitOptimizerImpl {
    new (): QuantumCircuitOptimizerImpl;
    optimize(circuit: QuantumCircuitImpl, max_block_size?: number): void;
    optimize_light(circuit: QuantumCircuitImpl): void;
    merge_all(circuit: QuantumCircuitImpl): QuantumGateMatrix;   
}

export interface GradCalculatorImpl {
    new (): GradCalculatorImpl;
    calculate_grad(x: ParametricQuantumCircuitImpl, obs: Observable, theta?: number[]): Complex[];
}

export interface QuantumCircuitSimulatorImpl {
    new (circuit: QuantumCircuitImpl, initial_state?: QuantumStateBase): QuantumCircuitSimulatorImpl;
    initialize_state(computationl_basis: number): void;
    initialize_random_state(seed?: number): void;
    simulate(): void;
    simulate_range(start: number, end: number): void;
    get_expectation_value(observable: Observable): Complex;
    get_gate_count(): number;
    copy_state_to_buffer(): void;
    copy_state_from_buffer(): void;
    swap_state_and_buffer(): void;
}

export interface NoiseSimulatorImpl {
    new (circuit: QuantumCircuitImpl, initial_state?: QuantumStateBase): NoiseSimulatorImpl;
    execute(sample_count: number): number[];
}

export interface CausalConeSimulatorImpl {
    new (_init_circuit: ParametricQuantumCircuitImpl, _init_observable: Observable): CausalConeSimulatorImpl;
    build(): void;
    get_expectation_value(): Complex;
    get_circuit_list(): ParametricQuantumCircuitImpl[][];
    get_pauli_operator_list: PauliOperatorImpl[][];
    get_coef_list: Complex[];
}
