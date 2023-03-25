import * as fs from "fs";
import * as path from "path";
import { Worker } from "worker_threads";
import { initQulacs } from "qulacs-wasm";

const USE_WORKER = false;
if (USE_WORKER) {
    WebAssembly.compile(fs.readFileSync(path.join(__dirname, "./module.wasm"))) // you can also compile .wasm in your Worker
        .then(module => {
            const worker = new Worker(path.join(__dirname, "./calculate.worker.js"));
            worker.on("message", (event: any) => {
                console.log("state vector", event);
                worker.terminate().then(_ => process.exit(0));
            });
            worker.postMessage(module);
    })
} else {
    initQulacs()
        .then(async () => {
            const { QuantumState, QuantumCircuit } = await import("qulacs-wasm");
            const state = new QuantumState(3);
            const circuit = new QuantumCircuit(3);
            circuit.add_X_gate(0);
            circuit.update_quantum_state(state);
            console.log("state vector", state.get_vector());
        });
};
