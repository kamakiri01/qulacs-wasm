import { WasmVector } from "../../type/common";

// QuantumState.set~系操作をQunatumState#_operatorQueuesに積む際の表現定義

export const StateActionType = {
    EMPTY: 0,
    "set_zero_state": 1,
    "set_computational_basis": 2,
    "set_Haar_random_state": 3,
    "load": 4,
    "setWasmVector": 5 // setWasmVectorはstateの命令ではなく既存配列の転送用。loadなどで後日まとめるかもしれない
} as const;
export type StateActionType = typeof StateActionType[keyof typeof StateActionType];

export type StateAction = SetZeroStateAction | WasmVectorStateAction;

export type SetZeroStateAction = {
    type: typeof StateActionType.set_zero_state;
};

export type WasmVectorStateAction = {
    type: typeof StateActionType.setWasmVector;
    data: WasmVector;
};
