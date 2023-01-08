import { OneQubitGateType, OneQubitRotationGateType, PauliGateType, QuantumGateType } from "./QuantumGateType";

// wasmとの通信に使う量子回路情報の型定義。一部の構造を配列化してwasmでの読み取りを簡単にする。
// 通常、本ライブラリのユーザがこの型を使う必要はない。

/**
 * 0: 量子ゲートの種類
 * 1: target量子ビットのindex
 */
export type WasmPauliGateData = [PauliGateType, number];

/**
 * 0: 量子ゲートの種類
 * 1: target量子ビットのindex
 */
export type WasmOneQubitGateData = [OneQubitGateType, number];

/**
 * 0: 量子ゲートの種類
 * 1: target量子ビットのindex
 * 2: angle
 */
export type WasmOneQubitRotationGateData = [OneQubitRotationGateType, number, number];

/**
 * 0: 量子ゲートの種類
 * 1: target量子ビットのindex
 * 2: RX/RY/RZにおける回転角。Math.PIに対する係数であり、0~2
 * 3: CNOT/CCNOTにおける制御量子ビットのindexs配列
 */
export type WasmQuantumGateData = WasmPauliGateData | WasmOneQubitGateData | WasmOneQubitRotationGateData | [QuantumGateType, number, number, number[]];
