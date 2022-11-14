const { Worker } = require('worker_threads');
var ModuleQulacsWasm = require("../wasm/module.js");
import { Observable } from "./nativeType/Observable";
import { QuantumCircuit } from "./nativeType/QuantumCircuit";
import { QuantumState } from "./nativeType/QuantumState";
import { QulacsNativeClient } from "./client/QulacsNativeClient/QulacsNativeClient";
import { QulacsWasmClient } from "./client/QulacsWasmClient/QulacsWasmClient";
import { QulacsWasmModule } from "./emsciptenModule/QulacsWasmModule";

export interface initQulacsModuleOption {
    useWorker: boolean;
}

export async function initQulacsModule(option: initQulacsModuleOption): Promise<QulacsWasmClient> {
    let qulacsModule: QulacsWasmModule;
    if (option.useWorker) {
        throw new Error("no work around");
        qulacsModule = await initQulacsWorker();
    } else {
        qulacsModule = await initQulacs();
    }
    const wasmClient = new QulacsWasmClient({module: qulacsModule});
    const nativeClient = new QulacsNativeClient({module: qulacsModule});
    setStaticClient(nativeClient);
    return wasmClient;
}

function initQulacs(): Promise<QulacsWasmModule> {
    return Promise.resolve(ModuleQulacsWasm());
}

function initQulacsWorker(): Promise<QulacsWasmModule> {
    return new Promise((resolve, reject) => {
        let compiledModule: WebAssembly.Module;
        let emscriptenModule: EmscriptenWasm.Module;
        const worker = new Worker(new URL("../worker/prefetch.worker.js"));
        function onInstantiateWasm(importObject: WebAssembly.Imports, successCallback: (module: WebAssembly.Module) => void) {
            WebAssembly.instantiate(compiledModule, importObject)
                .then(instance => {
                    successCallback(instance);
                });
                return {} as WebAssembly.Exports; // Instanceを使えば同期的にinstance.exportsを返せるがいったん保留
    
        }
        worker.onmessage = function(event: any) {
            compiledModule = event.data;
            const m = ModuleQulacsWasm({ instantiateWasm: onInstantiateWasm })
                .then((module: EmscriptenWasm.Module) => {
                    emscriptenModule = module;
                    resolve(module as QulacsWasmModule);
                })
    
        }
        worker.postMessage("startFetch");
    })
}

function setStaticClient(client: QulacsNativeClient) {
    QuantumState.client = client;
    QuantumCircuit.client = client;
    Observable.client = client;
}
