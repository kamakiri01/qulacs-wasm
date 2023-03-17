import { initQulacs } from "../../lib/bundle";
import { round4 } from "../hepler/util";

describe("tutorial advanced samples", () => {
    let q;
    beforeEach(async () => {
        await initQulacs();
    });

    describe("QuantumState class", () => {
        it("generate", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const n = 2;
            const state = new QuantumState(n);
            expect(state).not.toBeUndefined();
        });
        it("array", async () => {
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
        it("copy", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const initial_state = new QuantumState(3);
            const buffer = initial_state .allocate_buffer();
            for (let i = 0;i < 10; i++) {
                buffer.set_Haar_random_state();
                buffer.load(initial_state);
                expect(initial_state.get_vector()).toEqual(buffer.get_vector());
            }
        });
        /*
        it("json", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const o_state = new QuantumState(2);
            o_state.set_Haar_random_state();
        });
        */
        it("init", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const n = 3;
            const state = new QuantumState(n);
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

            state.set_Haar_random_state(0);
            // NOTE: set_Haar_random_stateはseedが固定でもqulacsバージョンや動作環境によって結果は一意とは保証されず、実装依存である
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
        it("kensa", async () => {
            const { QuantumState } = await import("../../lib/bundle");
            const n = 5;
            const state = new QuantumState(n);
            state.set_Haar_random_state(0);
            expect(state.get_qubit_count()).toBe(n);
            expect(state.get_zero_probability(1)).toBe(0.5445520462375112);
            state.set_Haar_random_state(1);
            expect(state.get_zero_probability(1)).not.toBe(0.5445520462375112);
            //expect(state.get_marginal_probability([1,2,2,0,2])).toBe(0.20030608663813237);
            //expect(state.get_entropy()).toBe(3.108273642412474);
            //expect(state.get_squared_norm()).toBe(1);
            state.sampling(10);
            //expect(state.sampling(10, 314.0)).toEqual([23, 18, 28, 14, 17, 30, 9, 17, 16, 10]);
            state.set_Haar_random_state();
            // NOTE: use seed 
        });
        it("transform", async () => {
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
        // 古典レジスタ
        it("状態間の計算", async () => {
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
        /*
        it("replace", async () => {
            const { QuantumState, permutate_qubit } = await import("../../lib/bundle");
            const n = 3;
            const state = new QuantumState(n);
            state.set_Haar_random_state(1);
            const permutate = permutate_qubit(state, [1, 2, 0]);
            expect(permutate.get_vector()).toEqual([]);
        });
        */
        it("trace", async () => {
            const { QuantumState, DensityMatrix, partial_trace, H, X } = await import("../../lib/bundle");
            const state = new QuantumState(3);
            state.set_computational_basis(0);
            H(0).update_quantum_state(state);
            X(1).update_quantum_state(state);
            // partial_trace
        });
    });

    describe("DensityMatrix class", () => {
        it("generate", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const n = 2;
            const state = new DensityMatrix(n);
            expect(state).not.toBeUndefined();
        });

        it("matrix", async () => {
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

        it("copy", async () => {
            const { DensityMatrix } = await import("../../lib/bundle");
            const initial_state = new DensityMatrix(3);
            initial_state.set_computational_basis(1);
            const copied_state = initial_state.copy(); // NOTE: copyが (node:40164) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 uncaughtException listeners added to [process]. Use emitter.setMaxListeners() to increase limit(Use `node --trace-warnings ...` to show where the warning was created) を出す
            expect(initial_state.get_matrix()).toEqual(copied_state.get_matrix());
            const buffer = initial_state.allocate_buffer();
            expect(buffer.get_matrix()).toEqual((new DensityMatrix(3)).get_matrix());
            buffer.load(initial_state);
            expect(buffer.get_matrix()).toEqual(initial_state.get_matrix());
        });
        // json
        it("init", async () => {
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
        it("kensa", async () => {
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

        it("transform", async () => {
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
        // 古典レジスタ
        it("superposition", async () => {
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
        it("common", async () => {
            const { X } = await import("../../lib/bundle");
            const gate = X(0);
            expect(gate).not.toBeUndefined();
            expect(gate.get_matrix()).toEqual([
                [{real: 0, imag: 0}, {real: 1, imag: 0}],
                [{real: 1, imag: 0 }, {real: 0, imag: 0}]
            ]);
        });
        // json test

        describe("specified gates", () => {
            it("single qubit gate", async () => {
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

            it("single qubit rotation gate", async () => {
                const { RX, RY, RZ } = await import("../../lib/bundle");
                const target = 0;
                const angle = 0.1;
                const gate = RX(target, angle);
                expect(gate.get_matrix()).toEqual([
                    [{real: 0.9987502603949663, imag: 0}, {real: 0, imag: 0.04997916927067833}],
                    [{real: 0, imag: 0.04997916927067833}, {real: 0.9987502603949663, imag: 0}]
                ]);
            });

            it("OpenQASM basis gate", async () => {
                const { U1, U2, U3 } = await import("../../lib/bundle");
                const gate = U3(0, 0.1, 0.2, 0.3);
                expect(gate.get_matrix()).toEqual([
                    [{real: 0.9987502603949663, imag: 0}, {real: 0.04898291339046185, imag: 0.009929328112698753}],
                    [{real: -0.04774692410046421, imag: -0.014769854431632931}, {real: 0.8764858122060915, imag: 0.4788263815209447}]
                ]);
            });

            it("two qubit gate", async () => {
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

            it("multi pauli operator", async () => {
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

            it("multi pauli rotation operator", async () => {
                const { PauliRotation } = await import("../../lib/bundle");
                const target_list = [0, 3, 5];
                const pauli_index = [1, 3, 1]; // 1:X , 2:Y, 3:Z
                const angle = 0.5;
                const gate = PauliRotation(target_list, pauli_index, angle); // = X_0 Z_3 X_5
                expect(gate).not.toBeUndefined();
            });

            it("可逆回路", async () => {
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

            it("反射", async () => {
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

        describe("general gates", () => {
            it("DenseMatrix", async () => {
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
        });
    });
});
