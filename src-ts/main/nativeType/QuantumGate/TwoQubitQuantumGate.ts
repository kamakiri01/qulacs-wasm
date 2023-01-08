import { MultiQuantumGateType, QuantumGateType } from "../../type/QuantumGateType";
import { QuantumGateBase } from "./QuantumGateBase";

export abstract class OneControlOneTargetGate extends QuantumGateBase {
    abstract _type: MultiQuantumGateType;
    _controlIndex: number;
    _targetIndex: number;
    constructor(control_qubit_index: number, target_qubit_index: number) {
        super();
        this._controlIndex = control_qubit_index;
        this._targetIndex = target_qubit_index;
    }
}

export class CNOT extends OneControlOneTargetGate {
    _type = MultiQuantumGateType.CNOT;
    constructor(control_qubit_index: number, target_qubit_index: number) {
        super(control_qubit_index, target_qubit_index);
    }
}

export class CZ extends OneControlOneTargetGate {
    _type = MultiQuantumGateType.CZ;
    constructor(control_qubit_index: number, target_qubit_index: number) {
        super(control_qubit_index, target_qubit_index);
    }
}
