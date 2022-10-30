const { Worker } = require('worker_threads');
var ModuleQulacsWasm = require("../wasm/module.js");
import { QulacsWasmClient, QulacsWasmModule } from "./QulacsWasmClient";

export interface initQulacsModuleOption {
    useWorker: boolean;
}

export async function initQulacsModule(option: initQulacsModuleOption): Promise<QulacsWasmClient> {
    if (option.useWorker) {
        throw new Error("no work around");
        const qulacsModule = await initQulacsWorker();
        const client = new QulacsWasmClient({module: qulacsModule});
        return client;
    } else {
        const qulacsModule = await initQulacs();
        const client = new QulacsWasmClient({module: qulacsModule});
        return client;
    }
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


