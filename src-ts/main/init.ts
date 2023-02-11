const ModuleQulacsWasm = require("../wasm/module.js");
import { QulacsWasmModule } from "./emsciptenModule/QulacsWasmModule";
import { applyModule } from "./instance";

export interface InitQulacsModuleOption {
    module?: WebAssembly.Module;
}

export async function initQulacsModule(option: InitQulacsModuleOption = {}): Promise<QulacsWasmModule> {
    let qulacsModule: QulacsWasmModule;
    if (option.module) {
        qulacsModule = await initQulacsFromModule(option.module);
    } else {
        qulacsModule = await initQulacs();
    }

    applyModule(qulacsModule);
    return qulacsModule;
}

function initQulacs(): Promise<QulacsWasmModule> {
    return Promise.resolve(ModuleQulacsWasm());
}

function initQulacsFromModule(compiledModule: WebAssembly.Module): Promise<QulacsWasmModule> {
    return new Promise((resolve, reject) => {
        function onInstantiateWasm(importObject: WebAssembly.Imports, successCallback: (module: WebAssembly.Module) => void) {
            WebAssembly.instantiate(compiledModule, importObject)
                .then(instance => {
                    successCallback(instance);
                })
                .catch(e => reject(e));
        }
        ModuleQulacsWasm({ instantiateWasm: onInstantiateWasm })
            .then((emscriptenModule: EmscriptenWasm.Module) => {
                resolve(emscriptenModule as QulacsWasmModule);
            })
            .catch((e: any) => reject(e));
        });
}
