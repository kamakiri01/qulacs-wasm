import { EmscriptenWasm } from "../../wasm/emscriptem-types";
export interface QulacsWasmModule extends EmscriptenWasm.Module {
    //QuantumState: QuantumStateI; // NOTE: applyModuleのObject.keysで取得するため、メンバを型では直接参照しない。そのため、ここでメンバを定義する必要はない
    getExceptionMessage(exceptionPtr: number): string;
}
