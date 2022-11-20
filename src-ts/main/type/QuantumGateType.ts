// QulacsWasmClientのユーザが塚う量子回路情報の型定義。

/**
 * アプリケーションで利用するパウリゲートの種類
 */
export const PauliGateType = {
  X: "x",
  Y: "y",
  Z: "z"
} as const;
export type PauliGateType = typeof PauliGateType[keyof typeof PauliGateType];

/**
 * アプリケーションで利用する単一量子ビットに作用する量子ゲートの種類
 */
export const SingleQuantumGateType = {
  EMPTY: undefined,
  H: "h",
  T: "t",
  S: "s",
  ...PauliGateType
} as const;
export type SingleQuantumGateType = typeof SingleQuantumGateType[keyof typeof SingleQuantumGateType];

/**
 * アプリケーションで利用するパラメータ付き単一量子ビットに作用する量子ゲートの種類
 */
export const ParametricQuantumGateType = {
  RX: "rx",
  RY: "ry",
  RZ: "rz",
} as const;
export type ParametricQuantumGateType = typeof ParametricQuantumGateType[keyof typeof ParametricQuantumGateType];

export const MultiQuantumGateType = {
  CNOT: "cnot",
  CCNOT: "ccnot"
} as const;
export type MultiQuantumGateType = typeof MultiQuantumGateType[keyof typeof MultiQuantumGateType];

export const QuantumGateType = {
  ...SingleQuantumGateType,
  ...ParametricQuantumGateType,
  ...MultiQuantumGateType
} 
export type QuantumGateType = SingleQuantumGateType | ParametricQuantumGateType | MultiQuantumGateType;
