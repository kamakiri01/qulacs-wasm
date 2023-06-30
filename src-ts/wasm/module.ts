// NOTE: このファイルはtscビルドを通す型整合性のためだけに利用し、publishには含まない。このファイルはnpm run build終了時点でemscriptenのmodule.jsに上書きされる
import {EmscriptenWasm} from "./emscriptem-types";
import { QulacsWasmModule } from "../main/emsciptenModule/QulacsWasmModule";

declare const ModuleQulacsWasm: EmscriptenWasm.ModuleFactory<QulacsWasmModule>;
export = ModuleQulacsWasm;
