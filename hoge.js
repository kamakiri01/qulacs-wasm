
var m = require("./lib/main/index");
var m2 = require("./lib/main/nativeType/QuantumState");
var m3 = require("./lib/main/nativeType/QuantumCircuit");


m.initQulacsModule({useWorker: false})
    .then((client => {
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

        console.log("---test qulacs I/F---");

        const state = new m2.QuantumState(2);
        state.set_zero_state();
        const circuit = new m3.QuantumCircuit(3);
        circuit.add_H_gate(0);
        circuit.add_CNOT_gate(0, 1);
        const vec0 = state.get_vector();
        console.log("vec0", vec0);

        circuit.update_quantum_state(state);
        const vec1 = state.get_vector();
        console.log("vec1", vec1);

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
    }))
