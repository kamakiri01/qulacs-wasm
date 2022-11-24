import { WasmVector } from "../../type/common";


/**
 * QuantumState.set~系操作をQunatumState#_operatorQueuesに積む際の表現定義
 * set系はゲート系ほどユーザが直接操作しないものとし、ToWasm型に分離しない
 */
export const StateActionType = {
    EMPTY: 0,
    "set_zero_state": 1,
    "set_computational_basis": 2,
    "set_Haar_random_state_no_seed": 3,
    "set_Haar_random_state_seed": 4,
    "load_wasmVector": 5, // WasmVector をロードする
    "load_ComplexSerialVector": 6, // Complex の直列化配列をロードする
} as const;
export type StateActionType = typeof StateActionType[keyof typeof StateActionType];

export type SetZeroStateAction = [typeof StateActionType.set_zero_state];
export type SetComputationalBasisAction = [typeof StateActionType.set_computational_basis, number]; // require: number is int
export type SetHaarRandomStateNoSeed = [typeof StateActionType.set_Haar_random_state_no_seed];
export type SetHaarRandomStateSeed = [typeof StateActionType.set_Haar_random_state_seed, number]; // require: number is uint
export type LoadWasmVectorStateAction = [typeof StateActionType.load_wasmVector, WasmVector];
export type LoadComplexSerialVectorStateAction = [typeof StateActionType.load_ComplexSerialVector, number[]];

export type StateAction =
    SetZeroStateAction |
    LoadWasmVectorStateAction | LoadComplexSerialVectorStateAction |
    SetComputationalBasisAction |
    SetHaarRandomStateNoSeed | SetHaarRandomStateSeed;
