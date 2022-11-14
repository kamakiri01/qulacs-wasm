import { ToWasmDefaultQuantumGate } from "../../type/DefaultGateType";

/**
 * 量子回路のカラム単位を表現する
 * NOTE: この型はユーザが直接生成しないため、 ToWasmRawGateType を拡張する方針に変更することも検討する
 */
export type IndexedToWasmDefaultQuantumGate = ToWasmDefaultQuantumGate & {
    /**
     * 何番目の量子ビットか
     */
    index: number;
};
