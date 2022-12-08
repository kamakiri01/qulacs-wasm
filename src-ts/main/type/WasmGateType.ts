// wasmとの通信に使う量子回路情報の型定義。一部の構造を配列化してwasmでの読み取りを簡単にする。
// 通常、本ライブラリのユーザがこの型を使う必要はない。

export const WasmPauliGateType = {
    EMPTY: "0",
    X: "x",
    Y: "y",
    Z: "z"
} as const;
export type WasmPauliGateType = typeof WasmPauliGateType[keyof typeof WasmPauliGateType];

export const WasmQuantumGateType = {
    ...WasmPauliGateType,
    H: "h",
    T: "t",
    S: "s",
    RX: "rx",
    RY: "ry",
    RZ: "rz",
    CNOT: "cnot",
    CCNOT: "ccnot"
} as const;
export type WasmQuantumGateType = typeof WasmQuantumGateType[keyof typeof WasmQuantumGateType];

export type WasmPauliGate = [WasmPauliGateType, 0, []];

/**
 * 0: 量子ゲートの種類
 * 1: RX/RY/RZにおける回転角。Math.PIに対する係数であり、0~2
 * 2: CNOT/CCNOTにおける制御量子ビットのindex
 */
export type WasmQuantumGate = WasmPauliGate | [WasmQuantumGateType, number, number[]];
