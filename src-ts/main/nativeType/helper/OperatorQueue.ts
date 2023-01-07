import {StateAction } from "../../type/StateAction";
import { QuantumGateBase } from "../QuantumGate/QuantumGateBase";

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
    queueData: QuantumGateBase;
};

/**
 * QuantumState の操作ログ
 */
export type OperatorQueue = QuantumGateOperatorQueue | StateActionOperatorQueue;
