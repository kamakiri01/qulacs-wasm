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
        .then(async () => import("qulacs-wasm"))
        .then(({ QuantumState }) => {
            const state = new QuantumState(3);
            console.log("state vector", state.get_vector());

            //test
            const s1 = new QuantumState(1);
            const s2: any = new QuantumState(1);
            console.log("START");
            s2.load2(s1);
            console.log("s2-1", s2);
            s2.load_Vector([99,999]);
            s2.load([99,999]);
            console.log("S2-2", s2);
            s2.load2(s1);
            s2.load(s1);
            console.log("S2-3", s2);

        });
};
