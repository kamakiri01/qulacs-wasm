import { OneQubitGate, OneQubitRotationGate, QuantumGateBase } from "../nativeType/QuantumGate/QuantumGateBase";
import { OneQubitGateType, OneQubitRotationGateType, QuantumGateType } from "../type/QuantumGateType";
import { WasmOneQubitGateData, WasmOneQubitRotationGateData, WasmPauliGateData, WasmQuantumGateData } from "../type/WasmGateType";

export function translateDefaultGateToWasmGate(gate: QuantumGateBase): WasmQuantumGateData {
    if (!gate) return [QuantumGateType.I, 0] as WasmPauliGateData;
    if (isOneQubitGate(gate)) {
        return [gate._type, gate._index] as WasmOneQubitGateData;
    } else if (isOneQubitRotationGate(gate)) {
        return [gate._type, gate._index, gate._angle] as WasmOneQubitRotationGateData;
    } else {
        throw Error("暫定、ccnot cnot");
    }
/*
    var a =  (typeof gate._type);

    if (gate._type instanceof OneQubitGateType) {
        gate._type
    }

    const gateParam = isParametricQuantumGateType(gate._type) ? gate.param : 0;
    const gateControlls = isMultiQuantumGateType(gate) ? gate.controllQubitIndex : []
    data = [gateType, gate._index, gateParam, gateControlls];
    */
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

/*
function translateGateType(gateType: QuantumGateType): QuantumGateType {
    switch(gateType) {
        case QuantumGateType.I:
            return "i";
        case QuantumGateType.X:
            return "x";
        case QuantumGateType.Y:
            return "y";
        case QuantumGateType.Z:
            return "z";
        case QuantumGateType.H:
            return "h";
        case QuantumGateType.T:
            return "t";
        case QuantumGateType.S:
            return "s";
        case QuantumGateType.RX:
            return "rx";
        case QuantumGateType.RY:
            return "ry";
        case QuantumGateType.RZ:
            return "rz";
        case QuantumGateType.RotX:
            return "rotx";
        case QuantumGateType.CNOT:
            return "cnot";
        case QuantumGateType.CCNOT:
            return "ccnot";
        default:
            const unhandleGateType: never = gateType;
            throw new Error(`unknown QuantumGateType: ${unhandleGateType}`);
    }
}

function isParametricQuantumGateType(gateType: QuantumGateType): gateType is ParametricQuantumGateType {
    switch(gateType) {
        case ParametricQuantumGateType.RX:
        case ParametricQuantumGateType.RY:
        case ParametricQuantumGateType.RZ:
            return true;
        }
        return false;
}

function isMultiQuantumGateType(gate: QuantumGate): gate is MultiQuantumGate {
    switch(gate.type) {
        case MultiQuantumGateType.CNOT:
        case MultiQuantumGateType.CCNOT:
            return true;
        }
        return false;
}
*/