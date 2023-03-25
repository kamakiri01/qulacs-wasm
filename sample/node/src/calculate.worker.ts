import { initQulacs } from "qulacs-wasm";
import { parentPort } from "worker_threads";

parentPort!.on("message", (message: any) => {
    const module = message.data;
    initQulacs({module})
    .then(async () => {
        const { QuantumState } = await import("qulacs-wasm");
        const state = new QuantumState(3);
        parentPort!.postMessage(state.get_vector());
    });
});
