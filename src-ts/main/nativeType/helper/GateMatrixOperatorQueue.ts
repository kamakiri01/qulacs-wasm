import { WasmComplexMatrix } from "../../type/common";

export const GateMatrixOperatorQueueType = {
    InitVec: "initvec",
    InitCppMat: "initcppmat",
    AddControlQubit: "addcontrolqubit"
} as const;
export type GateMatrixOperatorQueueType = typeof GateMatrixOperatorQueueType[keyof typeof GateMatrixOperatorQueueType];

/**
 * 0: キューの種類
 * 1: target_qubit_index_list
 * 2: matrix。複素数の実部・虚部を並べた1次元配列
 * 3: control_qubit_index_list
 */
export type InitVecQueue = [typeof GateMatrixOperatorQueueType.InitVec, number[], number[], number[]];

// export type InitCppMatQueue = [typeof GateMatrixOperatorQueueType.InitCppMat,number[], WasmComplexMatrix<unknown>, number[]];

export type AddControlQubitQueue = [typeof GateMatrixOperatorQueueType.AddControlQubit, number]

/**
 * QuantumState の操作ログ
 */
export type GateMatrixOperatorQueue = InitVecQueue | /* InitCppMatQueue | */ AddControlQubitQueue;
