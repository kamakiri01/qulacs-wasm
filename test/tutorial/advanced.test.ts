import { CMath, Complex, initQulacs, QuantumState } from "../../lib/bundle";
import { round4, round4Complex, round4ComplexMatrix } from "../hepler/util";

describe("Qulacs Advanced Guide", () => {
    let q;
    beforeEach(async () => {
        await initQulacs();
    });

    describe("QuantumState class", () => {
        it("Create and Destroy", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const n = 2;
            const state = new QuantumState(n);
            expect(state.to_string()).not.toBeUndefined();
        });

        it("Transform between array", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const state = new QuantumState(2);
            state.load([0, 1, 2, 3]);
            expect(state.get_vector()).toEqual([
                {real: 0, imag: 0},
                {real: 1, imag: 0},
                {real: 2, imag: 0},
                {real: 3, imag: 0},
            ]);
            expect(state.get_amplitude(3)).toEqual({real: 3, imag: 0});
        });

        it("Copy", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const initial_state = new QuantumState(3);
            const buffer = initial_state .allocate_buffer();
            for (let i = 0;i < 10; i++) {
                buffer.set_Haar_random_state();
                buffer.load(initial_state);
                // some computation and get results
                expect(initial_state.get_vector()).toEqual(buffer.get_vector());
            }
        });

        it("Store quantum state", async () => {
        });

        it("Initialization of quantum state", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const n = 3;
            const state = new QuantumState(n);
            // Initialize as |0> state
            state.set_zero_state();
            expect(state.get_vector()).toEqual([
                {real: 1, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
            ]);

            // Initialize the specified value to the calculation base in binary notation
            state.set_computational_basis(0b101);
            expect(state.get_vector()).toEqual([
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 1, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
            ]);

            // Initialize to random pure state with Haar measure using argument value as seed
            // If no value is specified, the time function is used as a seed. Pseudo random number uses xorshift.
            // NOTE: set_Haar_random_stateはseedが固定でもqulacsバージョンや動作環境によって結果は一意とは保証されず、実装依存である
            state.set_Haar_random_state(0);
            expect(state.get_vector()).toEqual([
                {
                    "imag": -0.3991580676973766,
                    "real": 0.3285365339385453,
                },
                {
                    "imag": 0.10490963680782449,
                    "real": 0.09548989118017889,
                },
                {
                    "imag": 0.25911411674718726,
                    "real": -0.27853247603515763,
                },
                {
                    "imag": 0.2508423016086916,
                    "real": -0.17026322699583063,
                },
                {
                    "imag": -0.24372941890871075,
                    "real": 0.48907802065924627,
                },
                {
                    "imag": 0.19038955019035428,
                    "real": 0.05927692487604381,
                },
                {
                    "imag": -0.06384567684752364,
                    "real": -0.24445110608496284,
                },
                {
                    "imag": 0.26312007639361706,
                    "real": 0.06747055877943083,
                },
            ]);
        });
        it("Check", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const n = 5;
            const state = new QuantumState(n);
            state.set_Haar_random_state(0);
            // Get quantum bit numbers
            expect(state.get_qubit_count()).toBe(n);
            // Get the probability that the specified qubit will be measured as 0
            expect(state.get_zero_probability(1)).toBe(0.5445520462375112);
            // Get arbitrary marginal probabilities
            // Argument is an array of the same length as the number of qubits
            // Specify 0,1,2. 0,1 is the probability of the subscript measured at that value
            // 2 means that bit is peripheralized.
            // For example, calculation of the probability that the third is measured as 0 and the 0th is measured as 1:
            expect(state.get_marginal_probability([1,2,2,0,2])).toBe(0.13406608083256927);
            // Get the entropy of the probability distribution when measured on the Z basis
            expect(state.get_entropy()).toBe(3.085681210868282);
            // Get squared norm (<a|a>)
            // Because the operation may not be Trace preserving, the norm of state does not necessarily to be 1.
            expect(state.get_squared_norm()).toBe(1);
            // Measure and sample all the qubits on Z-basis as many times as given by the argument.
            // Returns a list of integers converted from the resulting binaries.
            state.sampling(10);
            // You can supply a random seed as second argument.
            // If the same seed is given, always returns the same sampling result.
            expect(state.sampling(10, 314.0)).toEqual([23, 17, 24, 11, 14, 28, 3, 15, 14, 4]);
            // Get a character string indicating whether the state vector is on CPU or GPU
            expect(state.get_device_name()).toBe("cpu");
        });
        it("Deformation", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const state = new QuantumState(2);
            state.set_computational_basis(0);
            const buffer = new QuantumState(2);
            buffer.set_computational_basis(2);
            expect(state.get_vector()).toEqual([
                {real: 1, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},  
            ]);
            expect(buffer.get_vector()).toEqual([
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 1, imag: 0},
                {real: 0, imag: 0},  
            ]);
            // Sum of quantum state (state <- state+buffer)
            // Add the buffer state to the state to create a superposition state.
            // The norm after the operation generally is not 1.
            state.add_state(buffer);
            expect(state.get_vector()).toEqual([
                {real: 1, imag: 0},
                {real: 0, imag: 0},
                {real: 1, imag: 0},
                {real: 0, imag: 0},  
            ]);
            // Product of quantum state and complex number
            // Multiplies all elements by the complex number of the argument.
            // The norm after operation generally is not 1.
            state.multiply_coef({ real: 0.5, imag: 0.1 });
            state.multiply_coef(1);
            expect(state.get_vector()).toEqual([
                {real: 0.5, imag: 0.1},
                {real: 0, imag: 0},
                {real: 0.5, imag: 0.1},
                {real: 0, imag: 0},  
            ]);
            // Pruduct of a quantum state and complex numbers specified by an index of each element
            // Multiplies the amplitude of |00> by `coef_func(0)`, the amplitude of |01> by `coef_func(1)`.
            // The norm after operation generally is not 1.
            const coef_func = (i: number): Complex => {
                switch (i) {
                    case 0: return {real: 1, imag: 0};
                    case 1: return {real: 0, imag: 1};
                    case 2: return {real: -1, imag: 0};
                    case 3: return {real: -0, imag: -1};
                }
                throw new Error("Asset Error");
            };
            state.multiply_elementwise_function(coef_func);
            expect(state.get_vector()).toEqual([
                { real: 0.5, imag: 0.1 },
                { real: 0, imag: 0 },
                { real: -0.5, imag: -0.1 },
                { real: 0, imag: -0 }
            ]);

            // Normalize quantum states
            // Provide the current squared norm as an argument.
            const squared_norm = state.get_squared_norm();
            expect(squared_norm).toBe(0.52);
            state.normalize(squared_norm);
            expect(state.get_vector()).toEqual([
                { real: 0.6933752452815364, imag: 0.1386750490563073 },
                { real: 0, imag: 0 },
                { real: -0.6933752452815364, imag: -0.1386750490563073 },
                { real: 0, imag: -0 }
            ]);
            expect(state.get_squared_norm()).toBe(0.9999999999999998);
        });

        it("Opetation on Classical registers", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const state = new QuantumState(3);
            const position = 0;
            const value = 20;
            // Write the value to `position`-th register
            state.set_classical_value(position, value);
            // Get the value of the `position`-th register
            const obtained = state.get_classical_value(position);
            expect(obtained).toEqual(value);
        });

        it("Calculation between quantum states", async () => {
            const { QuantumState, inner_product, tensor_product } = await import("../../lib/bundle");
            const n = 5;
            const state_bra = new QuantumState(n);
            const state_ket = new QuantumState(n);
            state_bra.set_Haar_random_state(1);
            state_ket.set_computational_basis(0);

            // Calculation of inner product
            const value = inner_product(state_bra, state_ket);
            expect(value).toEqual({ real: 0.15765739459521372, imag: 0.07018524636200694 });

            const n1 = 1
            const state_ket1 = new QuantumState(n1);
            state_ket1.set_computational_basis(1);
            const n2 = 2;
            const state_ket2 = new QuantumState(n2);
            state_ket2.set_computational_basis(2);

            // Calculation of tensor product
            expect(tensor_product(state_ket1, state_ket2).get_vector()).toEqual([
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 1, imag: 0},
                {real: 0, imag: 0},
            ]);
        });

        it("Swap and delete qubits", async () => {
            const { QuantumState, permutate_qubit, drop_qubit } = await import("../../lib/bundle");
            const n = 3;
            const state = new QuantumState(n);
            state.set_Haar_random_state(1);
            expect(state.get_vector()).toEqual([
                { real: 0.30385888914418613, imag: -0.1352706040121121 },
                { real: 0.10818205843949354, imag: -0.0499035706092407 },
                { real: 0.059044991052511896, imag: 0.0183033846365273 },
                { real: -0.1601275112792203, imag: 0.004463466887972794 },
                { real: -0.10910033108861181, imag: -0.4319005729971607 },
                { real: 0.138922433172912, imag: 0.0064107920119231806 },
                { real: 0.09613403820183443, imag: -0.2335702345816399 },
                { real: -0.5734159974719932, imag: -0.48508927627363974 }
            ]);
            // new qubit 0 is old qubit 1
            // new qubit 1 is old qubit 2,
            // new qubit 2 is old qubit 0,
            const permutate = permutate_qubit(state, [1, 2, 0]);
            expect(permutate.get_vector()).toEqual([
                { real: 0.30385888914418613, imag: -0.1352706040121121 },
                { real: 0.059044991052511896, imag: 0.0183033846365273 },
                { real: -0.10910033108861181, imag: -0.4319005729971607 },
                { real: 0.09613403820183443, imag: -0.2335702345816399 },
                { real: 0.10818205843949354, imag: -0.0499035706092407 },
                { real: -0.1601275112792203, imag: 0.004463466887972794 },
                { real: 0.138922433172912, imag: 0.0064107920119231806 },
                { real: -0.5734159974719932, imag: -0.48508927627363974 }
            ]);
            state.set_Haar_random_state(1);
            const state0 = drop_qubit(state, [1], [0]);
            expect(state0.get_vector()).toEqual([ // projection: qubit 1 is 0
                { real: 0.30385888914418613, imag: -0.1352706040121121 },
                { real: 0.10818205843949354, imag: -0.0499035706092407 },
                { real: -0.10910033108861181, imag: -0.4319005729971607 },
                { real: 0.138922433172912, imag: 0.0064107920119231806 }
            ]);
            const state1 = drop_qubit(state, [1], [1]);
            expect(state1.get_vector()).toEqual([ // projection: qubit 1 is 1
                { real: 0.059044991052511896, imag: 0.0183033846365273 },
                { real: -0.1601275112792203, imag: 0.004463466887972794 },
                { real: 0.09613403820183443, imag: -0.2335702345816399 },
                { real: -0.5734159974719932, imag: -0.48508927627363974 }
            ]); 
        });

        it("Calculate partial trace", async () => {
            const { QuantumState, DensityMatrix, partial_trace, H, X } = await import("../../lib/bundle");
            const state = new QuantumState(3);
            state.set_computational_basis(0);
            H(0).update_quantum_state(state);
            X(1).update_quantum_state(state);
            expect(state.get_vector()).toEqual([
                { real: 0, imag: 0 },
                { real: 0, imag: 0 },
                { real: 0.7071067811865475, imag: 0 },
                { real: 0.7071067811865475, imag: 0 },
                { real: 0, imag: 0 },
                { real: 0, imag: 0 },
                { real: 0, imag: 0 },
                { real: 0, imag: 0 }
            ]);
            const trace = partial_trace(state, [1]);
            expect(round4ComplexMatrix(trace.get_matrix())).toEqual([
                [
                    { real: 0.5, imag: 0 },
                    { real: 0.5, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 0, imag: 0 }
                  ],
                  [
                    { real: 0.5, imag: 0 },
                    { real: 0.5, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 0, imag: 0 }
                  ],
                  [
                    { real: 0, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 0, imag: 0 }
                  ],
                  [
                    { real: 0, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 0, imag: 0 }
                  ]
            ]);
        });
    });

    describe("DensityMatrix class", () => {
        it("Generate and delete", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const n = 2;
            const state = new DensityMatrix(n);
            expect(state.to_string()).not.toBeUndefined();
        });

        it("Conversion between matrix", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const state = new DensityMatrix(2);
            expect(state.get_matrix()).toEqual([
                [
                    {real: 1, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],  
            ]);
            state.load([0,1,2,3]);
            expect(state.get_matrix()).toEqual([
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 1, imag: 0},
                    {real: 2, imag: 0},
                    {real: 3, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 2, imag: 0},
                    {real: 4, imag: 0},
                    {real: 6, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 3, imag: 0},
                    {real: 6, imag: 0},
                    {real: 9, imag: 0},
                ],  
            ]);
            state.load([[0,1,2,3], [1,2,3,4], [2,3,4,5], [3,4,5,6]]);
            expect(state.get_matrix()).toEqual([
                [
                    {real: 0, imag: 0},
                    {real: 1, imag: 0},
                    {real: 2, imag: 0},
                    {real: 3, imag: 0},
                ],
                [
                    {real: 1, imag: 0},
                    {real: 2, imag: 0},
                    {real: 3, imag: 0},
                    {real: 4, imag: 0},
                ],
                [
                    {real: 2, imag: 0},
                    {real: 3, imag: 0},
                    {real: 4, imag: 0},
                    {real: 5, imag: 0},
                ],
                [
                    {real: 3, imag: 0},
                    {real: 4, imag: 0},
                    {real: 5, imag: 0},
                    {real: 6, imag: 0},
                ],  
            ]);
        });

        it("Copy", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const initial_state = new DensityMatrix(3);
            initial_state.set_computational_basis(1);
            // NOTE: copy実行時、 (node:40164) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 uncaughtException listeners added to [process]. Use emitter.setMaxListeners() to increase limit(Use `node --trace-warnings ...` to show where the warning was created) を出す
            const copied_state = initial_state.copy();
            expect(initial_state.get_matrix()).toEqual(copied_state.get_matrix());
            const buffer = initial_state.allocate_buffer();
            expect(buffer.get_matrix()).toEqual((new DensityMatrix(3)).get_matrix());
            buffer.load(initial_state);
            expect(buffer.get_matrix()).toEqual(initial_state.get_matrix());
        });

        it("Store to JSON and restore", async () => {
            // TODO
        });

        it("Initialize quantum states", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const n = 2;
            const state = new DensityMatrix(n);
            // Initialize as |0> state.
            state.set_zero_state()
            expect(state.get_matrix()).toEqual([
                [
                    {real: 1, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],  
            ]);
            // Initialize as computational basis specified in binary format.
            state.set_computational_basis(0b10);
            expect(state.get_matrix()).toEqual([
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 1, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],  
            ]);
            const state1 = new DensityMatrix(1);

            //Initialize as a random pure state in Haar measure with the seed given as an argument.
            // If you do not give the seed, `time` function is used for seed.
            // Xorshift is used for psuedo random.
            state1.set_Haar_random_state(0);
            expect(state1.get_matrix()).toEqual([
                [
                    { real: 0.9299749208949191, imag: 0 },
                    { real: -0.03654856327649271, imag: -0.25255844852990395 }
                ],
                [
                    { real: -0.03654856327649271, imag: 0.25255844852990395 },
                    { real: 0.07002507910508077, imag: 0 }
                ]
            ]);
        });
        it("Check quantum states", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const n = 5;
            const state = new DensityMatrix(n);
            state.set_Haar_random_state(0);

            // Get quantum bit numbers
            expect(state.get_qubit_count()).toBe(n);

            // Get the probability that the specified qubit will be measured as 0
            expect(state.get_zero_probability(1)).toBe(0.5445520462375112);

            // Get arbitrary marginal probabilities
            // Argument is an array of the same length as the number of qubits
            // Specify 0,1,2. 0,1 is the probability of the subscript measured at that value
            // 2 means that bit is peripheralized.
            // For example, calculation of the probability that the third is measured as 0 and the 0th is measured as 1:
            expect(state.get_marginal_probability([1,2,2,0,2])).toEqual(0.1340660808325693);
            // Get the entropy of the probability distribution when measured on the Z basis
            expect(state.get_entropy()).toBe(3.085681210868283);
            // Get squared norm (<a|a>)
            // Because the operation may not be Trace preserving, the norm of state does not necessarily to be 1.
            expect(state.get_squared_norm()).toBe(1);
            state.set_zero_state();
            // Measure and sample all the qubits on Z-basis as many times as given by the argument.
            // Returns a list of integers converted from the resulting binaries.
            expect(state.sampling(10).length).toBe(10);
            // You can supply a random seed as second argument.
            // If the same seed is given, always returns the same sampling result.
            expect(state.sampling(10, 314)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            // Get a character string indicating whether the state vector is on CPU or GPU
            expect(state.get_device_name()).toBe("cpu");
        });

        it("Deformation of quantum states", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const state = new DensityMatrix(2);
            state.set_computational_basis(0);
            const buffer = new DensityMatrix(2);
            buffer.set_computational_basis(2);
            // Sum of quantum state (state <- state+buffer)
            // Add the buffer state to the state to create a superposition state.
            // The norm after the operation generally is not 1.
            state.add_state(buffer);
            expect(state.get_matrix()).toEqual([
                [
                    {real: 1, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 1, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],  
            ]);
            // Product of quantum state and complex number
            // Multiplies all elements by the complex number of the argument.
            // The norm after operation generally is not 1.
            const coef = 3.0;
            state.multiply_coef(coef);
            state.multiply_coef({real: 1, imag:0});
            expect(state.get_matrix()).toEqual([
                [
                    {real: 3, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 3, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],  
            ]);

            // Normalize quantum states
            // Provide the current squared norm as an argument.
            expect(state.get_squared_norm()).toBe(6);
            state.normalize(state.get_squared_norm());
            expect(state.get_matrix()).toEqual([
                [
                    {real: 0.5, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0.5, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],  
            ]);
           expect(state.get_squared_norm()).toBe(1);
        });

        it("Operation on classical registers", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const state = new DensityMatrix(3);
            const position = 0;
            const value = 20;
            // Set the value at `position`-th register.
            state.set_classical_value(position, value);
            // Get the value at `position`-th register.
            const obtained = state.get_classical_value(position);
            expect(obtained).toEqual(value);
        });

        it("Creating superposition states and mixture states", async () => {
            const { QuantumState, DensityMatrix, make_superposition, make_mixture } = await import("../../lib/bundle");
            // from QuantumState |a> and |b>, create a superposition state p|a> + q|b>
            let a = new QuantumState(2);
            a.set_computational_basis(0b00);
            const b = new QuantumState(2);
            b.set_computational_basis(0b11);
            let p = 1 / 2;
            let q = 1 / 2;
            const c = make_superposition(p, a, p, b);
            expect(c.get_vector()).toEqual([
                {real: 0.5, imag: 0},
                {real: 0, imag: 0},
                {real: 0, imag: 0},
                {real: 0.5, imag: 0},
            ]);

            // from QuantumState |a> and DensityMatrix |b><b|, create a mixture state p|a><a| + q|b><b|
            // You can also create a mixture states from two QuantumState or two DensitMatrix
            a = new QuantumState(2);
            a.set_computational_basis(0b00);
            const b2 = new DensityMatrix(2);
            b2.set_computational_basis(0b11);
            p = 1 / 2;
            q = 1 / 2;
            const c2 = make_mixture(p, a, q, b2);
            expect(c2.get_matrix()).toEqual([
                [
                    {real: 0.5, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                ],
                [
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0, imag: 0},
                    {real: 0.5, imag: 0},
                ],  
            ]);
        });
    });

    describe("QuantumGate class", () => {
        it("Common operations", async () => {
            const { X } = await import("../../lib/bundle");
            const gate = X(2);
            expect(gate.get_matrix()).toEqual([
                [{real: 0, imag: 0}, {real: 1, imag: 0}],
                [{real: 1, imag: 0 }, {real: 0, imag: 0}]
            ]);
            expect(gate.to_string()).not.toBeUndefined();
        });

        it("Convert to/from JSON ", async () => {
            // TODO
        });

        describe("Special gate", () => {
            it("1 qubit gate", async () => {
                const {
                    Identity, // Identity matrix
                    X, Y, Z, // Pauli
                    H, S, Sdag, sqrtX, sqrtXdag, sqrtY, sqrtYdag, // Clifford
                    T, Tdag, // T gate
                    P0, P1 // Projection to 0,1 (not normalized)
                } = await import("../../lib/bundle");
                const target = 3;
                const gate = T(0);
                expect(gate.get_matrix()).toEqual([
                    [{real: 1, imag: 0}, {real: 0, imag: 0}],
                    [{real: 0, imag: 0 }, {real: 0.7071067811865475, imag: 0.7071067811865475}]
                ]);
            });

            it("single qubit rotating gate", async () => {
                const { RX, RY, RZ } = await import("../../lib/bundle");
                const target = 0;
                const angle = 0.1;
                const gate = RX(target, angle);
                expect(gate.get_matrix()).toEqual([
                    [{real: 0.9987502603949663, imag: 0}, {real: 0, imag: 0.04997916927067833}],
                    [{real: 0, imag: 0.04997916927067833}, {real: 0.9987502603949663, imag: 0}]
                ]);
            });

            it("IBMQ basis gate", async () => {
                const { U1, U2, U3 } = await import("../../lib/bundle");
                const gate = U3(0, 0.1, 0.2, 0.3);
                expect(gate.get_matrix()).toEqual([
                    [{real: 0.9987502603949663, imag: 0}, {real: 0.04898291339046185, imag: 0.009929328112698753}],
                    [{real: -0.04774692410046421, imag: -0.014769854431632931}, {real: 0.8764858122060915, imag: 0.4788263815209447}]
                ]);
            });

            it("2 qubit gate", async () => {
                const { CNOT, CZ, SWAP } = await import("../../lib/bundle");
                const control = 5;
                const target = 2;
                const target2 = 3;
                let gate = CNOT(control, target);
                expect(gate.get_matrix()).toEqual([
                    [{real: 0, imag: 0}, {real: 1, imag: 0}],
                    [{real: 1, imag: 0 }, {real: 0, imag: 0}]
                ]);
                gate = CZ(control, target);
                expect(gate.get_matrix()).toEqual([
                    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
                    [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
                ]);
                gate = SWAP(target, target2);
                expect(gate.get_matrix()).toEqual([
                    [
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                    ],
                    [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 }
                    ],
                    [
                        { real: 0, imag: 0 },
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                    ],
                    [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 1, imag: 0 }
                    ]
                ]);
            });

            it("Multi-bit Pauli operation", async () => {
                const { Pauli } = await import("../../lib/bundle");
                const target_list = [0, 3, 5];
                const pauli_index = [1, 3, 1]; // 1:X , 2:Y, 3:Z
                const gate = Pauli(target_list, pauli_index); // = X_0 Z_3 X_5
                expect(gate.to_string()).not.toBeUndefined();
                expect(gate.get_matrix()).toEqual([
                    [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                    ],
                    [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                    ],
                    [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: -1, imag: -0 }
                    ],
                    [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: -1, imag: -0 },
                        { real: 0, imag: 0 }
                    ],
                    [
                        { real: 0, imag: 0 },
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                    ],
                    [
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                    ],
                    [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: -1, imag: -0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                    ],
                    [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: -1, imag: -0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                    ]
                ]);
            });

            it("Multi-bit Pauli rotating operation", async () => {
                const { PauliRotation } = await import("../../lib/bundle");
                const target_list = [0, 3, 5];
                const pauli_index = [1, 3, 1]; // 1:X , 2:Y, 3:Z
                const angle = 0.5;
                const gate = PauliRotation(target_list, pauli_index, angle); // = exp(i angle/2 X_0 Z_3 X_5)
                expect(gate.to_string()).not.toBeUndefined();
            });

            it("Reversible circuit", async () => {
                const { ReversibleBoolean, QuantumState } = await import("../../lib/bundle");
                const upper = (val: number, dim: number) => (val + 1) % dim;
                const target_list = [0, 1];
                const gate = ReversibleBoolean(target_list, upper);
                const state = new QuantumState(3);
                state.load(new Array(2**3).fill(0).map((_, i) => i));
                expect(state.get_vector()).toEqual([
                    { real: 0, imag: 0 },
                    { real: 1, imag: 0 },
                    { real: 2, imag: 0 },
                    { real: 3, imag: 0 },
                    { real: 4, imag: 0 },
                    { real: 5, imag: 0 },
                    { real: 6, imag: 0 },
                    { real: 7, imag: 0 }
                ]);
                gate.update_quantum_state(state);
                expect(state.get_vector()).toEqual([
                    { real: 3, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 1, imag: 0 },
                    { real: 2, imag: 0 },
                    { real: 7, imag: 0 },
                    { real: 4, imag: 0 },
                    { real: 5, imag: 0 },
                    { real: 6, imag: 0 }
                ]);
            });

            it("Reflecting", async () => {
                const { StateReflection, QuantumState } = await import("../../lib/bundle");
                const axis = new QuantumState(2);
                axis.set_Haar_random_state(0);
                const state = new QuantumState(2);
                const gate = StateReflection(axis);
                gate.update_quantum_state(state);
                expect(axis.get_vector()).toEqual([
                    { real: 0.45384742965947295, imag: -0.5514055343573533 },
                    { real: 0.1319117881687203, imag: 0.14492442724998816 },
                    { real: -0.38477074926738897, imag: 0.3579458103621225 },
                    { real: -0.23520528146814743, imag: 0.3465189471325773 }
                ]);
                expect(state.get_vector()).toEqual([
                    { real: 0.020051105456857066, imag: 0 },
                    { real: -0.04008861049410903, imag: 0.27702093769097125 },
                    { real: -0.7440010327937121, imag: -0.09942386922927482 },
                    { real: -0.5956395552904756, imag: 0.05514647914562293 }
                  ]);
                gate.update_quantum_state(state);;
                expect(state.get_vector().map(c => {
                    return {
                        real: round4(c.real),
                        imag: round4(c.imag)
                    };
                })).toEqual([
                    { real: 1, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 0, imag: 0 }
                  ]);
            });
        });

        describe("General gates", () => {
            it("Dense Matrix", async () => {
                const { DenseMatrix } = await import("../../lib/bundle");
                // 1-qubit gate
                let gate = DenseMatrix(0, [[0, 1],[1, 0]]);
                expect(gate.get_matrix()).toEqual([
                    [ {real: 0, imag: 0}, {real: 1, imag: 0} ],
                    [ {real: 1, imag: 0}, {real: 0, imag: 0} ]
                ]);

                // 2-qubit gate
                gate = DenseMatrix([0, 1], [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 1],
                    [0, 0, 1, 0]
                ]);
                expect(gate.get_matrix()).toEqual([
                    [
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                      ],
                      [
                        { real: 0, imag: 0 },
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                      ],
                      [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 1, imag: 0 }
                      ],
                      [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 }
                      ]
                ]);
            });

            it("Sparse Matrix", async () => {
                const { SparseMatrix } = await import("../../lib/bundle");
                const mat = [
                    [0, 0],
                    [0, 1]
                ];
                const gate = SparseMatrix([0], mat);
                expect(gate.get_matrix()).toEqual([
                    [ { real: 0, imag: 0 }, { real: 0, imag: 0 } ],
                    [ { real: 0, imag: 0 }, { real: 1, imag: 0 } ]
                ]);
                const qs = new QuantumState(2);
                qs.load([1, 2, 3, 4]);
                gate.update_quantum_state(qs);
                expect(qs.get_vector()).toEqual([
                    { real: 0, imag: 0 },
                    { real: 2, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 4, imag: 0 }
                ]);
            });

            it("Add control bit", async () => {
                const { to_matrix_gate, X } = await import("../../lib/bundle");
                const index = 0;
                const x_gate = X(index);
                const x_mat_gate = to_matrix_gate(x_gate);
                // Operate only when 1st-qubit is 0
                const control_index = 1;
                const control_with_value = 0;
                x_mat_gate.add_control_qubit(control_index, control_with_value);
                expect(x_mat_gate.get_matrix()).toEqual([
                    [ { real: 0, imag: 0 }, { real: 1, imag: 0 } ],
                    [ { real: 1, imag: 0 }, { real: 0, imag: 0 } ]
                ]);

                const state = new QuantumState(3);
                state.load(new Array(2**3).fill(0).map((_, i) => i));
                expect(state.get_vector()).toEqual([
                    { real: 0, imag: 0 },
                    { real: 1, imag: 0 },
                    { real: 2, imag: 0 },
                    { real: 3, imag: 0 },
                    { real: 4, imag: 0 },
                    { real: 5, imag: 0 },
                    { real: 6, imag: 0 },
                    { real: 7, imag: 0 }
                ]);
                x_mat_gate.update_quantum_state(state);
                expect(state.get_vector()).toEqual([
                    { real: 1, imag: 0 },
                    { real: 0, imag: 0 },
                    { real: 2, imag: 0 },
                    { real: 3, imag: 0 },
                    { real: 5, imag: 0 },
                    { real: 4, imag: 0 },
                    { real: 6, imag: 0 },
                    { real: 7, imag: 0 }
                ]);
            });
        });

        describe("Operation to create a new gate from multiple gates", () => {
            it("Gate Product", async () => {
                const { QuantumState, X, RY, merge } = await import("../../lib/bundle");
                const n = 3;
                const state = new QuantumState(n);
                state.set_zero_state();
                const index = 1;
                const x_gate = X(index);
                const angle = Math.PI / 4.0;
                const ry_gate = RY(index, angle);
                // Create the new gate by combining gates
                // The gate in the first augement is applied first
                const x_and_ry_gate = merge(x_gate, ry_gate); // NOTE: merge(gate[])の実装はemscripten側でabstract classを扱う実装を検討中のため利用できない
                expect(x_and_ry_gate.get_matrix()).toEqual([
                    [
                        { real: 0.3826834323650898, imag: 0 },
                        { real: 0.9238795325112867, imag: 0 }
                    ],
                    [
                        { real: 0.9238795325112867, imag: 0 },
                        { real: -0.3826834323650898, imag: 0 }
                      ]
                ]);
            });
            it("Sum", async () => {
                const { P0, P1, add, merge, Identity, X, Z } = await import("../../lib/bundle");
                const gate00 = merge(P0(0), P0(1));
                const gate11 = merge(P1(0), P1(1));
                // |00><00| + |11><11|
                const proj_00_or_11 = add(gate00, gate11);
                expect(proj_00_or_11.get_matrix()).toEqual([
                    [
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                      ],
                      [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                      ],
                      [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                      ],
                      [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 1, imag: 0 }
                      ]
                ]);
                const gate_ii_zz = add(Identity(0), merge(Z(0),Z(1)));
                const gate_ii_zz_from_array = add([Identity(0), merge([Z(0),Z(1)])]);
                expect(gate_ii_zz.get_matrix()).toEqual(gate_ii_zz_from_array.get_matrix());
                
                const gate_ii_xx = add(Identity(0), merge(X(0),X(1)));
                const proj_00_plus_11 = merge(gate_ii_zz, gate_ii_xx);
                // ((|00>+|11>)(<00|+<11|))/2 = (II + ZZ)(II + XX)/4
                proj_00_plus_11.multiply_scalar(0.25);
                expect(proj_00_plus_11.get_matrix()).toEqual([
                    [
                        { real: 0.5, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0.5, imag: 0 }
                      ],
                      [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                      ],
                      [
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                      ],
                      [
                        { real: 0.5, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0.5, imag: 0 }
                      ]
                ]);
            });

            it("Random unitary", async () => {
                const { RandomUnitary } = await import("../../lib/bundle");
                const target_list = [2, 3];
                const gate = RandomUnitary(target_list);
                expect(gate.get_matrix()).not.toBeUndefined();
            });

            it("Stochastic operation1", async () => {
                const { Probabilistic, H, Z, X, QuantumState } = await import("../../lib/bundle");
                const distribution = [0.2, 0.2, 0.2];
                const gate_list = [H(0), Z(0), X(1)];
                const gate = Probabilistic(distribution, gate_list);
                const state = new QuantumState(2);
                state.set_zero_state();
                for (let i = 0; i < 10; i++) {
                    gate.update_quantum_state(state);
                }
                expect(gate.to_string()).not.toBeUndefined();
            });

            it("Stochastic operation2", async () => {
                const { BitFlipNoise, DephasingNoise, IndependentXZNoise, DepolarizingNoise, TwoQubitDepolarizingNoise } = await import("../../lib/bundle");
                const state = new QuantumState(2);
                const target = 0;
                const second_target = 1;
                const error_prob = 0.8;
                const gate0 = BitFlipNoise(target, error_prob) // X: prob
                gate0.update_quantum_state(state);
                const gate1 = DephasingNoise(target, error_prob) // Z: prob
                gate1.update_quantum_state(state);
                const gate2 = IndependentXZNoise(target, error_prob) // X,Z : prob*(1-prob), Y: prob*prob
                gate2.update_quantum_state(state);
                const gate3 = DepolarizingNoise(target, error_prob) // X,Y,Z : prob/3
                gate3.update_quantum_state(state);
                const gate4 = TwoQubitDepolarizingNoise(target, second_target, error_prob) // {I,X,Y,Z} \times {I,X,Y,Z} \setminus {II} : prob/15
                gate4.update_quantum_state(state);
            });

            it("Noisy evolution", async () => {
                const { Observable, GeneralQuantumOperator, NoisyEvolution_fast, CMath, H } = await import("../../lib/bundle");
                const n = 2;
                const observable = new Observable(n);
                observable.add_operator(1., "X 0");

                // create hamiltonian and collapse operator
                const hamiltonian = new Observable(n);
                hamiltonian.add_operator(1., "Z 0 Z 1");
                const decay_rate_z = 0.2;
                const decay_rate_p = 0.6;
                const decay_rate_m = 0.1;

                //const coef0 = CMath.mul(decay_rate_p / 2, { real: 0, imag: 1 });
                //const coef1 = CMath.mul(1, CMath.mul(decay_rate_m / 2, { real: 0, imag: 1 }));
                const coef0: Complex = { real: 0, imag: 0.3 };
                const coef1: Complex = { real: -0, imag: -0.05 };

                // interacting operator
                const c_ops = Array(3*n).fill(null).map((_, i) => { return new GeneralQuantumOperator(n); });
                c_ops[0].add_operator(decay_rate_z, "Z 0");
                c_ops[1].add_operator(decay_rate_z, "Z 1");
                c_ops[2].add_operator(decay_rate_p/2, "X 0");
                c_ops[2].add_operator(coef0, "Y 0");
                c_ops[3].add_operator(decay_rate_p/2, "X 1");
                c_ops[3].add_operator(coef0, "Y 1");
                c_ops[4].add_operator(decay_rate_m/2, "X 0");
                c_ops[4].add_operator(coef1, "Y 0");
                c_ops[5].add_operator(decay_rate_m/2, "X 1");
                c_ops[5].add_operator(coef1, "Y 1");

                const time = 2;
                const gate = NoisyEvolution_fast(hamiltonian, c_ops, time);

                let exp: Complex = { real: 0, imag: 0 };
                const n_samples = 1000;
                const state = new QuantumState(n);
                for (let k = 0; k < n_samples; k++) {
                    state.set_zero_state();
                    H(0).update_quantum_state(state);
                    H(1).update_quantum_state(state);
                    gate.update_quantum_state(state);
                    const e = observable.get_expectation_value(state);
                    exp = {
                        real: exp.real + e.real / n_samples,
                        imag: exp.imag + e.imag / n_samples
                    };
                }
            });

            it("CPTP mapping", async () => {
                const { merge, CPTP, P0, P1, QuantumState, H } = await import("../../lib/bundle");

                const gate00 = merge(P0(0), P0(1));
                const gate01 = merge(P0(0), P1(1));
                const gate10 = merge(P1(0), P0(1));
                const gate11 = merge(P1(0), P1(1));
                const gate_list = [gate00, gate01, gate10, gate11];
                const gate = CPTP(gate_list);

                const state = new QuantumState(2);
                for (let i = 0; i < 10; i++) {
                    state.set_zero_state();
                    merge(H(0), H(1)).update_quantum_state(state);
                    gate.update_quantum_state(state);
                }
            });

            it("CPTP mapping2", async () => {
                const { AmplitudeDampingNoise } = await import("../../lib/bundle");
                const target = 0;
                const damping_rate = 0.1;
                AmplitudeDampingNoise(target, damping_rate); // K_0: [[1,0],[0,sqrt(1-p)]], K_1: [[0,sqrt(p)], [0,0]]
            });

            it("Instrument", async () => {
                const { merge, Instrument, P0, P1, QuantumState, H } = await import("../../lib/bundle");
                const gate00 = merge(P0(0),P0(1));
                const gate01 = merge(P1(0),P0(1));
                const gate10 = merge(P0(0),P1(1));
                const gate11 = merge(P1(0),P1(1));

                const gate_list = [gate00, gate01, gate10, gate11];
                const classical_pos = 0;
                const gate = Instrument(gate_list, classical_pos);

                const state = new QuantumState(2);
                for (let i = 0; i < 10; i++) {
                    state.set_zero_state();
                    merge(H(0),H(1)).update_quantum_state(state);
                    gate.update_quantum_state(state);
                    const result = state.get_classical_value(classical_pos);
                    // console.log(i, `00${result.toString(2)}`.slice(-2), state.get_vector());
                }
            });

            it("Adaptive operation", async () => {
                const { Adaptive, X, QuantumState } = await import("../../lib/bundle");
                const func = (list: number[]): boolean=> {
                    console.log("func is called! list is ", list);
                    return list[0] === 1;
                }
                const gate = Adaptive(X(0), func);
                const state = new QuantumState(1);
                state.set_zero_state();
                // func returns False, so X does not operate
                state.set_classical_value(0, 0);
                gate.update_quantum_state(state);
                expect(state.get_vector()).toEqual([{ real: 1, imag: 0 }, { real: 0, imag: 0 }]);
                // func returns True, so X operates
                state.set_classical_value(0, 1);
                gate.update_quantum_state(state);
                expect(state.get_vector()).toEqual([{ real: 0, imag: 0 }, { real: 1, imag: 0 }]);
            });
        });

        describe("Operator", () => {
            describe("Pauli operator", () => {
                it("Create Pauli operator and obtain state", async () => {
                    const { PauliOperator } = await import("../../lib/bundle");
                    const coef = 0.1;
                    const s = "X 0 Y 1 Z 3";
                    const pauli = new PauliOperator(s, coef);
                    //  Added pauli symbol later
                    pauli.add_single_Pauli(3, 2);
                    // Get the subscript of each pauli symbol
                    const index_list = pauli.get_index_list();
                    // Get pauli symbols (I,X,Y,Z -> 0,1,2,3)
                    const pauli_id_list = pauli.get_pauli_id_list();
                    // Get pauli coefficient
                    const coef1 = pauli.get_coef();
                    expect(coef1).toEqual({ real: 0.1, imag: 0 });
                    // Create a copy of pauli operator
                    const another_pauli = pauli.copy();
                    expect(another_pauli.toString()).not.toBeUndefined();
                    const sArr = ["I","X","Y","Z"];
                    const pauli_str = pauli_id_list.map(id => sArr[id]);
                    const terms_str = Array(Math.max(pauli_str.length, index_list.length)).fill(0).map((_, i) => {return `${pauli_str[i]} ${index_list[i]}`});
                    expect(terms_str).toEqual(["X 0", "Y 1", "Z 3", "Y 3"]);

                    pauli.change_coef(0.5);
                    const coef2 = pauli.get_coef();
                    expect(coef2).toEqual({ real: 0.5, imag: 0 });
                    const pauli_strings = pauli.get_pauli_string();
                    expect(pauli_strings).toEqual("X 0 Y 1 Z 3 Y 3");
                });

                it("Expected value of Pauli operator", async () => {
                    const { PauliOperator, QuantumState } = await import("../../lib/bundle");
                    const n = 5;
                    const coef = 2.0;
                    const Pauli_string = "X 0 X 1 Y 2 Z 4";
                    const pauli = new PauliOperator(Pauli_string,coef);

                    // Calculate expectation value <a|H|a>
                    const state = new QuantumState(n);
                    state.set_Haar_random_state(0);
                    const value = pauli.get_expectation_value(state);
                    expect(value).toEqual({ real: 0.28573142833480863, imag: 0 });

                    // Calculate transition moment <a|H|b>
                    // The first arguments comes to the bra side
                    const bra = new QuantumState(n);
                    bra.set_Haar_random_state(0);
                    const value2 = pauli.get_transition_amplitude(bra, state);
                    expect(value2).toEqual({ real: 0.2857314283348087, imag: 0 });
                });

            });
            describe("General linear operators", () => {
                it("Create", async () => {
                    const { GeneralQuantumOperator, QuantumState, PauliOperator } = await import("../../lib/bundle");

                    const n = 5;
                    const operator = new GeneralQuantumOperator(n);
                    // Pauli operator can be added
                    const coef: Complex = { real: 2.0, imag: 0.5 };
                    const Pauli_string = "X 0 X 1 Y 2 Z 4";
                    let pauli = new PauliOperator(Pauli_string, coef);
                    operator.add_operator(pauli);
                    // Pauli operator can also be added directly from coefficients and strings
                    operator.add_operator({ real: 0, imag: 0.5 },  "Y 1 Z 4");

                    // Get number of terms
                    const term_count = operator.get_term_count();

                    // Get number of quantum bit
                    const qubit_count = operator.get_qubit_count();

                    // Get specific terms as PauliOperator
                    const index = 1;
                    pauli = operator.get_term(index);
                    const is_hermitian = operator.is_hermitian();

                    // Expected value calculation <a|H|a>
                    // Generally not self-adjoint, can return complex value
                    const state = new QuantumState(n);
                    state.set_Haar_random_state(0);
                    let value = operator.get_expectation_value(state);
                    expect(value).toEqual({ real: 0.28573142833480863, imag: 0.03594986768149972 });

                    const result = new QuantumState(n);
                    const work_state = new QuantumState(n);
                    operator.apply_to_state(work_state, state, result);

                    // Transition moment calculation <a|H|b>
                    // The first arguments comes to the bra side
                    const bra = new QuantumState(n);
                    bra.set_Haar_random_state(1);
                    value = operator.get_transition_amplitude(bra, state);
                    expect(value).toEqual({ real: 0.0211418381071447, imag: 0.12910792637830634 });
                });

                // json
                it("Store linear operators", async () => {
                });

                it("Generation of observables using OpenFermion", async () => {
                });
            });

            describe("Hermite operator / observable", () => {
                it("Separates operators into diagonal and off-diagonal terms", async () => {
                });

                describe("Compute ground state", () => {
                    it("Power method", async () => {
                    });

                    it("Arnoldi method", async () => {
                    });

                    it("Lanczos method", async () => {
                    });
                });
                it("Apply to a quantum state", async () => {
                });
            });
        });
        describe("Quantum Circuits", () => {
            it("Structure of a quantum circuit", async () => {
                const { QuantumState, QuantumCircuit, Z } = await import("../../lib/bundle");
                const n = 3;
                const state = new QuantumState(n);
                state.set_zero_state();
                const circuit = new QuantumCircuit(n);

                // Add hadamard gate to quantum circuit
                for (let i = 0; i < n; i++) {
                    circuit.add_H_gate(i);
                }

                // Create gate, which can also be added
                for (let i = 0; i < n; i++) {
                    circuit.add_gate(Z(i));
                }

                // Operate quantum circuit to state
                circuit.update_quantum_state(state);
                expect(state.get_vector()).toEqual([
                    { real: 0.3535533905932737, imag: 0 },
                    { real: -0.3535533905932737, imag: -0 },
                    { real: -0.3535533905932737, imag: -0 },
                    { real: 0.3535533905932737, imag: 0 },
                    { real: -0.3535533905932737, imag: -0 },
                    { real: 0.3535533905932737, imag: 0 },
                    { real: 0.3535533905932737, imag: 0 },
                    { real: -0.3535533905932737, imag: -0 }
                ]);
            });

            it("Calculation and optimization of depth of quantum circuits", async () => {
                const { QuantumCircuitOptimizer, QuantumCircuit } = await import("../../lib/bundle");
                const n = 5;
                const depth = 10;
                const circuit = new QuantumCircuit(n);
                for (let d = 0; d < depth; d++) {
                    for (let i = 0; i < n; i++) {
                        circuit.add_H_gate(i);
                    }
                }

                // Calculate the depth (depth=10)
                expect(circuit.calculate_depth()).toBe(depth);

                // Optimization
                const opt = new QuantumCircuitOptimizer();
                const max_block_size = 3;
                opt.optimize(circuit, max_block_size);

                // Calculate the depth (depth=1へ)
                expect(circuit.calculate_depth()).toBe(1);
            });

            it("Debugging quantum circuits", async () => {
                const { QuantumCircuit } = await import("../../lib/bundle");
                const n = 5;
                const depth = 10;
                const circuit = new QuantumCircuit(n);
                for (let d = 0; d < depth; d++) {
                    for (let i = 0; i < n; i++) {
                        circuit.add_H_gate(i);
                    }
                }
                expect(circuit.to_string()).not.toBeUndefined();
            });
            it("Store QuantumCircuit", async () => {
            });
        });

        describe("Parametric Quantum Circuits", () => {
            it("Application examples of parametric quantum circuits", async () => {
                const { ParametricQuantumCircuit, QuantumState, ParametricRZ, Identity } = await import("../../lib/bundle");
                const n = 5;
                const depth = 10;
                let angle: number;
                // construct parametric quantum circuit with random rotation
                const circuit = new ParametricQuantumCircuit(n);
                for (let d = 0; d < depth; d++) {
                    for (let i = 0; i < n; i++) {
                        angle = Math.random();
                        circuit.add_parametric_RX_gate(i, angle);
                        angle = Math.random();
                        circuit.add_parametric_RY_gate(i, angle)
                        angle = Math.random();
                        circuit.add_parametric_gate(ParametricRZ(i, angle));
                    }
                    for (let i = d % 2; i < n - 1; i += 2) {
                        circuit.add_CNOT_gate(i, i + 1);
                    }
                    circuit.add_gate(Identity(0)); // QuantumCircuit#add_gateのオーバーライド正常動作チェック

                    // add multi-qubit Pauli rotation gate as parametric gate (X_0 Y_3 Y_1 X_4)
                    const target = [0,3 , 1, 4];
                    const pauli_ids = [1, 2, 2, 1];
                    angle = Math.random();
                    circuit.add_parametric_multi_Pauli_rotation_gate(target, pauli_ids, angle);

                    // get variable parameter count, and get current parameter
                    const parameter_count = circuit.get_parameter_count()
                    const param = Array(parameter_count).fill(0).map((_, ind) => {return circuit.get_parameter(ind)});

                    // set 3rd parameter to 0
                    circuit.set_parameter(3, 0);

                    // update quantum state
                    const state = new QuantumState(n);
                    circuit.update_quantum_state(state);

                    expect(param).not.toBeUndefined();
                    expect(state.to_string()).not.toBeUndefined();
                    expect(circuit.to_string()).not.toBeUndefined();
                }
            })
            it("Compute a gradient of parametric quantum circuit", async () => {
                const { ParametricQuantumCircuit, GradCalculator, Observable } = await import("../../lib/bundle");
                const n = 2;
                const observable = new Observable(n);
                observable.add_operator(1.0, "X 0");
                const circuit = new ParametricQuantumCircuit(n);
                
                const theta = [2.2, 1.4, 0.8];
                circuit.add_parametric_RX_gate(0, theta[0]);
                circuit.add_parametric_RY_gate(0, theta[1]);
                circuit.add_parametric_RZ_gate(0, theta[2]);
                
                // GradCalculatorの場合
                const gcalc = new GradCalculator();
                expect(gcalc.calculate_grad(circuit, observable)).toEqual([
                    { real: 0.13292406112215058, imag: 0 },
                    { real: 0.06968868323709171, imag: 0 },
                    { real: 0.14726262077628174, imag: 0 }
                ]);
                // 第三引数に回転角を指定することも可能
                expect(gcalc.calculate_grad(circuit, observable, theta)).toEqual([
                    { real: 0.13292406112215058, imag: 0 },
                    { real: 0.06968868323709171, imag: 0 },
                    { real: 0.14726262077628174, imag: 0 }
                ]);
                // Backpropを使って求めた場合
                expect(circuit.backprop(observable)).toEqual([
                    0.1329240611221506,
                    0.06968868323709165,
                    0.14726262077628166
                ]);
            });
            it("Store parametric quantum circuits", async () => {
            });
            describe("Simulator", () => {
                it("QuantumCircuitSimulator", async () => {
                    const { QuantumState, QuantumCircuit, QuantumCircuitSimulator, Observable } = await import("../../lib/bundle");
                    const n = 3;
                    const state = new QuantumState(n);

                    // 回路を作成
                    const circuit = new QuantumCircuit(n);
                    for (let i = 0; i < n; i++) {
                        circuit.add_H_gate(i);
                    }

                    // シミュレータクラスを作成
                    const sim = new QuantumCircuitSimulator(circuit, state);

                    // 基底を二進数と見た時の整数値を入れて、その状態に初期化
                    sim.initialize_state(0);
                    expect(sim.get_gate_count()).toBe(3);

                    // 実行
                    sim.simulate();

                    // 量子状態を表示
                    expect(state.get_vector()).toEqual([
                        { real: 0.3535533905932737, imag: 0 },
                        { real: 0.3535533905932737, imag: 0 },
                        { real: 0.3535533905932737, imag: 0 },
                        { real: 0.3535533905932737, imag: 0 },
                        { real: 0.3535533905932737, imag: 0 },
                        { real: 0.3535533905932737, imag: 0 },
                        { real: 0.3535533905932737, imag: 0 },
                        { real: 0.3535533905932737, imag: 0 }
                    ]);

                    // 期待値
                    const observable = new Observable(1);
                    observable.add_operator(1.0, "Z 0");
                    expect(sim.get_expectation_value(observable)).toEqual({ real: 0, imag: 0 });

                    // 量子状態を入れ替え
                    sim.swap_state_and_buffer();
                    // ランダムな純粋状態へ初期化
                    sim.initialize_random_state(0);
                    sim.simulate()
                    expect(state.get_vector()).toEqual([
                        { real: 0.1225434154852396, imag: 0.12785993852555624 },
                        { real: 0.08579214310130866, imag: -0.44437440183992627 },
                        { real: 0.5650340456036835, imag: -0.3736419822394097 },
                        { real: 0.38291198771560225, imag: -0.21902375708450025 },
                        { real: -0.14005793986209567, imag: 0.02466864216798622 },
                        { real: 0.0024387981362078153, imag: 0.09379376638431373 },
                        { real: 0.05214439998065184, imag: -0.1950167201251396 },
                        { real: -0.14156520609871934, imag: -0.14325499152541607 }
                    ]);

                    // 量子状態をコピー（バッファ->現状態）
                    sim.copy_state_from_buffer();
                    sim.simulate();
                    expect(state.get_vector().map(c => round4Complex(c))).toEqual([
                        { real: 1, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 },
                        { real: 0, imag: 0 }
                    ]);

                    // 量子状態をコピー（現状態->バッファ）
                    sim.copy_state_to_buffer();
                    sim.simulate();
                    expect(state.get_vector()).toEqual([
                        { real: 0.3535533905932735, imag: 0 },
                        { real: 0.3535533905932735, imag: 0 },
                        { real: 0.3535533905932735, imag: 0 },
                        { real: 0.3535533905932735, imag: 0 },
                        { real: 0.3535533905932735, imag: 0 },
                        { real: 0.3535533905932735, imag: 0 },
                        { real: 0.3535533905932735, imag: 0 },
                        { real: 0.3535533905932735, imag: 0 }
                    ]);
                });
                it("NoiseSimulator", async () => {
                    const { QuantumState, QuantumCircuit, NoiseSimulator, sqrtX, sqrtY, T, CNOT, CZ, getExceptionMessage } = await import("../../lib/bundle");
                    const n = 3;
                    const depth = 10;
                    const one_qubit_noise = ["Depolarizing", "BitFlip", "Dephasing", "IndependentXZ", "AmplitudeDamping"];
                    const circuit = new QuantumCircuit(n);
                    for (let d = 0; d < depth; d++) {
                        for (let i = 0; i < n; i++) {
                            const r = Math.floor(Math.random() * 5); // randint(0, 4)
                            const noise_type = Math.floor(Math.random() * 5);
                            switch (r) {
                                case 0:
                                    circuit.add_noise_gate(sqrtX(i), one_qubit_noise[noise_type], 0.01);
                                    break;
                                case 1:
                                    circuit.add_noise_gate(sqrtY(i), one_qubit_noise[noise_type], 0.01);
                                    break;
                                case 2:
                                    circuit.add_noise_gate(T(i), one_qubit_noise[noise_type], 0.01);
                                    break;
                                case 3:
                                    if (i < n -1) circuit.add_noise_gate(CNOT(i, i + 1), "Depolarizing", 0.01);
                                    break;
                                case 4:
                                    if (i < n -1) circuit.add_noise_gate(CZ(i, i + 1), "Depolarizing", 0.01);
                                    break;
                                default:
                                    // const unreachable: never = r;
                            }
                        }
                    }
                    const state = new QuantumState(n);
                    state.set_Haar_random_state(0);
                    const sim = new NoiseSimulator(circuit, state);
                    sim.execute(100);
                    expect(state.get_vector()).toEqual([
                        { real: 0.3285365339385453, imag: -0.3991580676973766 },
                        { real: 0.09548989118017889, imag: 0.10490963680782449 },
                        { real: -0.27853247603515763, imag: 0.25911411674718726 },
                        { real: -0.17026322699583063, imag: 0.2508423016086916 },
                        { real: 0.48907802065924627, imag: -0.24372941890871075 },
                        { real: 0.05927692487604381, imag: 0.19038955019035428 },
                        { real: -0.24445110608496284, imag: -0.06384567684752364 },
                        { real: 0.06747055877943083, imag: 0.26312007639361706 }
                    ]);
                });
                it("CausalConeSimulator", async () => {
                    const { QuantumState, ParametricQuantumCircuit, CausalConeSimulator, Observable } = await import("../../lib/bundle");
                    const n = 100;
                    const observable = new Observable(1);
                    observable.add_operator(1.0, "Z 0");
                    const circuit = new ParametricQuantumCircuit(n);
                    for (let i = 0; i < n; i++) {
                        circuit.add_parametric_RX_gate(i, 1.0);
                        circuit.add_parametric_RY_gate(i, 1.0);
                    }

                    // CausalConeSimulatorの場合
                    const ccs = new CausalConeSimulator(circuit, observable);
                    expect(ccs.get_expectation_value()).toEqual({ real: 0.2919265817264289, imag: 0 });

                    try {
                        // 通常の場合
                        const state = new QuantumState(n);
                        circuit.update_quantum_state(state);
                        observable.get_expectation_value(state);
                    } catch (e: any) {
                        expect(e.message).toBe("memory access out of bounds");
                    }
                });
            });
        });
    });
});
