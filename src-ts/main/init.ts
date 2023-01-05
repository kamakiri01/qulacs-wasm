var ModuleQulacsWasm = require("../wasm/module.js");
import { Observable } from "./nativeType/Observable";
import { QuantumCircuit } from "./nativeType/QuantumCircuit";
import { QuantumState } from "./nativeType/QuantumState";
import { QulacsNativeClassClient } from "./client/QulacsNativeClassClient/QulacsNativeClassClient";
import { QulacsWasmModule } from "./emsciptenModule/QulacsWasmModule";

export interface InitQulacsModuleOption {
    module?: WebAssembly.Module;
}

export async function initQulacsModule(option: InitQulacsModuleOption = {}): Promise<void> {
    let qulacsModule: QulacsWasmModule;
    if (option.module) {
        qulacsModule = await initQulacsFromModule(option.module);
    } else {
        qulacsModule = await initQulacs();
    }

    const nativeClient = new QulacsNativeClassClient({module: qulacsModule});
    setStaticClient(nativeClient);
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

function setStaticClient(client: QulacsNativeClassClient) {
    QuantumState.client = client;
    QuantumCircuit.client = client;
    Observable.client = client;
}
