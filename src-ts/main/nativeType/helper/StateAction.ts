import { WasmVector } from "../../type/common";

// QuantumState.set~系操作をQunatumState#_operatorQueuesに積む際の表現定義

export const StateActionType = {
    EMPTY: 0,
    "set_zero_state": 1,
    "set_computational_basis": 2,
    "set_Haar_random_state": 3,
    "load_wasmVector": 4, // WasmVector をロードする
    "load_ComplexVector": 5, // Complex の直列化配列をロードする
} as const;
export type StateActionType = typeof StateActionType[keyof typeof StateActionType];

export type SetZeroStateAction = {
    type: typeof StateActionType.set_zero_state;
};

export type LoadWasmVectorStateAction = {
    type: typeof StateActionType.load_wasmVector;
    data: WasmVector;
};

export type LoadComplexVectorStateAction = {
    type: typeof StateActionType.load_ComplexVector;
    data: number[]; // Complex の real と imag を交互に並べた1次元配列
};

export type StateAction = SetZeroStateAction | LoadWasmVectorStateAction | LoadComplexVectorStateAction;
