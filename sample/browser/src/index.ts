import { initQulacsModule, QuantumState } from "qulacs-wasm";
const USE_WORKER = true;
if (USE_WORKER) {
    let wasmModule: WebAssembly.Module;
    WebAssembly.compileStreaming(fetch("module.wasm")) // you can also fetch .wasm in your Worker
        .then(module => {
            wasmModule = module;
            const worker = new Worker("./calculate.worker.js");
            worker.onmessage = function(event: unknown) {
                console.log("getVec", (<MessageEvent>event).data);
            };
            worker.postMessage(module);
        });
} else {
    initQulacsModule({}).then(_ => {
        var state = new QuantumState(3);
        console.log("getVec", state.get_vector());
    });
}
