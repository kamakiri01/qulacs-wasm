import { MultiQuantumGateType, ParametricQuantumGateType, PauliGateType, QuantumGateType, SingleQuantumGateType } from "./QuantumGateType";

export type QuantumGateBase = {
    /**
     * 量子ゲートの種類
     */
    type: QuantumGateType;
};

export type PauliGate = {
    type: PauliGateType;
}

export type SingleQuantumGate = PauliGate | {
    type: SingleQuantumGateType;
}

export type ParametricQuantumGate = QuantumGateBase & {
    type: ParametricQuantumGateType;
    
    /**
     * Math.PIに対する係数であり、0~2の実数
     */
    param: number;
}

export type MultiQuantumGate = QuantumGateBase & {
    type: MultiQuantumGateType;
    controllQubitIndex: number[];
  };
  
export type QuantumGate = SingleQuantumGate | ParametricQuantumGate | MultiQuantumGate;
