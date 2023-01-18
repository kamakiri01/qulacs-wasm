import { QulacsNativeClassClient } from "../../client/QulacsNativeClassClient/QulacsNativeClassClient";
import { Complex } from "../../type/common";
import { QuantumState } from "../QuantumState";
import { QuantumGateType } from "../../type/QuantumGateType";
import { translateQuantumGateToOperatorQueue } from "../../util/toWasmUtil";
import { vecToRowMajorMatrixXcd } from "../../util/fromWasmUtil";
import { QuantumGateMatrixBase } from "./QuantumGateMatrixBase";

export abstract class QuantumGateBase {
    static client: QulacsNativeClassClient;
     abstract _type: QuantumGateType;

    abstract to_matrix_gate(): QuantumGateMatrixBase;

    update_quantum_state(state: QuantumState) {
        state._operatorQueues = state._operatorQueues.concat(translateQuantumGateToOperatorQueue(this));
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
