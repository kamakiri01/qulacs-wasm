import { ToWasmOperator, ToWasmSerialInfo } from "../../emsciptenModule/RequestType";
import { OperatorQueue, OperatorQueueType } from "../../nativeType/helper/OperatorQueue";
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
