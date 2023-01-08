// QulacsWasmClientのユーザが塚う量子回路情報の型定義。

/**
 * アプリケーションで利用するパウリゲートの種類
 */
export const PauliGateType = {
  I: "i",
  X: "x",
  Y: "y",
  Z: "z"
} as const;
export type PauliGateType = typeof PauliGateType[keyof typeof PauliGateType];

/**
 * アプリケーションで利用する単一量子ビットに作用する量子ゲートの種類
 */
export const OneQubitGateType = {
  //EMPTY: undefined,
  H: "h",
  T: "t",
  S: "s",
  ...PauliGateType
} as const;
export type OneQubitGateType = typeof OneQubitGateType[keyof typeof OneQubitGateType];

/**
 * アプリケーションで利用するパラメータ付き単一量子ビットに作用する量子ゲートの種類
 */
export const OneQubitRotationGateType = {
  RX: "rx",
  RY: "ry",
  RZ: "rz",
  RotX: "rotx",
} as const;
export type OneQubitRotationGateType = typeof OneQubitRotationGateType[keyof typeof OneQubitRotationGateType];

export const OneControlOneTargetGateType = {
  CNOT: "cnot",
  CZ: "cz",
} as const;
export type OneControlOneTargetGateType = typeof OneControlOneTargetGateType[keyof typeof OneControlOneTargetGateType];


export const TwoControlOneTargetGateType = {
  CCNOT: "ccnot"
} as const;
export type TwoControlOneTargetGateType = typeof TwoControlOneTargetGateType[keyof typeof TwoControlOneTargetGateType];

export const QuantumGateType = {
  ...OneQubitGateType,
  ...OneQubitRotationGateType,
  ...OneControlOneTargetGateType,
  ...TwoControlOneTargetGateType,
}
export type QuantumGateType = OneQubitGateType | OneQubitRotationGateType | TwoControlOneTargetGateType | OneControlOneTargetGateType;
