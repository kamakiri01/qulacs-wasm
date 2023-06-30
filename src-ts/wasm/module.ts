// NOTE: このファイルはtscビルドを通す型定義のためだけに利用する。ビルド後の本ファイルはemscriptenのmodule.jsに上書きされる
import {EmscriptenWasm} from "./emscriptem-types";
import { QulacsWasmModule } from "../main/emsciptenModule/QulacsWasmModule";

declare const ModuleQulacsWasm: EmscriptenWasm.ModuleFactory<QulacsWasmModule>;
export = ModuleQulacsWasm;
