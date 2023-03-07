
const { initQulacs } = require("../../");

initQulacs()
    .then(() => {
        const { QuantumState, QuantumCircuit, X, Y, RY, to_matrix_gate } = require("../../");
        console.log("---test qulacs I/F---");
        const qubits_count = 2;

        state = new QuantumState(qubits_count);
        state.set_zero_state();
        const circuit = new QuantumCircuit(qubits_count);
        circuit.add_H_gate(0);
        circuit.add_CNOT_gate(0, 1);
        const vec0 = state.get_vector();
        console.log("vec0", vec0);
    
        circuit.update_quantum_state(state);
        const vec1 = state.get_vector();
        console.log("vec1", vec1);
        circuit.add_CZ_gate(0, 1);
        circuit.update_quantum_state(state);
        const vec1z = state.get_vector();
        console.log("vec1z", vec1z);
        //circuit.update_quantum_state(state);
        const circuit2 = new QuantumCircuit(qubits_count);
        circuit2.add_CNOT_gate(0, 1);
        circuit2.add_H_gate(0);
        circuit2.update_quantum_state(state);
        const vec2 = state.get_vector();
        console.log("vec2", vec2);
        //state.load([{re: 0, im: 0},{re: 0, im: 0},{re: 0, im: 0},{re: 1, im: 0}]);
        //const vec3 = state.get_vector();
        //console.log("vec3", vec3);
        //state.load([0,0,1,0]);
        //const vec4 = state.get_vector();
        //console.log("vec4", vec4);
        state.set_computational_basis(3);
        const vec5 = state.get_vector();
        console.log("vec5", vec5);
        state.set_Haar_random_state();
        const vec6 = state.get_vector();
        console.log("vec6", vec6);
        state.set_Haar_random_state(5);
        const vec7 = state.get_vector();
        console.log("vec7", vec7);
        state.set_computational_basis(1);
        const samples = state.sampling(10);
        console.log("samples", samples);
        const gateX = X(0);
        state.set_Haar_random_state(0);
        gateX.update_quantum_state(state);
        const samples2 = state.sampling(10);
        console.log("samples2", samples2);
    
        const vec8 = state.get_vector();
        console.log("vec8", vec8);
        state.set_Haar_random_state();
        const prob = state.get_zero_probability(1);
        console.log("prob", prob);
    
        state = new QuantumState(5);
        state.set_Haar_random_state();
        try {
            const marginal_prob = state.get_marginal_probability([1,2,2,0,2]);
            console.log("marginal_prob", marginal_prob);
        } catch(err) {
            console.log("err" ,err);
        }
    
        const state3 = new QuantumState(1);
        const circuit3 = new QuantumCircuit(1);
        state3.set_zero_state();
        circuit3.add_RY_gate(0, -Math.PI/2); //equal Hadamard
        circuit3.update_quantum_state(state3);
        const v3 = state3.get_vector();
        console.log("v3", v3);
        state3.set_zero_state();
        console.log("RY", RY);
        const ryGate = (RY(0, -Math.PI/2));
        console.log("RY");
        ryGate.update_quantum_state(state3);
        console.log("v3", state3.get_vector());
    
        const x = new Y(0);
        console.log(x);
        console.log("x.get_matrix()", x.get_matrix());
    
        console.log("to_matrix_gate", to_matrix_gate);
        const mat = to_matrix_gate(x);
        console.log("unique gate to_matrix_gate()", mat, mat.get_matrix());
});

initQulacs().then(_ => {

});
