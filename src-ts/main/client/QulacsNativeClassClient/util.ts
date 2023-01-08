import { ToWasmOperator, ToWasmSerialInfo } from "../../emsciptenModule/QulacsWasmModule";
import { OperatorQueue, OperatorQueueType, QuantumGateOperatorQueue } from "../../nativeType/helper/OperatorQueue";
import { Identity } from "../../nativeType/QuantumGate/QuantumGateBase";
import { QuantumGateType } from "../../type/QuantumGateType";
import { WasmQuantumGateData } from "../../type/WasmGateType";
import { translateDefaultGateToWasmGate } from "../../util/toWasmUtil";

/**
 * module.state_dataCpp に渡される構造を生成する
 */
export function translateOperatorQueueToWasmSerialInfo(queues: OperatorQueue[], size: number): ToWasmSerialInfo {
    const info: ToWasmSerialInfo = {
        operators: [],
        size
    };
    queues.forEach((queue) => {
        let wasmOperator: ToWasmOperator;
        const queueType = queue.queueType;
        switch (queueType) {
            case OperatorQueueType.StateAction:
                wasmOperator = [0, queue.queueData];
                break;
            case OperatorQueueType.Gate:
                wasmOperator = [1, translateDefaultGateToWasmGate(queue.queueData)];
                break;
            default:
                const unhandleQueueType: never = queueType;
                throw new Error(`unknown OperatorQueueType: ${unhandleQueueType}`);
        }
        info.operators.push(wasmOperator);
    });
    return info;
}
/*
function createOperatorFromGateQueue(queue: QuantumGateOperatorQueue): ToWasmOperator {
    const step: WasmQuantumGate[] = [];
    const index = queue.queueData._index;
    for (let i = 0; i < index+1; i++) {
        if (i === index) {
            step.push(translateDefaultGateToWasmGate(queue.queueData));
        } else {
            step.push(translateDefaultGateToWasmGate(new Identity(i)));
        }
    }
    return [1, step];
}
*/
