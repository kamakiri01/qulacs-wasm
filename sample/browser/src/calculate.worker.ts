import { initQulacsModule, QuantumState } from "qulacs-wasm";

self.onmessage = function (event) {
    const module = event.data;
    initQulacsModule({module})
        .then(_ => {
            var state = new QuantumState(3);
            self.postMessage(state.get_vector());
        });
};
