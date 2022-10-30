// QulacsWasmClientのユーザが塚う量子回路情報の型定義。

import type { ToWasmGateControllIndex, ToWasmGateParameter } from "./CommonGateType";

export const ToWasmDefaultGateType = {
    EMPTY: undefined,
    X: "x",
    Y: "y",
    Z: "z",
    H: "h",
    T: "t",
    S: "s",
    RX: "rx",
    RY: "ry",
    RZ: "rz",
    CNOT: "cnot",
    CCNOT: "ccnot"
} as const;
  export type ToWasmDefaultGateType = typeof ToWasmDefaultGateType[keyof typeof ToWasmDefaultGateType];


export type ToWasmDefaultQuantumGate = {
    type: ToWasmDefaultGateType,
    param?: ToWasmGateParameter, // RX/RY/RZのみ
    controllQubitIndex?: ToWasmGateControllIndex // CNOT/CCNOTのみ
}
