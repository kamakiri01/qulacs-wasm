import * as fs from "fs";
import * as path from "path";
import { Worker } from "worker_threads";
import { initQulacsModule } from "qulacs-wasm";

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
    initQulacsModule()
        .then(() => import("qulacs-wasm"))
        .then(({ QuantumState }) => {
            const state = new QuantumState(3);
            console.log("state vector", state.get_vector());
        });
};
