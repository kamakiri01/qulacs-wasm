# Qulacs Wasm

qulacs-wasm lets you use [Qulacs](https://github.com/qulacs/qulacs) in JavaScript via WebAssembly. It provides a convenient syntax similar to Qulacs on Python in JavaScript/TypeScript, and aims an efficient way to manipulate quantum computation on JavaScript runtime environment.

Qulacs and qulacs-wasm is licensed under the [MIT license](https://github.com/qulacs/qulacs/blob/master/LICENSE).

## Usage

```
npm install qulacs-wasm
```

```javascript
import { initQulacs } from "qulacs-wasm";

initQulacs()
  .then(async () => {
    const { QuantumState, QuantumCircuit } = await import("qulacs-wasm");
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

## Features

- Almost fully Qulacs on Python compatible interface (except for direct json file access)
- Very fast quantum circuit simulation in JavaScript environments
- Provides TypeScript d.ts
- Support for external loading of .wasm file

[Qulacs Python Advanced Guide](https://docs.qulacs.org/en/latest/guide/2.0_python_advanced.html) use case is implemented by TypeScript in [advanced-guide.test.ts](./test/tutorial/advanced-guide.test.ts).

## Performance

The time to simulate a random quantum circuit is compared to the original Qulacs(November 2020).

This benchmark test complies with [benchmark-qulacs](https://github.com/qulacs/benchmark-qulacs) and you can see the detail [here](./sample/benchmark/).

### Single-thread benchmark

![single thread benchmark](https://user-images.githubusercontent.com/3122541/228353793-48d629d1-3f4a-4f69-875e-4e4babb81762.png)

## How to import from external .wasm file

qulacs-wasm automatically loads bundled wasm binary, but can also load it externally. This helps manage js bundle size.

```javascript
import { initQulacs } from "qulacs-wasm/lib/nobundle";

const module = await WebAssembly.compile(fs.readFileSync("../path/to/module.wasm")); // Node.js
// const module = await WebAssembly.compileStreaming(fetch("module.wasm")); // online
await initQulacs({ module });
const { QuantumState, X } = await import("qulacs-wasm/lib/nobundle");
const state = new QuantumState(1);
(X(0)).update_quantum_state(state);
```

How to include .wasm file for your project, details in [sample](./sample/).

## Build qulacs-wasm from source

Building qulacs-wasm involves building Qulacs and Boost, so those requirements must be satisfied, and Emscripten environment for qulacs-wasm.

### Requirements

- [Qulacs requirements](https://github.com/qulacs/qulacs#requirements) (tested on [v0.5.6](https://github.com/qulacs/qulacs/tree/v0.5.6))
- Emscripten (tested on v3.1.22 by emscripten-core/emsdk)
  - need `em++` command
- Node.js/npm (tested on Node.js v22.21.1/npm 10.9.4)
  - some version included in Emscripten environment

tested on the following systems.

- Ubuntu 20.04.3 LTS (on WSL2)

```
npm run init
npm run submodule:build
npm install
npm run build
```

## Non-available classes and functions

- [ ] GPU class (ex: QuantumStateGpu)
- [ ] ITYPE(long long int) type (automatically cast to int)
- [ ] file access functions (ex: create_quantum_operator_from_openfermion_file / create_observable_from_openfermion_file / create_split_quantum_operator)
- [ ] Multi-thread (limited by currently  WebAssembly Specifications)

Pull Requests Welcome!
