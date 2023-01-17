import { StateAction } from "./StateAction";
import { WasmQuantumGateData } from "../../type/WasmQuantumGateData";

// ゲート操作やstate setなどの単位の操作
export const StateOperatorQueueType = {
    StateAction: "stateaction",
    Gate: "gate"
} as const;
export type StateOperatorQueueType = typeof StateOperatorQueueType[keyof typeof StateOperatorQueueType];

export type StateOperatorQueue = [typeof StateOperatorQueueType.StateAction, StateAction] | [typeof StateOperatorQueueType.Gate, WasmQuantumGateData];
