// wasmとの通信に使う量子回路情報の型定義。一部の構造を配列化してwasmでの読み取りを簡単にする。
// 通常、本ライブラリのユーザがこの型を使う必要はない。

import type { ToWasmGateControllIndex, ToWasmGateParameter } from "./CommonGateType";

export const ToWasmRawGateType = {
    EMPTY: 0,
    X: 1,
    Y: 2,
    Z: 3,
    H: 4,
    T: 5,
    S: 6,
    RX: 7,
    RY: 8,
    RZ: 9,
    CNOT: 10,
    CCNOT: 11
} as const;
export type ToWasmRawGateType = typeof ToWasmRawGateType[keyof typeof ToWasmRawGateType];

export type ToWasmRawQuantumGate = [ToWasmRawGateType, ToWasmGateParameter, ToWasmGateControllIndex];
