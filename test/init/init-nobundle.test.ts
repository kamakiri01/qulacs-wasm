import * as fs from "fs";
import * as path from "path";
import { initQulacs } from "../../lib/nobundle";

describe("init(nobundle)", () => {
    it("initQulacs", async () => {
        await initQulacs();
        const {
            QuantumState, DensityMatrix,
            X, Y, Z, H, S, Sdag, T, Tdag, U1, U2, U3, RX, RY, RZ, RotInvX, RotInvY, RotInvZ, RotX, RotY, RotZ, CNOT, CZ, SWAP, TOFFOLI,
            QuantumCircuit, ParametricQuantumCircuit,
            partial_trace, to_matrix_gate, inner_product, tensor_product, make_superposition, make_mixture
        } = await import("../../lib/nobundle");
        expect(!!QuantumState && !!X && !!QuantumCircuit && !!partial_trace).toBe(true);
    });
    it("initQulacs - from module", async () => {
        const module = await WebAssembly.compile(fs.readFileSync(path.join(__dirname, "../../lib/nobundle/wasm/module.wasm")));
        await initQulacs({ module });
        const {
            QuantumState, DensityMatrix,
            X, Y, Z, H, S, Sdag, T, Tdag, U1, U2, U3, RX, RY, RZ, RotInvX, RotInvY, RotInvZ, RotX, RotY, RotZ, CNOT, CZ, SWAP, TOFFOLI,
            QuantumCircuit, ParametricQuantumCircuit,
            partial_trace, to_matrix_gate, inner_product, tensor_product, make_superposition, make_mixture
        } = await import("../../lib/nobundle");
        expect(!!QuantumState && !!X && !!QuantumCircuit && !!partial_trace).toBe(true);
    });
});
