import { initQulacs } from "qulacs-wasm";

const USE_WORKER = false;
if (USE_WORKER) {
    WebAssembly.compileStreaming(fetch("module.wasm")) // you can also compile .wasm in your Worker
        .then(module => {
            const worker = new Worker("./calculate.worker.js");
            worker.onmessage = function(event: unknown) {
                console.log("state vector", (<MessageEvent>event).data);
            };
            worker.postMessage(module);
        });
} else {
    initQulacs()
        .then(async () => {
            const { QuantumState } =  await import("qulacs-wasm");
            const state = new QuantumState(3);
            console.log("state vector", state.get_vector());
        });
};
