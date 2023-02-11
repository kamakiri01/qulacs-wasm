import { initQulacsModule } from "qulacs-wasm";

self.onmessage = function (event) {
    const module = event.data;
    initQulacsModule({module})
        .then(() => import("qulacs-wasm"))
        .then(({ QuantumState }) => {
            const state = new QuantumState(3);
            self.postMessage(state.get_vector());
        });
};
