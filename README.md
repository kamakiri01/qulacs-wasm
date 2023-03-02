# Qulacs Wasm

qulacs-wasm lets you use Qulacs in JavaScript via WebAssembly. It provides a convenient syntax similar to Qulacs on Python in JavaScript/TypeScript, and aims an efficient way to manipulate quantum computation on JavaScript runtime environment.

Qulacs and qulacs-wasm is licensed under the [MIT license](https://github.com/qulacs/qulacs/blob/master/LICENSE).

## Usage

```
npm install qulacs-wasm
```

```javascript
import { initQulacsModule } from "qulacs-wasm";

initQulacsModule()
  .then(() => import("qulacs-wasm")) // need dynamic import to get native class
  .then({ QuantumState, QuantumCircuit } => {
      const qubitCount = 2;
      const state = new QuantumState(qubitCount);
      state.set_zero_state();
      const circuit = new QuantumCircuit(qubitCount);
      circuit.add_H_gate(0);
      circuit.add_CNOT_gate(0, 1);
      circuit.update_quantum_state(state);
      console.log("state vector ", state.get_vector());
      console.log("sampling", state.sampling(10)); // sampling may return 0th/3th base state with equal probability
});
```

```
state vector [
  { re: 0.7071067811865475, im: 0 },
  { re: 0, im: 0 },
  { re: 0, im: 0 },
  { re: 0.7071067811865475, im: 0 }
]
sampling [
  0, 0, 3, 3, 3,
  0, 0, 0, 0, 0
]
```

You can see more usage and how to include .wasm file for your project, in `sample` dir.

## Available Classes and Methods

- [x] Identity/ X / Y / Z / H / S / Sdag / T / Tdag / RX / RY / RZ / RotX / RotY / RotZ / RotInvX / RotInvY / RotInvZ / CNOT / CZ / SWAP / TOFFOLI / QuantumGateMatrix
  - [ ] set_matrix / set_gate_property / etc
- [ ] DenseMatrix / SparseMatrix
- [x] QuantumCircuit
- [x] ParametricQuantumCircuit
- [x] QuantumState / DensityMatrix
- [ ] Observable / NoiseSimulator / CausalConeSimulator / etc
- [x] partial_trace / to_matrix_gate / inner_product / tensor_product / make_superposition / make_mixture

## Build from source

Building qulacs-wasm involves building Qulacs and Boost, so those requirements must be satisfied, and Emscripten environment for qulacs-wasm.

### Requirements

- [Qulacs requirements](https://github.com/qulacs/qulacs#requirements) (tested on [v0.5.2](https://github.com/qulacs/qulacs/tree/9739c28c6c9fd2981e3e4ddf9f11b003b3b8a84d))
- Emscripten (tested on v3.1.22)
  - need `em++` command
- Node.js/npm (tested on Node.js v18.3.0/npm 8.11.0)
  - some version included in Emscripten environment

tested on the following systems.

- Ubuntu 20.04.3 LTS (on WSL2)

```
npm run init
npm run submodule:build
npm install
npm run build
```
