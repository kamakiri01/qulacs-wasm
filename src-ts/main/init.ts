var ModuleQulacsWasm = require("../wasm/module.js");
import { Observable } from "./nativeType/Observable";
import { QuantumCircuit } from "./nativeType/QuantumCircuit";
import { QuantumState } from "./nativeType/QuantumState";
import { QulacsNativeClassClient } from "./client/QulacsNativeClassClient/QulacsNativeClassClient";
import { QulacsClient } from "./client/QulacsClient/QulacsClient";
import { QulacsWasmModule } from "./emsciptenModule/QulacsWasmModule";

export interface InitQulacsModuleOption {
    module?: WebAssembly.Module;
    // instantiateWasm(importObject: WebAssembly.Imports, successCallback: (module: WebAssembly.Module) => void): void;
}

export async function initQulacsModule(option: InitQulacsModuleOption = {}): Promise<QulacsClient> {
    let qulacsModule: QulacsWasmModule;
    if (option.module) {
        qulacsModule = await initQulacsFromModule(option.module);
    } else {
        qulacsModule = await initQulacs();
    }

    const wasmClient = new QulacsClient({module: qulacsModule});
    const nativeClient = new QulacsNativeClassClient({module: qulacsModule});
    setStaticClient(nativeClient);
    return wasmClient;
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
                .catch(e => reject);
        }
        ModuleQulacsWasm({ instantiateWasm: onInstantiateWasm })
            .then((emscriptenModule: EmscriptenWasm.Module) => {
                resolve(emscriptenModule as QulacsWasmModule);
            })
            .catch((e: any) => reject);
        });
}

function setStaticClient(client: QulacsNativeClassClient) {
    QuantumState.client = client;
    QuantumCircuit.client = client;
    Observable.client = client;
}
