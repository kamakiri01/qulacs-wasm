import { ToWasmSerialInfo } from "../../emsciptenModule/QulacsWasmModule";
import { OperatorQueue, OperatorQueueType, StateActionOperatorQueue } from "../../nativeType/helper/OperatorQueue";
import { StateActionType } from "../../nativeType/helper/StateAction";
import { WasmVector } from "../../type/common";
import { ToWasmDefaultGateType } from "../../type/DefaultGateType";
import { ToWasmRawQuantumGate } from "../../type/RawGateType";
import { translateDefaultGateToWasmGate } from "../QulacsWasmClient/toWasmUtil";

type ToWasmStateAction = [StateActionType] | [StateActionType, WasmVector]; // 暫定としてset_zeroとWasmVector使うsetだけ考える

// ゲート操作やstate setなどの単位の操作
export type ToWasmOperator = [0, ToWasmStateAction] | [1, ToWasmRawQuantumGate[]]; // TODO: o番目を型付け

/**
 * module.state_dataCpp に渡される構造を生成する
 */
export function translateOperatorQueueToSerialInfo(queues: OperatorQueue[], size: number): ToWasmSerialInfo {
    // console.log("translateOperatorQueueToSerialInfo",size, queues);
    const info: ToWasmSerialInfo = {
        operators: [],
        size
    };
    queues.forEach((queue) => {
        if (queue.queueType === OperatorQueueType.StateAction) {
            let wasmQueue: ToWasmStateAction;
            if (queue.queueData.type == StateActionType.set_zero_state) {
                wasmQueue = [StateActionType.set_zero_state];
            } else { // 暫定でset_ZeroとsatateWasmだけ考える
                wasmQueue = [StateActionType.setWasmVector, queue.queueData.data];
            }
            info.operators.push([0, wasmQueue]);
        } else if (queue.queueType === OperatorQueueType.Gate) {
            const step: ToWasmRawQuantumGate[] = [];
            const index = queue.queueData.index;
            for (let i = 0; i < index+1; i++) {
                if (i === index) {
                    step.push(translateDefaultGateToWasmGate(queue.queueData));
                } else {
                    step.push(translateDefaultGateToWasmGate({ type: ToWasmDefaultGateType.EMPTY }));
                }
            }
            info.operators.push([1, step]);
        }
    });
    console.log("info", info);
    return info;
}

function isStateInitializeAction(queue: OperatorQueue): queue is StateActionOperatorQueue {
    return queue.queueType === OperatorQueueType.StateAction;
}
