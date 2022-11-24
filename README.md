# Qulacs Wasm

qulacs-wasm lets you use Qulacs in JavaScript via WebAssembly. It provides a convenient syntax similar to Qulacs on Python in JavaScript/TypeScript, and aims an efficient way to manipulate quantum computation on JavaScript.

Qulacs and qulacs-wasm is licensed under the [MIT license](https://github.com/qulacs/qulacs/blob/master/LICENSE).

## Usage

```
npm install qulacs-wasm
```

## Installation and build from source

### Requirements

- [Qulacs requirements](https://github.com/qulacs/qulacs#requirements)
- Emscripten (tested on v3.1.22)
- Node.js/npm (tested on Node.js v18.3.0 / npm 8.11.0)

tested on the following systems.

- Ubuntu 20.04.3 LTS (on WSL2)

```
npm run submodule:clone-recursive
npm run submodule:qulacs:wasm-optimization
npm run submodule:boost:build
npm run submodule:qulacs:build
npm run build:tsc
npm run build:emscripten
```

