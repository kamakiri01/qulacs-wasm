// wasmとの通信に使う量子回路情報の型定義。一部の構造を配列化してwasmでの読み取りを簡単にする。
// 通常、本ライブラリのユーザがこの型を使う必要はない。

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

/**
 * 0: 量子ゲートの種類
 * 1: RX/RY/RZにおける回転角。Math.PIに対する係数であり、0~2
 * 2: CNOT/CCNOTにおける制御量子ビットのindex
 */
export type ToWasmRawQuantumGate = [ToWasmRawGateType, number, number[]];