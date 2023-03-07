const { initQulacs, QuantumState, QuantumCircuit } = require("../../");


(async () => {
    await initQulacs({useWorker: false});
    const loop = 5;
    let diffs = 0;
    for (var i = 0; i < loop;i++) {
        diffs += test(15, 2000);
    }
    console.log("avs: " + (diffs / loop));
    diffs = 0;
})();

function test(qubitCount, loop) {
    state = new QuantumState(qubitCount);
    state.set_zero_state();
    const circuit = new QuantumCircuit(qubitCount);
    for (var i = 0; i < loop;i++) { // 500~600でOOM
        circuit.add_H_gate(0);
    }
    //circuit.add_H_gate(0);
    //circuit.add_CNOT_gate(0, 1);
    circuit.update_quantum_state(state);
    const now = Date.now();
    const vec0 = state.get_vector();
    const diff = Date.now() - now;
    return diff;
};