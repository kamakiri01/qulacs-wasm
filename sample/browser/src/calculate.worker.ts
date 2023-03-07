import { initQulacs } from "qulacs-wasm";

self.onmessage = function (event) {
    const module = event.data;
    initQulacs({module})
        .then(() => import("qulacs-wasm"))
        .then(({ QuantumState }) => {
            const state = new QuantumState(3);
            self.postMessage(state.get_vector());
        });
};
