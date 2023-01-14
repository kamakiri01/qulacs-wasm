import { QulacsNativeClassClient } from "../../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { Complex } from "../../type/common";
import { QuantumState } from "../QuantumState";
import { OneControlOneTargetGateType, OneQubitGateType, OneQubitRotationGateType, QuantumGateType } from "../../type/QuantumGateType";
import { translateGateQueuesToOperatorQueue } from "../../util/toWasmUtil";
import { QuantumGateMatrix } from "./QuantumGateMatrix";

export abstract class QuantumGateBase {
    static client: QulacsNativeClassClient;
    // NOTE: 便宜上の量子ゲートの作用する位置。CZやSWAPは_indexと対称なcontrollIndexを持つ
     abstract _type: QuantumGateType;
    constructor() {
    }

    /*
    to_matrix_gate(): QuantumGateMatrix {

    };
    */


    /**
     * ゲートの複素数行列をRowMajorにして2次元配列で返す
     */
    get_matrix(): Complex[][] {
        return vecToRowMajorMatrixXcd(QuantumGateBase.client.gateBase.get_matrix(this));
    };

    update_quantum_state(state: QuantumState) {
        state._operatorQueues = state._operatorQueues.concat(translateGateQueuesToOperatorQueue(this));
    }

    /**
     * ゲートの複素数行列を1次元配列で返す
     */
    _get_matrix_raw(): Complex[] {
        return QuantumGateBase.client.gateBase.get_matrix(this);
    }
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

function vecToRowMajorMatrixXcd(vec: Complex[]): Complex[][] {
    const len = vec.length;
    const n = Math.sqrt(vec.length) | 0; // 正方行列の行・列の長さは同じため、要素数の平方根nは整数を保証する。JITにintを解釈させるため `| 0` を付与する
    const mat: Complex[][] = [];
    for (let i = 0; i < len;i += n) {
        mat.push(vec.slice(i, i + n));
    }
    return mat;
}