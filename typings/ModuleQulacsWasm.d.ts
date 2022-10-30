// "@types/emscripten": "^1.39.6" では WebAssembly.instantiateのimportObject: WebAssembly.ImportsとinstantiateWasm関数のimportObject: Emscripten.WebAssemblyImportsに互換性がない
declare var ModuleQulacsWasm: EmscriptenWasm.ModuleFactory;

declare module "ModuleQulacsWasm" {
	export = ModuleQulacsWasm
}
