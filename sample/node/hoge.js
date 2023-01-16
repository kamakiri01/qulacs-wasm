
var m = require("../../lib/index");
var m2 = require("../../lib/main/nativeType/QuantumState");
var m3 = require("../../lib/main/nativeType/QuantumCircuit");
var m4 = require("../../lib/main/nativeType/QuantumGate/QuantumGateBase");
var q = require("qulacs-wasm");

m.initQulacsModule({useWorker: false})
    .then((client => {
        /*
        console.log("client", !!client);
        const size = 3;
        var result = client.getStateVectorWithExpectationValue({
            circuitInfo: {
                circuit: [[
                    {type: "x"},
                    {type: "x"},
                    {type: "rx", param: 0.1}
                ]],
                size: size
            },
            observableInfo: {
                observable: [{
                    coefficient: 1,
                    operators: ["z", "z"]
                },
                {
                    coefficient: 1,
                    operators: ["z"]
                }]
            }
        });
        console.log("result" , result);

        var result2 = client.runShotTask({
            circuit: [[
                {type: "h"},
                {type: "h"}
            ]],
            size: size
        }, 20);
        console.log("result2" , result2);


        var result3 = client.getExpectationValueMap({
            circuitInfo: {
                circuit: [[
                    {type: "rx", param: 0.1}
                ]],
                size: size
            },
            observableInfo: {
                observable: [{
                    coefficient: 1,
                    operators: ["z"]
                }]
            }
        },
         0,
         0,
         10,
        );
        console.log("result3" , result3);
        */

        console.log("---test qulacs I/F---");

        state = new m2.QuantumState(2);
        state.set_zero_state();
        const circuit = new m3.QuantumCircuit(3);
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
        const circuit2 = new m3.QuantumCircuit(3);
        circuit2.add_CNOT_gate(0, 1);
        circuit2.add_H_gate(0);
        circuit2.update_quantum_state(state);
        const vec2 = state.get_vector();
        console.log("vec2", vec2);
        state.load([{re: 0, im: 0},{re: 0, im: 0},{re: 0, im: 0},{re: 1, im: 0}]);
        const vec3 = state.get_vector();
        console.log("vec3", vec3);
        state.load([0,0,1,0]);
        const vec4 = state.get_vector();
        console.log("vec4", vec4);
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
        const gateX = new q.X(0);
        state.set_Haar_random_state(0);
        gateX.update_quantum_state(state);
        const samples2 = state.sampling(10);
        console.log("samples2", samples2);
        /*
        var n = 1;
        var avg = 0;
        for(var i = 0; i < 10; i++) {
            avg += test1(n);
        }
        console.log("-avg:", (avg/10));
        avg = 0;
        for(var i = 0; i < 10; i++) {
            avg += test2(n);
        }
        console.log("-avg:", (avg/10));
        */

        const vec8 = state.get_vector();
        console.log("vec8", vec8);
        state.set_Haar_random_state();
        const prob = state.get_zero_probability(1);
        console.log("prob", prob);

        state = new m2.QuantumState(5);
        state.set_Haar_random_state();
        try {
            const marginal_prob = state.get_marginal_probability([1,2,2,0,2]);
            console.log("marginal_prob", marginal_prob);
        } catch(err) {
            console.log("err" ,err);
        }

        const state3 = new m2.QuantumState(1);
        const circuit3 = new m3.QuantumCircuit(1);
        state3.set_zero_state();
        circuit3.add_RY_gate(0, -Math.PI/2); //equal Hadamard
        circuit3.update_quantum_state(state3);
        const v3 = state3.get_vector();
        console.log("v3", v3);
        state3.set_zero_state();
        (new q.RY(0, -Math.PI/2)).update_quantum_state(state3);
        console.log("v3", state3.get_vector());

        const x = new q.Y(0);
        console.log(x);
        console.log("x.get_matrix()", x.get_matrix());

        const mat = x.to_matrix_gate();
        console.log("unique gate to_matrix_gate()", mat, mat.get_matrix());
    }))
