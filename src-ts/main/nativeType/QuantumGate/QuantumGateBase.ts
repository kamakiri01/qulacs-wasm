import { QulacsNativeClassClient } from "../../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { Complex } from "../../type/common";
//import { QuantumGateMatrix } from "./QuantumGateMatrix";
import { QuantumState } from "../QuantumState";
import { OneControlOneTargetGateType, OneQubitGateType, OneQubitRotationGateType, QuantumGateType } from "../../type/QuantumGateType";

export abstract class QuantumGateBase {
    static client: QulacsNativeClassClient;
    // NOTE: 便宜上の量子ゲートの作用する位置。CZやSWAPは_indexと対称なcontrollIndexを持つ
     abstract _type: QuantumGateType;
    constructor() {
    }

    /*
    abstract get_matrix(): Complex[][];

    abstract to_matrix_gate(): QuantumGateMatrix;

    abstract update_quantum_state(state: QuantumState): void;
    */
}

export abstract class OneQubitGate extends QuantumGateBase {
    abstract _type: OneQubitGateType;
    _index: number;
    constructor(target_qubit_index: number) {
        super();
        this._index = target_qubit_index;
    }
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

export class RotX extends OneQubitRotationGate {
    _type = QuantumGateType.RotX;
}
