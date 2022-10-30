import { ToWasmDefaultGateType, ToWasmDefaultQuantumGate } from "../type/DefaultGateType";
import { ToWasmRawGateType, ToWasmRawQuantumGate } from "../type/RawGateType";
import { ToWasmCalcStateInfo, ToWasmCircuitInfo, ToWasmObservableInfo } from "../type/ClientType";

export interface QulacsWasmModule extends EmscriptenWasm.Module {
    getStateVectorWithExpectationValue(request: ToWasmCalcStateInfo<ToWasmRawGateType, ToWasmRawQuantumGate>): GetStateVectorWithExpectationValueResult;
}

export interface Complex {
    re: number;
    im: number;
}

// C++の配列と同じI/F
interface WasmVector {
    get: (index: number) => number;
    size: () => number;
}

export interface GetStateVectorWithExpectationValueResult {
    stateVector: WasmVector;
    expectationValue: number;
}

export interface QulacsWasmClientParameterObjeect {
    module: QulacsWasmModule;
}

export class QulacsWasmClient {
    module: QulacsWasmModule;
    constructor(param: QulacsWasmClientParameterObjeect) {
        this.module = param.module;
    }

    getStateVectorWithExpectationValue(
        info: ToWasmCalcStateInfo<ToWasmDefaultGateType, ToWasmDefaultQuantumGate>
    ) {
        const result = this.module.getStateVectorWithExpectationValue(
            convertCalcStateInfo(info.circuitInfo, info.observableInfo)
        );
        const stateVector = convertArrayToComplexArray(convertWasmVectorToArray(result.stateVector));
        return {
            stateVector,
            expectationValue: result.expectationValue
        }
    }
}

function convertWasmVectorToArray(vector: WasmVector) {
    const data = [];
    const size = vector.size();
    for (let i = 0; i < size; i+=1) {
        data.push(vector.get(i));
    }
    return data;
}

function convertArrayToComplexArray(arr: number[]): Complex[] {
    const result: Complex[] = [];
    const length = arr.length;
    for (let i = 0; i < length; i+=2) {
        result.push({
            re: arr[i],
            im: arr[i+1]
        })
    }
    return result;
}

function convertCalcStateInfo(
    circuitInfo: ToWasmCircuitInfo<ToWasmDefaultQuantumGate>,
    observableInfo: ToWasmObservableInfo<ToWasmDefaultGateType>
): ToWasmCalcStateInfo<ToWasmRawGateType, ToWasmRawQuantumGate> {
    const wasmCircuitInfo: ToWasmCircuitInfo<ToWasmRawQuantumGate> = {
        size: circuitInfo.size,
        circuit: []
    };
    circuitInfo.circuit.forEach((step, index) => {
        wasmCircuitInfo.circuit[index] = [];
        step.forEach((gate, i) => {
            let wasmGate: ToWasmRawQuantumGate;
            if (!gate) {
                wasmGate = [0, 0, []];
            } else {
                wasmGate = [
                    translateGateType(gate.type),
                    gate.param ?? 0,
                    gate.controllQubitIndex ?? []
    
                ];
            }
            wasmCircuitInfo.circuit[index].push(wasmGate);
        });
    });

    const wasmObsevableInfo: ToWasmObservableInfo<ToWasmRawGateType> = {
        observable: []
    };
    observableInfo.observable.forEach((step, index) => {
        wasmObsevableInfo.observable[index] = {
            coefficient: step.coefficient,
            operators: []
        };
        step.operators.forEach((operator, i) => {
            if (!operator) {
                wasmObsevableInfo.observable[index].operators.push(0);
            }

            switch(step.operators[i]) {
                case ToWasmDefaultGateType.X:
                    wasmObsevableInfo.observable[index].operators.push(1);
                    break;
                case ToWasmDefaultGateType.Y:
                    wasmObsevableInfo.observable[index].operators.push(2);
                    break;
                case ToWasmDefaultGateType.Z:
                    wasmObsevableInfo.observable[index].operators.push(3);
                    break;
            }
        });
    })
    return {
        circuitInfo: wasmCircuitInfo,
        observableInfo: wasmObsevableInfo
    }
}

//function translateGateType(defaultGateType: ): Extract<ToWasmRawGateType, 0 | 1 | 2 | 3>;
function translateGateType(defaultGateType: ToWasmDefaultGateType | Extract<ToWasmDefaultGateType,  undefined | "x" | "y" | "z">): ToWasmRawGateType {
    switch(defaultGateType) {
        case ToWasmDefaultGateType.X:
            return 1;
        case ToWasmDefaultGateType.Y:
            return 2;
        case ToWasmDefaultGateType.Z:
            return 3;
        case ToWasmDefaultGateType.H:
            return 4;
        case ToWasmDefaultGateType.T:
            return 5;
        case ToWasmDefaultGateType.S:
            return 6;
        case ToWasmDefaultGateType.RX:
            return 7;
        case ToWasmDefaultGateType.RY:
            return 8;
        case ToWasmDefaultGateType.RZ:
            return 9;
        case ToWasmDefaultGateType.CNOT:
            return 10;
        case ToWasmDefaultGateType.CCNOT:
            return 11;
        default:
            return 0; // unreachable required
    }
} 