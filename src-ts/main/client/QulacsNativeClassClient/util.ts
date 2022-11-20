import { ToWasmSerialInfo } from "../../emsciptenModule/QulacsWasmModule";
import { OperatorQueue, OperatorQueueType, StateActionOperatorQueue } from "../../nativeType/helper/OperatorQueue";
import { StateActionType } from "../../nativeType/helper/StateAction";
import { WasmVector } from "../../type/common";
import { QuantumGateType } from "../../type/QuantumGateType";
import { WasmQuantumGate } from "../../type/WasmGateType";
import { translateDefaultGateToWasmGate } from "../../util/toWasmUtil";

// ゲート操作やstate setなどの単位の操作
export type ToWasmOperator = [0, ToWasmStateAction] | [1, WasmQuantumGate[]]; // TODO: o番目を型付け

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
            } else if (queue.queueData.type === StateActionType.setWasmVector) { // 暫定でset_ZeroとsatateWasmだけ考える
                wasmQueue = [StateActionType.setWasmVector, queue.queueData.data];
            }
            info.operators.push([0, wasmQueue]);
        } else if (queue.queueType === OperatorQueueType.Gate) {
            const step: WasmQuantumGate[] = [];
            const index = queue.queueData.index;
            for (let i = 0; i < index+1; i++) {
                if (i === index) {
                    step.push(translateDefaultGateToWasmGate(queue.queueData));
                } else {
                    step.push(translateDefaultGateToWasmGate({ type: QuantumGateType.EMPTY }));
                }
            }
            info.operators.push([1, step]);
        }
    });
    console.log("info", JSON.stringify(info));
    return info;
}

type ToWasmStateAction = [StateActionType] | [StateActionType, WasmVector]; // 暫定としてset_zeroとWasmVector使うsetだけ考える

function createWasmQueueFromStateActionQueue(queue: StateActionOperatorQueue): ToWasmStateAction {
    let wasmQueue: ToWasmStateAction;
    switch (queue.queueData.type) {
        case StateActionType.set_zero_state:
            return [StateActionType.set_zero_state];
        case StateActionType.load_wasmVector:
            return [StateActionType.load_wasmVector, queue.queueData.data];
        case StateActionType.load_ComplexVector:
            return [StateActionType.load_ComplexVector, queue.queueData.data];
    }
}
