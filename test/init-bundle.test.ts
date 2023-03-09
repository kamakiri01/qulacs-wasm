import { initQulacs } from "../lib/bundle";

describe("init(bundle)", () => {
        it("initQulacs", async () => {
            await initQulacs();
            const {
                QuantumState, DensityMatrix,
                X, Y, Z, H, S, Sdag, T, Tdag, U1, U2, U3, RX, RY, RZ, RotInvX, RotInvY, RotInvZ, RotX, RotY, RotZ, CNOT, CZ, SWAP, TOFFOLI,
                QuantumCircuit, ParametricQuantumCircuit,
                partial_trace, to_matrix_gate, inner_product, tensor_product, make_superposition, make_mixture
            } = await import("../lib/bundle");
            expect(!!QuantumState && !!X && !!QuantumCircuit && !!partial_trace).toBe(true);
    });
});
