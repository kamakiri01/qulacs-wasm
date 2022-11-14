import { IndexedToWasmDefaultQuantumGate } from "./IndexedToWasmDefaultQuantumGate";
import {StateAction } from "./StateAction";

export const OperatorQueueType = {
    StateAction: "stateAction",
    Gate: "gate"
} as const;
export type OperatorQueueType = typeof OperatorQueueType[keyof typeof OperatorQueueType];

export type StateActionOperatorQueue = {
    queueType: typeof OperatorQueueType.StateAction;
    queueData: StateAction;
};

export type QuantumGateOperatorQueue = {
    queueType: typeof OperatorQueueType.Gate;
    queueData: IndexedToWasmDefaultQuantumGate;
};

/**
 * QuantumState の操作ログ
 */
export type OperatorQueue = QuantumGateOperatorQueue | StateActionOperatorQueue;
