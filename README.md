# Qulacs Wasm

qulacs-wasm lets you use Qulacs in JavaScript via WebAssembly. It provides a convenient syntax similar to Qulacs on Python in JavaScript/TypeScript, and aims an efficient way to manipulate quantum computation on JavaScript runtime environment.

Qulacs and qulacs-wasm is licensed under the [MIT license](https://github.com/qulacs/qulacs/blob/master/LICENSE).

## Usage

```
npm install qulacs-wasm
```

```javascript
import { initQulacsModule, QuantumState, QuantumCircuit } from "qulacs-wasm";

initQulacsModule().then(_ => {
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

See more usage details, `sample` dir.

## Available class and method

- [x] X/Y/Z/H/T/S/RX/RY/RZ/RotX/RotY/RotZ/CNOT/CZ/Toffoli/QuantumGateMatrix
  - [x] get_matrix/to_matrix_gate/update_quantum_state/
  - [ ] add_control_qubit/copy/set_matrix/multiply_scalar/set_gate_property/
- [ ] invGates/DenseMatrix/SparseMatrix
- [x] QuantumCircuit
  - [x] update_quantum_state/add_gate/add_{}_gate
  - [ ] calculate_depth/add_parametric_{}_gate
- [ ] ParametricQuantumCircuit
- [x]QuantumState
  - [x] set_zero_state/set_computational_basis/set_Haar_random_state/get_vector/get_amplitude/get_qubit_count/get_zero_probability/load/allocate_buffer/sampling
  - [ ] add_state/multiply_coef/multiply_elementwise_function/get_squared_norm/normalize/set_classical_value/set_classical_value
- [ ] Observable/NoiseSimulator/CausalConeSimulator/

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

