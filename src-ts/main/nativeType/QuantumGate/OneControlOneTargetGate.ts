import { OneControlOneTargetGateType } from "../../type/QuantumGateType";
import { vecToRowMajorMatrixXcd } from "../../util/fromWasmUtil";
import { QuantumGateBase } from "./QuantumGateBase";
import { QuantumGateMatrix } from "./QuantumGateMatrix";

export abstract class OneControlOneTargetGate extends QuantumGateBase {
    abstract _type: OneControlOneTargetGateType;
    _targetIndex: number;
    _controlIndex: number;
    constructor(control_qubit_index: number, target_qubit_index: number) {
        super();
        this._targetIndex = target_qubit_index;
        this._controlIndex = control_qubit_index;
    }

    to_matrix_gate(): QuantumGateMatrix {
        return new QuantumGateMatrix(this._targetIndex, vecToRowMajorMatrixXcd(this._get_matrix_raw()), [this._controlIndex]);
    };
}

export class CNOT extends OneControlOneTargetGate {
    _type: OneControlOneTargetGateType = OneControlOneTargetGateType.CNOT;
}

export class CZ extends OneControlOneTargetGate {
    _type: OneControlOneTargetGateType = OneControlOneTargetGateType.CZ;
}
