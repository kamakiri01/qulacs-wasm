
const { QuantumState, initQulacs } = require("../../");
let handler;
initQulacs().then(module => {
    const { QuantumState, X, Y,Z, H, RX, CNOT,TOFFOLI,QuantumCircuit, ParametricQuantumCircuit, DensityMatrix, partial_trace, getExceptionMessage, to_matrix_gate, tensor_product, inner_product, Pauli, ReversibleBoolean, addFunction, removeFunction, testPointer, invoke_function_pointer, _invoke_function_pointer, CMath, testAbstArg, testAbstArg2,testAbstArg3, add } = require("../../"); // require after init, or use module.QuantumState
    console.log("---test qulacs I/F---");

console.log("TEST",getExceptionMessage, getExceptionMessage.toString())
handler = getExceptionMessage; 

const c = {real: 0, imag: 1};
console.log("1", CMath.mul(c, c));

    console.log("START")
    const s = new QuantumState(1);
    s.multiply_elementwise_function((intNum) => {
        console.log("intNum", intNum);
        return {real: 999.99, imag: 22.222}
    });
    console.log("done");

    return;


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
    console.log("RX", RX);
    const gateH = RX(0, -Math.PI/2);
    //const gateH = X(0);
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
    console.log("sample1", s7.sampling(10));
    console.log("sample2", s7.sampling(10, 10));
    console.log("sample1", d1.sampling(10));
    console.log("sample2", d1.sampling(10, 10));
    console.log("gateH.get_matrix", gateH.get_matrix());

    const toffoli = TOFFOLI(0,1,2);
    const gateX = X(0);
    const x2 = to_matrix_gate(gateX);
    console.log("x2",x2, x2.get_target_index_list(), x2.get_control_index_list(), x2.is_Pauli());
    const cx2 = x2.add_control_qubit(1,2);
    console.log("x2",x2, x2.get_target_index_list(), x2.get_control_index_list(), x2.is_Pauli());


    let s11 = new QuantumState(1);
    s11.set_zero_state();

    const s81 = new DensityMatrix(1);
    s81.set_zero_state();
    const s82 = new DensityMatrix(1);
    const gateX2 = X(0);
    //s7.set_computational_basis(1);
    gateX2.update_quantum_state(s81);
    //s81.load2(s82);
    //s81.load([1,0]);
    console.log("s81-1", s81.get_matrix());
    s81.load(s82);
    console.log("s81-2", s81.get_matrix());
    s81.load([1, 1]);
    console.log("s81-3", s81.get_matrix());
    s81.load([[1, 0], [1, 0]]);
    console.log("s81-4", s81.get_matrix());
    s81.load(s11);
    console.log("s81-4", s81.get_matrix());

    console.log("types", typeof DensityMatrix, typeof X, typeof partial_trace);


    const uint = 0x00000000;
    
    const st = new QuantumState(1);
    //st.set_Haar_random_state2(uint >>> 0);
    //console.log("ST", uint, st.get_vector());
    console.log("tensor_product2", tensor_product(st,s11).get_vector());
    console.log("tensor_product3", tensor_product(s81,s82).get_matrix());
    console.log("inner_product", inner_product(st,s11));


    //console.log("Module.addFunction", {addFunction, removeFunction, testPointer, invoke_function_pointer, _invoke_function_pointer});
    const upper = function(n0, n1) {console.log("WELCOME! n0:", n0, " n1: ", n1); return (n0+1)%n1};
    //const fnPointer = addFunction(upper, "iii");
    //console.log("foo", upper, fnPointer);
    //testPointer(fnPointer);
    
    //module.invoke_function_pointer(fnPointer);

    /*
    var hoge = module.ccall(
        'invoke_function_pointer', // 関数名
        'number', // 戻り型
        ['number', "number"], // 引数型
        [fnPointer, 5] // 引数
    );
    var hoge2 = module.cwrap(
        'invoke_function_pointer', // 関数名
        'number', // 戻り型
        ['number', "number"], // 引数型
    );
    console.log("hoge2", hoge2(fnPointer, 5));
    const fnPointer2 = addFunction(hoge2, "ii");
    */

    const rev = ReversibleBoolean([0, 1], upper);
    console.log("rev", rev);
    //removeFunction(fnPointer);
    const sr = new QuantumState(3);
    sr.load(new Array(2**3).fill(0).map((_, i) => i));
    console.log("srv", sr.get_vector());
    rev.update_quantum_state(sr);
    console.log("update, done")
    console.log("srv", sr.get_vector());


    const target_list = [0, 3, 5];
    const pauli_index = [1, 3, 1]; // 1:X , 2:Y, 3:Z
    const gate = Pauli(target_list, pauli_index); // = X_0 Z_3 X_5
    //console.log("gate.get_matrix()", gate.get_matrix());

    console.log(testAbstArg([gate, gate]))
    console.log(testAbstArg2(gate));
    console.log(testAbstArg([gate, gate]))
    console.log(testAbstArg2(gate));
    const ptr = testAbstArg2(gate);
    console.log("ptrd",ptr);
    console.log(testAbstArg3(ptr));

    console.log("add", add([gate, gate]));

}).catch(e => {
    console.log(e)
    console.log("handler", handler)

    //console.log("getExceptionMessage", handler(e));
})
