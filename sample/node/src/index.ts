import { initQulacsModule, QuantumState } from "qulacs-wasm";

initQulacsModule().then(_ => {
    var state = new QuantumState(3);
    console.log("getVec", state.get_vector());
});