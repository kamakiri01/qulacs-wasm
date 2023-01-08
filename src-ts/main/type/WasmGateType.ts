import { OneControlOneTargetGateType, OneQubitGateType, OneQubitRotationGateType, PauliGateType, QuantumGateType, TwoControlOneTargetGateType } from "./QuantumGateType";

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
 * 2: angle(rad) 0~2
 */
export type WasmOneQubitRotationGateData = [OneQubitRotationGateType, number, number];

/**
 * 0: 量子ゲートの種類
 * 1: target量子ビットのindex
 * 2: control量子ビットのindex
 */
export type WasmOneControlOneTargetGateData = [OneControlOneTargetGateType, number, number];

/**
 * 0: 量子ゲートの種類
 * 1: target量子ビットのindex
 * 2: control量子ビットのindex
 * 3: control量子ビットのindex
 */
 export type WasmTwoControlOneTargetGateData = [TwoControlOneTargetGateType, number, number, number];

export type WasmQuantumGateData = WasmPauliGateData | WasmOneQubitGateData | WasmOneQubitRotationGateData | WasmOneControlOneTargetGateData | WasmTwoControlOneTargetGateData;
