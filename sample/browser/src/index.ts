import { initQulacsModule } from "qulacs-wasm";

const USE_WORKER = true;
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
    initQulacsModule()
        .then(() => import("qulacs-wasm"))
        .then(({ QuantumState }) => {
            const state = new QuantumState(3);
            console.log("state vector", state.get_vector());
        });
};
