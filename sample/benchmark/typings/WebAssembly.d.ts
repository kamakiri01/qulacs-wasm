/**
 * @see https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/959
 * @see https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/826
 * Node.js 向けの WebAssembly 型定義が提供されるまで、暫定で自前の型定義を使う
 */
import { BufferSource } from "stream/web";

declare global {
    interface WebAssemblyBase {
        compile(byte: BufferSource): Promise<WebAssembly.Module>;
    }
    declare var WebAssembly: WebAssemblyBase;    
}
