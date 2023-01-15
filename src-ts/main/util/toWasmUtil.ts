import { OperatorQueueType, QuantumGateOperatorQueue } from "../nativeType/helper/OperatorQueue";
import { OneControlOneTargetGate } from "../nativeType/QuantumGate/OneControlOneTargetGate";
import { OneQubitGate, OneQubitRotationGate, QuantumGateBase } from "../nativeType/QuantumGate/QuantumGateBase";
import { TwoControlOneTargetGate } from "../nativeType/QuantumGate/TwoControlOneTargetGate";
import { Complex } from "../type/common";
import { OneControlOneTargetGateType, OneQubitGateType, OneQubitRotationGateType, QuantumGateType, TwoControlOneTargetGateType } from "../type/QuantumGateType";
import { WasmOneControlOneTargetGateData, WasmOneQubitGateData, WasmOneQubitRotationGateData, WasmPauliGateData, WasmQuantumGateData, WasmTwoControlOneTargetGateData } from "../type/WasmGateType";

export function convertComplexArrayToSerialComplexArray(arr: Complex[]): number[] {
    const result: number[] = [];
    const length = arr.length;
    for (let i = 0; i < length; i++) {
        result.push(arr[i].re);
        result.push(arr[i].im);
    }
    return result;
}

export function translateGateQueuesToOperatorQueue(gate: QuantumGateBase): QuantumGateOperatorQueue {
    return {
        queueType: OperatorQueueType.Gate,
        queueData: gate
    };
}

export function translateDefaultGateToWasmGate(gate: QuantumGateBase): WasmQuantumGateData {
    if (!gate) return [QuantumGateType.I, 0] as WasmPauliGateData;
    if (isOneQubitGate(gate)) {
        return [gate._type, gate._index] as WasmOneQubitGateData;
    } else if (isOneQubitRotationGate(gate)) {
        return [gate._type, gate._index, gate._angle] as WasmOneQubitRotationGateData;
    } else if (isOneControlOneTargetGateGate(gate)) {
        return [gate._type, gate._targetIndex, gate._controlIndex] as WasmOneControlOneTargetGateData;
    } else if (isTwoControlOneTargetGateGate(gate)) {
        return [gate._type, gate._targetIndex, gate._controlIndex0, gate._controlIndex1] as WasmTwoControlOneTargetGateData;
    } else {
        throw new Error(`unknown QuantumGate: ${gate}`);
    }
}

function isOneQubitGate(gate: QuantumGateBase): gate is OneQubitGate {
    // @see https://github.com/Microsoft/TypeScript/issues/26255
    // @see https://fettblog.eu/typescript-array-includes/
    if ((Object.values(OneQubitGateType) as string[]).includes(gate._type)) return true;
    return false;
}

function isOneQubitRotationGate(gate: QuantumGateBase): gate is OneQubitRotationGate {
    // @see https://github.com/Microsoft/TypeScript/issues/26255
    // @see https://fettblog.eu/typescript-array-includes/
    if ((Object.values(OneQubitRotationGateType) as string[]).includes(gate._type)) return true;
    return false;
}

function isOneControlOneTargetGateGate(gate: QuantumGateBase): gate is OneControlOneTargetGate {
    // @see https://github.com/Microsoft/TypeScript/issues/26255
    // @see https://fettblog.eu/typescript-array-includes/
    if ((Object.values(OneControlOneTargetGateType) as string[]).includes(gate._type)) return true;
    return false;
}

function isTwoControlOneTargetGateGate(gate: QuantumGateBase): gate is TwoControlOneTargetGate {
    // @see https://github.com/Microsoft/TypeScript/issues/26255
    // @see https://fettblog.eu/typescript-array-includes/
    if ((Object.values(TwoControlOneTargetGateType) as string[]).includes(gate._type)) return true;
    return false;
}
