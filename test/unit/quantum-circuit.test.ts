/**
 * QuantumCircuit Unit Tests
 *
 * This test file validates the individual methods of the QuantumCircuit class.
 *
 * Test Coverage:
 * 1. Single Qubit Gate Methods (add_{GATE_NAME}_gate)
 *    - Tests X, Y, Z, H, S, Sdag, T, Tdag gates
 * 2. Rotation Gate Methods (add_{GATE_NAME}_gate)
 *    - Tests RX, RY, RZ, RotX, RotY, RotZ, RotInvX, RotInvY, RotInvZ gates
 * 3. Two Qubit Gate Methods (add_{GATE_NAME}_gate)
 *    - Tests CNOT, CZ, SWAP gates
 * 4. Gate Function Methods (add_gate with gate functions)
 *    - Tests adding gates via add_gate(Identity()), add_gate(X()), etc.
 * 5. Circuit Operations
 *    - Tests calculate_depth, copy, to_string, remove_gate
 * 6. Multiple Gates
 *    - Tests applying multiple gates in sequence
 */

import { initQulacs } from "../../lib/bundle";
import { round4Complex } from "../hepler/util";

describe("QuantumCircuit Unit Tests", () => {
    beforeEach(async () => {
        await initQulacs();
    });

    describe("Single Qubit Gate Methods (add_{GATE_NAME}_gate)", () => {
        it("should add X gate via add_X_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_X_gate(0);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 1, imag: 0 });
        });

        it("should add Y gate via add_Y_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_Y_gate(0);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: -0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 1 });
        });

        it("should add Z gate via add_Z_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_Z_gate(0);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 1, imag: 0 });
        });

        it("should add H gate via add_H_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_H_gate(0);
            circuit.update_quantum_state(state);

            const sqrt2inv = 1 / Math.sqrt(2);
            expect(round4Complex(state.get_amplitude(0)).real).toBeCloseTo(sqrt2inv, 2);
            expect(round4Complex(state.get_amplitude(1)).real).toBeCloseTo(sqrt2inv, 2);
        });

        it("should add S gate via add_S_gate", async () => {
            const { QuantumCircuit, QuantumState, X } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            // Prepare |1⟩ state
            circuit.add_gate(X(0));
            circuit.add_S_gate(0);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 1 });
        });

        it("should add Sdag gate via add_Sdag_gate", async () => {
            const { QuantumCircuit, QuantumState, X } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            // Prepare |1⟩ state
            circuit.add_gate(X(0));
            circuit.add_Sdag_gate(0);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: -1 });
        });

        it("should add T gate via add_T_gate", async () => {
            const { QuantumCircuit, QuantumState, X } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            // Prepare |1⟩ state
            circuit.add_gate(X(0));
            circuit.add_T_gate(0);
            circuit.update_quantum_state(state);

            const sqrt2inv = 1 / Math.sqrt(2);
            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: sqrt2inv, imag: sqrt2inv });
        });

        it("should add Tdag gate via add_Tdag_gate", async () => {
            const { QuantumCircuit, QuantumState, X } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            // Prepare |1⟩ state
            circuit.add_gate(X(0));
            circuit.add_Tdag_gate(0);
            circuit.update_quantum_state(state);

            const sqrt2inv = 1 / Math.sqrt(2);
            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: sqrt2inv, imag: -sqrt2inv });
        });
    });

    describe("Rotation Gate Methods (add_{GATE_NAME}_gate)", () => {
        it("should add RX gate via add_RX_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_RX_gate(0, angle);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBe(0);
            expect(state.get_amplitude(1).imag).toBeCloseTo(Math.sin(angle / 2), 2);
        });

        it("should add RY gate via add_RY_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_RY_gate(0, angle);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBeCloseTo(-Math.sin(angle / 2), 2);
            expect(state.get_amplitude(1).imag).toBe(0);
        });

        it("should add RZ gate via add_RZ_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_RZ_gate(0, angle);
            circuit.update_quantum_state(state);

            // RZ on |0⟩ gives e^(-iθ/2)|0⟩
            const amp0 = state.get_amplitude(0);
            expect(Math.abs(amp0.real * amp0.real + amp0.imag * amp0.imag)).toBeCloseTo(1, 2);
        });

        it("should add RotX gate via add_RotX_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_RotX_gate(0, angle);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(-angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBe(0);
            expect(state.get_amplitude(1).imag).toBeCloseTo(Math.sin(-angle / 2), 2);
        });

        it("should add RotY gate via add_RotY_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_RotY_gate(0, angle);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(-angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBeCloseTo(-Math.sin(-angle / 2), 2);
            expect(state.get_amplitude(1).imag).toBe(0);
        });

        it("should add RotZ gate via add_RotZ_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_RotZ_gate(0, angle);
            circuit.update_quantum_state(state);

            const amp0 = state.get_amplitude(0);
            expect(Math.abs(amp0.real * amp0.real + amp0.imag * amp0.imag)).toBeCloseTo(1, 2);
        });

        it("should add RotInvX gate via add_RotInvX_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_RotInvX_gate(0, angle);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBe(0);
            expect(state.get_amplitude(1).imag).toBeCloseTo(Math.sin(angle / 2), 2);
        });

        it("should add RotInvY gate via add_RotInvY_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_RotInvY_gate(0, angle);
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBeCloseTo(-Math.sin(angle / 2), 2);
            expect(state.get_amplitude(1).imag).toBe(0);
        });

        it("should add RotInvZ gate via add_RotInvZ_gate", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_RotInvZ_gate(0, angle);
            circuit.update_quantum_state(state);

            const amp0 = state.get_amplitude(0);
            expect(Math.abs(amp0.real * amp0.real + amp0.imag * amp0.imag)).toBeCloseTo(1, 2);
        });
    });

    describe("Two Qubit Gate Methods (add_{GATE_NAME}_gate)", () => {
        it("should add CNOT gate via add_CNOT_gate", async () => {
            const { QuantumCircuit, QuantumState, X } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            // Prepare |10⟩ state
            circuit.add_gate(X(0));
            circuit.add_CNOT_gate(0, 1);
            circuit.update_quantum_state(state);

            // Result should be |11⟩
            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(2)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(3)).toEqual({ real: 1, imag: 0 });
        });

        it("should add CZ gate via add_CZ_gate", async () => {
            const { QuantumCircuit, QuantumState, X } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            // Prepare |11⟩ state
            circuit.add_gate(X(0));
            circuit.add_gate(X(1));
            circuit.add_CZ_gate(0, 1);
            circuit.update_quantum_state(state);

            // CZ adds phase to |11⟩
            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(2)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(3)).toEqual({ real: -1, imag: -0 });
        });

        it("should add SWAP gate via add_SWAP_gate", async () => {
            const { QuantumCircuit, QuantumState, X } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            // Prepare |10⟩ state
            circuit.add_gate(X(0));
            circuit.add_SWAP_gate(0, 1);
            circuit.update_quantum_state(state);

            // Result should be |01⟩
            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(2)).toEqual({ real: 1, imag: 0 });
            expect(state.get_amplitude(3)).toEqual({ real: 0, imag: 0 });
        });
    });

    describe("Gate Function Methods (add_gate with gate functions)", () => {
        it("should add gate via add_gate with Identity", async () => {
            const { QuantumCircuit, QuantumState, Identity } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(Identity(0));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 1, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 0 });
        });

        it("should add gate via add_gate with X", async () => {
            const { QuantumCircuit, QuantumState, X } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(X(0));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 1, imag: 0 });
        });

        it("should add gate via add_gate with Y", async () => {
            const { QuantumCircuit, QuantumState, Y } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(Y(0));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: -0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 1 });
        });

        it("should add gate via add_gate with Z", async () => {
            const { QuantumCircuit, QuantumState, Z } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(Z(0));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 1, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: -0, imag: -0 });
        });

        it("should add gate via add_gate with H", async () => {
            const { QuantumCircuit, QuantumState, H } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(H(0));
            circuit.update_quantum_state(state);

            const sqrt2inv = 1 / Math.sqrt(2);
            expect(state.get_amplitude(0).real).toBeCloseTo(sqrt2inv, 2);
            expect(state.get_amplitude(1).real).toBeCloseTo(sqrt2inv, 2);
        });

        it("should add gate via add_gate with S", async () => {
            const { QuantumCircuit, QuantumState, S, X } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(X(0));
            circuit.add_gate(S(0));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 1 });
        });

        it("should add gate via add_gate with Sdag", async () => {
            const { QuantumCircuit, QuantumState, Sdag, X } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(X(0));
            circuit.add_gate(Sdag(0));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(Math.abs(state.get_amplitude(1).imag)).toBeCloseTo(1, 2);
        });

        it("should add gate via add_gate with T", async () => {
            const { QuantumCircuit, QuantumState, T, X } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(X(0));
            circuit.add_gate(T(0));
            circuit.update_quantum_state(state);

            const sqrt2inv = 1 / Math.sqrt(2);
            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: sqrt2inv, imag: sqrt2inv });
        });

        it("should add gate via add_gate with Tdag", async () => {
            const { QuantumCircuit, QuantumState, Tdag, X } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(X(0));
            circuit.add_gate(Tdag(0));
            circuit.update_quantum_state(state);

            const sqrt2inv = 1 / Math.sqrt(2);
            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: sqrt2inv, imag: -sqrt2inv });
        });

        it("should add gate via add_gate with RX", async () => {
            const { QuantumCircuit, QuantumState, RX } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_gate(RX(0, angle));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBe(0);
            expect(state.get_amplitude(1).imag).toBeCloseTo(Math.sin(angle / 2), 2);
        });

        it("should add gate via add_gate with RY", async () => {
            const { QuantumCircuit, QuantumState, RY } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_gate(RY(0, angle));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBeCloseTo(-Math.sin(angle / 2), 2);
            expect(state.get_amplitude(1).imag).toBe(0);
        });

        it("should add gate via add_gate with RZ", async () => {
            const { QuantumCircuit, QuantumState, RZ } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_gate(RZ(0, angle));
            circuit.update_quantum_state(state);

            const amp0 = state.get_amplitude(0);
            expect(Math.abs(amp0.real * amp0.real + amp0.imag * amp0.imag)).toBeCloseTo(1, 2);
        });

        it("should add gate via add_gate with RotX", async () => {
            const { QuantumCircuit, QuantumState, RotX } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_gate(RotX(0, angle));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(-angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBe(0);
            expect(state.get_amplitude(1).imag).toBeCloseTo(Math.sin(-angle / 2), 2);
        });

        it("should add gate via add_gate with RotY", async () => {
            const { QuantumCircuit, QuantumState, RotY } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_gate(RotY(0, angle));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(-angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBeCloseTo(-Math.sin(-angle / 2), 2);
            expect(state.get_amplitude(1).imag).toBe(0);
        });

        it("should add gate via add_gate with RotZ", async () => {
            const { QuantumCircuit, QuantumState, RotZ } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_gate(RotZ(0, angle));
            circuit.update_quantum_state(state);

            const amp0 = state.get_amplitude(0);
            expect(Math.abs(amp0.real * amp0.real + amp0.imag * amp0.imag)).toBeCloseTo(1, 2);
        });

        it("should add gate via add_gate with RotInvX", async () => {
            const { QuantumCircuit, QuantumState, RotInvX } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_gate(RotInvX(0, angle));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBe(0);
            expect(state.get_amplitude(1).imag).toBeCloseTo(Math.sin(angle / 2), 2);
        });

        it("should add gate via add_gate with RotInvY", async () => {
            const { QuantumCircuit, QuantumState, RotInvY } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_gate(RotInvY(0, angle));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0).real).toBeCloseTo(Math.cos(angle / 2), 2);
            expect(state.get_amplitude(0).imag).toBe(0);
            expect(state.get_amplitude(1).real).toBeCloseTo(-Math.sin(angle / 2), 2);
            expect(state.get_amplitude(1).imag).toBe(0);
        });

        it("should add gate via add_gate with RotInvZ", async () => {
            const { QuantumCircuit, QuantumState, RotInvZ } = await import("../../lib/bundle");
            const n = 1;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            const angle = Math.PI / 2;
            circuit.add_gate(RotInvZ(0, angle));
            circuit.update_quantum_state(state);

            const amp0 = state.get_amplitude(0);
            expect(Math.abs(amp0.real * amp0.real + amp0.imag * amp0.imag)).toBeCloseTo(1, 2);
        });

        it("should add gate via add_gate with CNOT", async () => {
            const { QuantumCircuit, QuantumState, CNOT, X } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(X(0));
            circuit.add_gate(CNOT(0, 1));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(2)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(3)).toEqual({ real: 1, imag: 0 });
        });

        it("should add gate via add_gate with CZ", async () => {
            const { QuantumCircuit, QuantumState, CZ, X } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(X(0));
            circuit.add_gate(X(1));
            circuit.add_gate(CZ(0, 1));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(2)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(3)).toEqual({ real: -1, imag: -0 });
        });

        it("should add gate via add_gate with SWAP", async () => {
            const { QuantumCircuit, QuantumState, SWAP, X } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(X(0));
            circuit.add_gate(SWAP(0, 1));
            circuit.update_quantum_state(state);

            expect(state.get_amplitude(0)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(1)).toEqual({ real: 0, imag: 0 });
            expect(state.get_amplitude(2)).toEqual({ real: 1, imag: 0 });
            expect(state.get_amplitude(3)).toEqual({ real: 0, imag: 0 });
        });
    });

    describe("Circuit Operations", () => {
        it("should calculate circuit depth", async () => {
            const { QuantumCircuit } = await import("../../lib/bundle");
            const n = 3;
            const circuit = new QuantumCircuit(n);

            circuit.add_H_gate(0);
            circuit.add_H_gate(1);
            circuit.add_CNOT_gate(0, 1);
            circuit.add_H_gate(2);

            const depth = circuit.calculate_depth();
            expect(depth).toBeGreaterThan(0);
        });

        it("should copy circuit", async () => {
            const { QuantumCircuit } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);

            circuit.add_H_gate(0);
            circuit.add_CNOT_gate(0, 1);

            const copiedCircuit = circuit.copy();
            expect(copiedCircuit.to_string()).toBe(circuit.to_string());
        });

        it("should convert circuit to string", async () => {
            const { QuantumCircuit } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);

            circuit.add_H_gate(0);
            circuit.add_CNOT_gate(0, 1);

            const circuitString = circuit.to_string();
            expect(circuitString).toBeTruthy();
            expect(typeof circuitString).toBe("string");
        });

        it("should remove gate", async () => {
            const { QuantumCircuit } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);

            circuit.add_H_gate(0);
            circuit.add_X_gate(1);
            circuit.add_CNOT_gate(0, 1);

            const beforeRemove = circuit.to_string();
            circuit.remove_gate(1); // Remove X gate
            const afterRemove = circuit.to_string();

            expect(beforeRemove).not.toBe(afterRemove);
        });
    });

    describe("Circuit with Multiple Gates", () => {
        it("should apply multiple gates in sequence using add_{GATE_NAME}_gate methods", async () => {
            const { QuantumCircuit, QuantumState } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_H_gate(0);
            circuit.add_H_gate(1);
            circuit.add_CNOT_gate(0, 1);
            circuit.update_quantum_state(state);

            // Should create entangled Bell state
            const amp0 = round4Complex(state.get_amplitude(0));
            const amp3 = round4Complex(state.get_amplitude(3));

            expect(amp0.real).toBeCloseTo(0.5, 1);
            expect(amp3.real).toBeCloseTo(0.5, 1);
        });

        it("should apply multiple gates using add_gate method", async () => {
            const { QuantumCircuit, QuantumState, H, CNOT } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(H(0));
            circuit.add_gate(H(1));
            circuit.add_gate(CNOT(0, 1));
            circuit.update_quantum_state(state);

            // Should create entangled Bell state
            const amp0 = round4Complex(state.get_amplitude(0));
            const amp3 = round4Complex(state.get_amplitude(3));

            expect(amp0.real).toBeCloseTo(0.5, 1);
            expect(amp3.real).toBeCloseTo(0.5, 1);
        });

        it("should mix add_{GATE_NAME}_gate and add_gate methods", async () => {
            const { QuantumCircuit, QuantumState, H, X } = await import("../../lib/bundle");
            const n = 2;
            const circuit = new QuantumCircuit(n);
            const state = new QuantumState(n);
            state.set_zero_state();

            circuit.add_gate(H(0));
            circuit.add_CNOT_gate(0, 1);
            circuit.add_gate(X(1));
            circuit.update_quantum_state(state);

            // Verify state is as expected after mixed gate additions
            const vector = state.get_vector();
            expect(vector.length).toBe(4);
        });
    });
});
