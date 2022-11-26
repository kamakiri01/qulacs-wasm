import { ToWasmSerialInfo } from "../../emsciptenModule/QulacsWasmModule";
import { OperatorQueue, OperatorQueueType, QuantumGateOperatorQueue } from "../../nativeType/helper/OperatorQueue";
import { StateAction } from "../../nativeType/helper/StateAction";
import { QuantumGateType } from "../../type/QuantumGateType";
import { WasmQuantumGate } from "../../type/WasmGateType";
import { translateDefaultGateToWasmGate } from "../../util/toWasmUtil";

// ゲート操作やstate setなどの単位の操作
export type ToWasmOperator = [0, StateAction] | [1, WasmQuantumGate[]]; // TODO: o番目を型付け

/**
 * module.state_dataCpp に渡される構造を生成する
 */
export function translateOperatorQueueToSerialInfo(queues: OperatorQueue[], size: number): ToWasmSerialInfo {
    const info: ToWasmSerialInfo = {
        operators: [],
        size
    };
    queues.forEach((queue) => {
        let wasmOperator: ToWasmOperator;
        switch (queue.queueType) {
            case OperatorQueueType.StateAction:
                wasmOperator = [0, queue.queueData];
                break;
            case OperatorQueueType.Gate:
                wasmOperator = createOperatorFromGateQueue(queue);
                break;
        }
        info.operators.push(wasmOperator);
    });
    console.log("info", JSON.stringify(info));
    return info;
}

function createOperatorFromGateQueue(queue: QuantumGateOperatorQueue): ToWasmOperator {
    const step: WasmQuantumGate[] = [];
    const index = queue.queueData.index;
    for (let i = 0; i < index+1; i++) {
        if (i === index) {
            step.push(translateDefaultGateToWasmGate(queue.queueData));
        } else {
            step.push(translateDefaultGateToWasmGate({ type: QuantumGateType.EMPTY }));
        }
    }
    return [1, step];
}
