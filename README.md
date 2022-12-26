# Qulacs Wasm

qulacs-wasm lets you use Qulacs in JavaScript via WebAssembly. It provides a convenient syntax similar to Qulacs on Python in JavaScript/TypeScript, and aims an efficient way to manipulate quantum computation on JavaScript runtime environment.

Qulacs and qulacs-wasm is licensed under the [MIT license](https://github.com/qulacs/qulacs/blob/master/LICENSE).

## Usage

```
npm install qulacs-wasm
```

```javascript
import { initQulacsModule, QuantumState, QuantumCircuit } from "qulacs-wasm";

initQulacsModule(S).then(_ => {
    const state = new QuantumState(2);
    state.set_zero_state();
    const circuit = new QuantumCircuit(2);
    circuit.add_H_gate(0);
    circuit.add_CNOT_gate(0, 1);
    circuit.update_quantum_state(state);
    console.log("getVec", state.get_vector());
    console.log("sampling", state.sampling(10));

});
```

```
get_vector [
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

See more details, `sample` dir.

## Build from source

Building qulacs-wasm involves building Qulacs and Boost, so those requirements must be satisfied, and Emscripten environment for qulacs-wasm.

### Requirements

- [Qulacs requirements](https://github.com/qulacs/qulacs#requirements)
- Emscripten (tested on v3.1.22)
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

