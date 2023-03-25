# Qulacs Wasm

qulacs-wasm lets you use Qulacs in JavaScript via WebAssembly. It provides a convenient syntax similar to Qulacs on Python in JavaScript/TypeScript, and aims an efficient way to manipulate quantum computation on JavaScript runtime environment.

Qulacs and qulacs-wasm is licensed under the [MIT license](https://github.com/qulacs/qulacs/blob/master/LICENSE).

## Usage

```
npm install qulacs-wasm
```

```javascript
import { initQulacs } from "qulacs-wasm";

initQulacs()
  .then(() => import("qulacs-wasm")) // dynamic import to get native class
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
  { real: 0.7071067811865475, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0.7071067811865475, imag: 0 }
]
sampling [
  0, 0, 3, 3, 3,
  0, 0, 0, 0, 0
]
```

[advanced.test](./test/tutorial/advanced.test.ts) satisfies the same use case as [Qulacs Python Advanced Guide](https://docs.qulacs.org/en/latest/guide/2.0_python_advanced.html) with TypeScript.

How to include .wasm file for your project, details in [sample](./sample/).

## non-available classes and methods

- [ ] GPU class (ex: QuantumStateGpu)
- [ ] long long int type (automatically cast to int)
- [ ] file access functions (ex: create_quantum_operator_from_openfermion_file / create_observable_from_openfermion_file / create_split_quantum_operator)

Pull Requests Welcome!

## How to import from external .wasm file

```javascript
import { initQulacs } from "qulacs-wasm/lib/nobundle";

const module = await WebAssembly.compile(fs.readFileSync("../path/to/module.wasm")); // Node.js
// const module = await WebAssembly.compileStreaming(fetch("module.wasm")); // online
await initQulacs({ module });
const { QuantumState, X } = await import("qulacs-wasm/lib/nobundle");
const state = new QuantumState(1);
(X(0)).update_quantum_state(state);
```

## Build qulacs-wasm from source

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
