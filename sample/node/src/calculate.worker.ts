import { initQulacsModule, QuantumState } from "qulacs-wasm";
import { parentPort } from "worker_threads";

parentPort!.on("message", (message: any) => {
    const module = message.data;
    initQulacsModule({module})
        .then(_ => {
            var state = new QuantumState(3);
            parentPort!.postMessage(state.get_vector());
        });
    });
