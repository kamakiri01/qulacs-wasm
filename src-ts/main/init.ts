import ModuleQulacsWasm from "../wasm/module";
import { EmscriptenWasm } from "../wasm/emscriptem-types";
import { QulacsWasmModule } from "./emsciptenModule/QulacsWasmModule";
import { applyModule } from "./instance";

export interface InitQulacsOption {
    module?: WebAssembly.Module;
}

export async function initQulacs(option: InitQulacsOption = {}): Promise<QulacsWasmModule> {
    let qulacsModule: QulacsWasmModule;
    if (option.module) {
        qulacsModule = await _initQulacsFromModule(option.module);
    } else {
        qulacsModule = await _initQulacs();
    }

    applyModule(qulacsModule);
    return qulacsModule;
}

function _initQulacs(): Promise<QulacsWasmModule> {
    return Promise.resolve(ModuleQulacsWasm());
}

function _initQulacsFromModule(compiledModule: WebAssembly.Module): Promise<QulacsWasmModule> {
    return new Promise((resolve, reject) => {
        function onInstantiateWasm(importObject: WebAssembly.Imports, successCallback: (module: WebAssembly.Module) => void) {
            WebAssembly.instantiate(compiledModule, importObject)
                .then(instance => {
                    successCallback(instance);
                })
                .catch(e => reject(e));
                return undefined!; // NOTE: @types/emscriptenでは不要なnon-null assertionかもしれない
        }
        ModuleQulacsWasm({ instantiateWasm: onInstantiateWasm })
            .then((emscriptenModule: EmscriptenWasm.Module) => {
                resolve(emscriptenModule as QulacsWasmModule);
            })
            .catch((e: any) => reject(e));
        });
}
