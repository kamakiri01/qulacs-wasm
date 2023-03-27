import { getExceptionMessage, initQulacs, QuantumCircuit, QuantumCircuitOptimizer, QuantumState } from "qulacs-wasm";
import { range } from "./util";

function first_rotation(circuit: QuantumCircuit, nqubits: number) {
    for (let i = 0; i < nqubits; i++) {
        circuit.add_RX_gate(i, Math.random());
        circuit.add_RZ_gate(i, Math.random());
    }
}

function mid_rotation(circuit: QuantumCircuit, nqubits: number) {
    for (let i = 0; i < nqubits; i++) {
        circuit.add_RZ_gate(i, Math.random());
        circuit.add_RX_gate(i, Math.random());
        circuit.add_RZ_gate(i, Math.random());
    }
}

function last_rotation(circuit: QuantumCircuit, nqubits: number) {
    for (let i = 0; i < nqubits; i++) {
        circuit.add_RZ_gate(i, Math.random());
        circuit.add_RX_gate(i, Math.random());
    }
}

function entangler(circuit: QuantumCircuit, nqubits: number, pairs: number[][]) {
    pairs.forEach(pair => {
        circuit.add_CNOT_gate(pair[0], pair[1]);
    });
}

function build_circuit(nqubits: number, depth: number, pairs: number[][]) {
    const circuit = new QuantumCircuit(nqubits);
    first_rotation(circuit, nqubits);
    entangler(circuit, nqubits, pairs);
    for (let i = 0; i < nqubits; i++) {
        mid_rotation(circuit, nqubits);
        entangler(circuit, nqubits, pairs);
    }
    last_rotation(circuit, nqubits);
    return circuit;
}

function benchfunc_noopt(circuit: QuantumCircuit, nqubits: number) {
    const st = new QuantumState(nqubits);
    circuit.update_quantum_state(st);
}

function benchfunc(qco: QuantumCircuitOptimizer, circuit: QuantumCircuit, nqubits: number) {
    const st = new QuantumState(nqubits);
    qco.optimize_light(circuit)
    circuit.update_quantum_state(st);
}

function benchmark(targetFunc: (...args: any[]) => void, ...funcArguments: any[]) {
    const time = performance.now();
    targetFunc.apply<null, any[], void>(null, funcArguments);
    return performance.now() - time;
}

function test_QCBMopt(nqubits: number) {
    const group = "QCBMopt";
    const pairs: number[][] = [...Array(nqubits)].map((_, i) => { return [i, (i + 1) % nqubits]; });
    const circuit = build_circuit(nqubits, 9, pairs);
    const qco = new QuantumCircuitOptimizer();
    return benchmark(benchfunc, qco, circuit, nqubits);
}

function test_QCBM(nqubits: number) {
    const group = "QCBM";
    const pairs: number[][] = [...Array(nqubits)].map((_, i) => { return [i, (i + 1) % nqubits]; });
    const circuit = build_circuit(nqubits, 9, pairs);
    return benchmark(benchfunc_noopt, circuit, nqubits);
}

initQulacs()
.then(async () => {
    const timeScale = 1000;
    const nqubits_list = range(4, 26);
    const size = 1;

    const result_test_QCBMopt: any[] = [];
    nqubits_list.forEach(i => {
        let time = 0;
        [...Array(size)].forEach(_ => {time += test_QCBMopt(i);});
        time = time / size / timeScale;
        result_test_QCBMopt.push({qubits: i, time});
        console.log(`${i}: ${time}`)
    })

    const result_test_QCBM: any[] = [];

    nqubits_list.forEach(i => {
        const time = test_QCBM(i)/timeScale;
        result_test_QCBM.push({qubits: i, time});
        console.log(`${i}: ${time}`)
    })
    
    console.log({
        test_QCBMopt: result_test_QCBMopt,
        test_QCM: result_test_QCBM
    })
}).catch(e => {
    console.log("getExceptionMessage(e)", getExceptionMessage(e));
});
