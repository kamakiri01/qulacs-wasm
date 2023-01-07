import { QulacsNativeClassClient } from "../../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { Complex } from "../../type/common";
import { QuantumGateMatrix } from "./QuantumGateMatrix";
import { QuantumState } from "../QuantumState";
import { QuantumGateType } from "../../type/QuantumGateType";

export abstract class QuantumGateBase {
    static client: QulacsNativeClassClient;
    // NOTE: 便宜上の量子ゲートの作用する位置。CZやSWAPは_indexと対称なcontrollIndexを持つ
     abstract _index: number;
     abstract _type: QuantumGateType;
    constructor() {
    }

    abstract get_matrix(): Complex[][];

    abstract to_matrix_gate(): QuantumGateMatrix;

    abstract update_quantum_state(state: QuantumState): void;
}

export abstract class SingleQuantumGate extends QuantumGateBase {
    _index: number;
    constructor(target_qubit_index: number) {
        super();
        this._index = target_qubit_index;
    }
}

export class Identity extends SingleQuantumGate {
    _type = QuantumGateType.I;
}
export class X extends SingleQuantumGate {
    _type = QuantumGateType.X;
}
export class Y extends SingleQuantumGate {
}
export class Z extends SingleQuantumGate {
}
export class H extends SingleQuantumGate {
}
export class T extends SingleQuantumGate {
}
export class S extends SingleQuantumGate {
}
