import { OneQubitGateType, OneQubitRotationGateType, QuantumGateType } from "../../type/QuantumGateType";
import { vecToRowMajorMatrixXcd } from "../../util/fromWasmUtil";
import { QuantumGateBase } from "./QuantumGateBase";
import { QuantumGateMatrix } from "./QuantumGateMatrix";
import { QuantumGateMatrixBase } from "./QuantumGateMatrixBase";

export abstract class OneQubitGate extends QuantumGateBase {
    abstract _type: OneQubitGateType;
    _index: number;
    constructor(target_qubit_index: number) {
        super();
        this._index = target_qubit_index;
    }

    to_matrix_gate(): QuantumGateMatrixBase {
        return new QuantumGateMatrix(this._index, vecToRowMajorMatrixXcd(this._get_matrix_raw()));
    };
}

export abstract class OneQubitRotationGate extends QuantumGateBase {
    abstract _type: OneQubitRotationGateType;
    _index: number;
    _angle: number;
    constructor(target_qubit_index: number, angle: number) {
        super();
        this._index = target_qubit_index;
        this._angle = angle;
    }

    to_matrix_gate(): QuantumGateMatrixBase {
        return new QuantumGateMatrix(this._index, vecToRowMajorMatrixXcd(this._get_matrix_raw()));
    };

}

export class Identity extends OneQubitGate {
    _type = OneQubitGateType.I;
}
export class X extends OneQubitGate {
    _type = OneQubitGateType.X;
}
export class Y extends OneQubitGate {
    _type = OneQubitGateType.Y;
}
export class Z extends OneQubitGate {
    _type = OneQubitGateType.Z;
}
export class H extends OneQubitGate {
    _type = OneQubitGateType.H;
}
export class T extends OneQubitGate {
    _type = OneQubitGateType.T;
}
export class S extends OneQubitGate {
    _type = OneQubitGateType.S;
}

export class RX extends OneQubitRotationGate {
    _type = QuantumGateType.RX;
}

export class RY extends OneQubitRotationGate {
    _type = QuantumGateType.RY;
}

export class RZ extends OneQubitRotationGate {
    _type = QuantumGateType.RZ;
}

export class RotX extends OneQubitRotationGate {
    _type = QuantumGateType.RotX;
}

export class RotY extends OneQubitRotationGate {
    _type = QuantumGateType.RotY;
}

export class RotZ extends OneQubitRotationGate {
    _type = QuantumGateType.RotZ;
}
