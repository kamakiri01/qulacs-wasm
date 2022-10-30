// QulacsWasmClientのユーザが塚う量子回路情報の型定義。

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
    param?: number, // RX/RY/RZにおける回転角。Math.PIに対する係数であり、0~2
    controllQubitIndex?: number[] // CNOT/CCNOTにおける制御量子ビットのindex
}
