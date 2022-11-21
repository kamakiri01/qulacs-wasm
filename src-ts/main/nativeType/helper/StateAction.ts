import { WasmVector } from "../../type/common";


/**
 * QuantumState.set~系操作をQunatumState#_operatorQueuesに積む際の表現定義
 * set系はゲート系ほどユーザが直接操作しないものとし、ToWasm型に分離しない
 */
export const StateActionType = {
    EMPTY: 0,
    "set_zero_state": 1,
    "set_computational_basis": 2,
    "set_Haar_random_state": 3,
    "load_wasmVector": 4, // WasmVector をロードする
    "load_ComplexSerialVector": 5, // Complex の直列化配列をロードする
} as const;
export type StateActionType = typeof StateActionType[keyof typeof StateActionType];

export type SetZeroStateAction = [typeof StateActionType.set_zero_state];
export type LoadWasmVectorStateAction = [typeof StateActionType.load_wasmVector, WasmVector];
export type LoadComplexSerialVectorStateAction = [typeof StateActionType.load_ComplexSerialVector, number[]];

export type StateAction = SetZeroStateAction | LoadWasmVectorStateAction | LoadComplexSerialVectorStateAction;
