import { initQulacs } from "qulacs-wasm";
import { parentPort } from "worker_threads";

parentPort!.on("message", (message: any) => {
    const module = message.data;
    initQulacs({module})
    .then(() => import("qulacs-wasm"))
    .then(({ QuantumState }) => {
        const state = new QuantumState(3);
        parentPort!.postMessage(state.get_vector());
    });
});
