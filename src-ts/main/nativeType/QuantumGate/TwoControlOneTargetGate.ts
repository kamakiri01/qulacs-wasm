import { TwoControlOneTargetGateType } from "../../type/QuantumGateType";
import { CNOT } from "./OneControlOneTargetGate";
import { QuantumGateBase } from "./QuantumGateBase";

export abstract class TwoControlOneTargetGate extends QuantumGateBase {
    abstract _type: TwoControlOneTargetGateType;
    _targetIndex: number;
    _controlIndex0: number;
    _controlIndex1: number;
    constructor(control_qubit_index0: number, control_qubit_index1: number, target_qubit_index: number) {
        super();
        this._targetIndex = target_qubit_index;
        this._controlIndex0 = control_qubit_index0;
        this._controlIndex1 = control_qubit_index1;
    }
}

export class CCNOT extends TwoControlOneTargetGate {
    _type: TwoControlOneTargetGateType = TwoControlOneTargetGateType.CCNOT;
}

export type Toffoli = CNOT;
