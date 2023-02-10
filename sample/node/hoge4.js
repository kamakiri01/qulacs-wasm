
const { QuantumState, initQulacsModule } = require("../../");

initQulacsModule().then(module => {
    const { QuantumState, X, Y,Z, H, CNOT,QuantumCircuit, ParametricQuantumCircuit, DensityMatrix, partial_trace, getExceptionMessage } = require("../../"); // require after init, or use module.QuantumState
    console.log("---test qulacs I/F---");

    /*
    const s = new QuantumState(1);

    console.log(s, s.set_zero_state(), s.data_cpp());
    const vec = s.data_cpp();
    const gateX = X(0);
    gateX.update_quantum_state(s);

    const vec2 = s.data_cpp();
    console.log("vec2", vec2);
    console.log(vec2.real, vec[0]);
    const up = gateX.update_quantum_state(s);
    const vec3 = s.data_cpp();
    console.log(vec.real, vec[0]);
    console.log(vec2.real, vec[0]);
    console.log(vec3.real, vec[0]);
    */

    const qubits = 1;

    const s2 = new QuantumState(qubits);
    console.log("allocate_buffer", s2.allocate_buffer())
    console.log("copy", s2.copy())
    const gateH = H(0);
    gateH.update_quantum_state(s2);
    console.log("g2", s2.get_vector());

    const circuit = new ParametricQuantumCircuit(qubits);
    //circuit.add_H_gate(0);
    circuit.add_gate(H(0));

    let s3 = new QuantumState(qubits);
    console.log("s3", s3.get_vector());

    let s4 = new QuantumState(qubits);
    console.log("s4", s4.get_vector());
    let s5 = new QuantumState(qubits);
    console.log("s5", s5.get_vector()); // これをL49にもっていくとg4が正常になりg5が壊れる
    let s6 = new QuantumState(qubits);
    console.log("s6", s6.get_vector()); // これをL49にもっていくとg4が正常になりg5が壊れる

    (Z(0)).update_quantum_state(s3);
    //s3.set_computational_basis(1);
    //circuit.update_quantum_state(s3); // s2にするとs4/s5もindex0が壊れる
    console.log("g3", s3.get_vector());

    let circuit2 = circuit.copy();
    circuit2.update_quantum_state(s4);
    console.log("g4", s4.get_vector());

    circuit.update_quantum_state(s5);
    console.log("g5", s5.get_vector());
    console.log("g5-1", s5.get_amplitude(0));

    circuit.update_quantum_state(s6);
    console.log("g6", s6.get_vector());
    console.log("g6-1", s6.get_amplitude(0));

    const d1 = new DensityMatrix(2);
    gateH.update_quantum_state(d1);
    console.log("gd1", d1.get_matrix());
    const trace = partial_trace(d1, [1]);
    console.log("trace", trace.get_matrix());
    d1.set_Haar_random_state(0);
    console.log("get_qubit_count", d1.get_qubit_count());
    console.log("get_marginal_probability", d1.get_marginal_probability([0, 0]));
    console.log("amp", s6.get_amplitude(1));
    const s7 = new QuantumState(2);
    s7.set_Haar_random_state(2);
    console.log("sample1", d1.sampling(10));
    console.log("sample2", d1.sampling(10, 10));
    console.log("gateH.get_matrix", gateH.get_matrix());

}).catch(e => {
    const { getExceptionMessage } = require("../../");
    console.log("getExceptionMessage", getExceptionMessage(e));
})
