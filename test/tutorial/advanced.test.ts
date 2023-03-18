import { initQulacs, QuantumState } from "../../lib/bundle";
import { round4 } from "../hepler/util";

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
            expect(state).not.toBeUndefined();
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
        });
        it("Copy", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const initial_state = new QuantumState(3);
            const buffer = initial_state .allocate_buffer();
            for (let i = 0;i < 10; i++) {
                buffer.set_Haar_random_state();
                buffer.load(initial_state);
                expect(initial_state.get_vector()).toEqual(buffer.get_vector());
            }
        });

        it("Store to JSON and restore", async () => {
            // TODO
        });


        it("Initialization", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const n = 3;
            const state = new QuantumState(n);1
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
            expect(state.get_qubit_count()).toBe(n);
            expect(state.get_zero_probability(1)).toBe(0.5445520462375112);
            expect(state.get_marginal_probability([1,2,2,0,2])).toBe(0.13406608083256927);
            expect(state.get_entropy()).toBe(3.085681210868282);
            expect(state.get_squared_norm()).toBe(1);
            state.sampling(10);
            expect(state.sampling(10, 314.0)).toEqual([23, 17, 24, 11, 14, 28, 3, 15, 14, 4]);
            expect(state.get_device_name()).toBe("cpu");
            // NOTE: use seed 
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
            state.add_state(buffer);
            expect(state.get_vector()).toEqual([
                {real: 1, imag: 0},
                {real: 0, imag: 0},
                {real: 1, imag: 0},
                {real: 0, imag: 0},  
            ]);
            state.multiply_coef({real: 0.5, imag: 0.1});
            state.multiply_coef(1);
            expect(state.get_vector()).toEqual([
                {real: 0.5, imag: 0.1},
                {real: 0, imag: 0},
                {real: 0.5, imag: 0.1},
                {real: 0, imag: 0},  
            ]);
        });

        it("Classical registers", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const state = new QuantumState(3);
            const position = 0;
            const value = 20;
            state.set_classical_value(position, value);
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
            const value = inner_product(state_bra, state_ket);

            const n1 = 1
            const state_ket1 = new QuantumState(n1);
            state_ket1.set_computational_basis(1);
            const n2 = 2;
            const state_ket2 = new QuantumState(n2);
            state_ket2.set_computational_basis(2);
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
            expect(state0.get_vector()).toEqual([
                { real: 0.30385888914418613, imag: -0.1352706040121121 },
                { real: 0.10818205843949354, imag: -0.0499035706092407 },
                { real: -0.10910033108861181, imag: -0.4319005729971607 },
                { real: 0.138922433172912, imag: 0.0064107920119231806 }
            ]);
            const state1 = drop_qubit(state, [1], [1]);
            expect(state1.get_vector()).toEqual([
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
            console.log(trace.get_matrix())
        });
    });

    describe("DensityMatrix class", () => {
        it("Generate and delete", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const n = 2;
            const state = new DensityMatrix(n);
            expect(state).not.toBeUndefined();
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

        it("Initialize", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const n = 2;
            const state = new DensityMatrix(n);
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
        it("Check", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const n = 5;
            const state = new DensityMatrix(n);
            state.set_Haar_random_state(0);
            expect(state.get_qubit_count()).toBe(n);
            expect(state.get_zero_probability(1)).toBe(0.5445520462375112);
            expect(state.get_marginal_probability([1,2,2,0,2])).toEqual(0.1340660808325693);
            expect(state.get_entropy()).toBe(3.085681210868283);
            expect(state.get_squared_norm()).toBe(1);
            state.set_zero_state();
            expect(state.sampling(10).length).toBe(10);
            expect(state.sampling(5, 314)).toEqual([0, 0, 0, 0, 0]);
            expect(state.get_device_name()).toBe("cpu");
        });

        it("Deformation", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const state = new DensityMatrix(2);
            state.set_computational_basis(0);
            const buffer = new DensityMatrix(2);
            buffer.set_computational_basis(2);
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

        it("Classical registers", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const state = new DensityMatrix(3);
            const position = 0;
            const value = 20;
            state.set_classical_value(position, value);
            const obtained = state.get_classical_value(position);
            expect(obtained).toEqual(value);
        });

        it("Creating superposition states and mixture states", async () => {
            const { QuantumState, DensityMatrix, make_superposition, make_mixture } = await import("../../lib/bundle");
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
            const gate = X(0);
            expect(gate).not.toBeUndefined();
            expect(gate.get_matrix()).toEqual([
                [{real: 0, imag: 0}, {real: 1, imag: 0}],
                [{real: 1, imag: 0 }, {real: 0, imag: 0}]
            ]);
        });

        it("Convert to/from JSON ", async () => {
            // TODO
        });

        describe("Special gate", () => {
            it("1 qubit gate", async () => {
                const {
                    Identity,
                    X, Y, Z,
                    H, S, Sdag, sqrtX, sqrtXdag, sqrtY, sqrtYdag,
                    T, Tdag,
                    P0, P1
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
                expect(gate).not.toBeUndefined();
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
                const gate = PauliRotation(target_list, pauli_index, angle); // = X_0 Z_3 X_5
                expect(gate).not.toBeUndefined();
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
                let gate = DenseMatrix(0, [[0, 1],[1, 0]]);
                expect(gate.get_matrix()).toEqual([
                    [ {real: 0, imag: 0}, {real: 1, imag: 0} ],
                    [ {real: 1, imag: 0}, {real: 0, imag: 0} ]
                ]);
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
            it("Product", async () => {
                const { PauliRotation } = await import("../../lib/bundle");

            });
        });
    });
});
