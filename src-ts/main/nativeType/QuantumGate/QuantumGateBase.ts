import { QulacsNativeClassClient } from "../../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { Complex } from "../../type/common";
import { QuantumState } from "../QuantumState";
import { QuantumGateType } from "../../type/QuantumGateType";
import { translateGateQueuesToOperatorQueue } from "../../util/toWasmUtil";
import { vecToRowMajorMatrixXcd } from "../../util/fromWasmUtil";
import { QuantumGateMatrixBase } from "./QuantumGateMatrixBase";

export abstract class QuantumGateBase {
    static client: QulacsNativeClassClient;
    // NOTE: 便宜上の量子ゲートの作用する位置。CZやSWAPは_indexと対称なcontrollIndexを持つ
     abstract _type: QuantumGateType;
    constructor() {
    }

    abstract to_matrix_gate(): QuantumGateMatrixBase;

    update_quantum_state(state: QuantumState) {
        state._operatorQueues = state._operatorQueues.concat(translateGateQueuesToOperatorQueue(this));
    }

    /**
     * ゲートの複素数行列をRowMajorにして2次元配列で返す
     */
     get_matrix(): Complex[][] {
        return vecToRowMajorMatrixXcd(QuantumGateBase.client.gateBase.get_matrix(this));
    };

    /**
     * ゲートの複素数行列を1次元配列で返す
     */
    _get_matrix_raw(): Complex[] {
        return QuantumGateBase.client.gateBase.get_matrix(this);
    }
}
