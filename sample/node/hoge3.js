/*
const { initQulacsModule } = require("../../lib/main/index");
const { QuantumState } = require("../../lib/main/nativeType/QuantumState");
const { QuantumCircuit } = require("../../lib/main/nativeType/QuantumCircuit");
*/
const { initQulacsModule, QuantumState, QuantumCircuit } = require("qulacs-wasm");

(async () => {
    const timeFromInit = Date.now();
    await initQulacsModule({useWorker: false});
    const state = new QuantumState(5);
    const circuit = new QuantumCircuit(5);
    circuit.add_H_gate(0);
    circuit.add_CNOT_gate(0, 1);
    circuit.add_CNOT_gate(1, 2);
    circuit.add_CNOT_gate(2, 3);
    circuit.add_CNOT_gate(3, 4);
    circuit.add_H_gate(1);
    circuit.add_H_gate(2);
    circuit.add_H_gate(3);
    circuit.add_H_gate(4);
    circuit.add_S_gate(0);
    circuit.add_S_gate(1);
    circuit.add_S_gate(2);
    circuit.add_S_gate(3);
    circuit.add_S_gate(4);
    circuit.add_T_gate(0);
    circuit.add_T_gate(1);
    circuit.add_T_gate(2);
    circuit.add_T_gate(3);
    circuit.add_T_gate(4);
    time = Date.now();
    circuit.update_quantum_state(state);
    const samples = state.sampling(30000);
    const now = Date.now();
    const duration = now - time;
    const durationFromInit = now - timeFromInit;
    console.log("done", samples.length);
    console.log(`time: ${duration}msec\ntime: ${durationFromInit}msec(from init)`);
})();
