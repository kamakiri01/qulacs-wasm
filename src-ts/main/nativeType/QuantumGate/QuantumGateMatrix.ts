import { Complex, WasmComplexMatrix } from "../../type/common";
import { MatrixGateType } from "../../type/QuantumGateType";
import { vecToRowMajorMatrixXcd } from "../../util/fromWasmUtil";
import { convertComplexArrayToSerialComplexArray } from "../../util/toWasmUtil";
import { GateMatrixOperatorQueue, GateMatrixOperatorQueueType, InitVecQueue } from "../helper/GateMatrixOperatorQueue";
import { QuantumGateBase } from "./QuantumGateBase";
import { QuantumGateMatrixBase } from "./QuantumGateMatrixBase";

export class QuantumGateMatrix extends QuantumGateMatrixBase {
    _type: MatrixGateType; // NOTE: 非 abstract かつ extends するため値はコンストラクタで代入
    _queue: GateMatrixOperatorQueue[];
    _target_qubit_index_list: number[];
    _control_qubit_index_list: number[];

    constructor(
        target_qubit_index_list: number | number[], // wasmにコールしてgetterで返すほうがいいかも
        mat: (Complex | number)[][] | WasmComplexMatrix<unknown>,
        control_qubit_index_list: number[] = []) {
        super();
        this._type = MatrixGateType.QuantumGateMatrix;

        this._target_qubit_index_list = Array.isArray(target_qubit_index_list) ? target_qubit_index_list : [target_qubit_index_list];
        this._control_qubit_index_list = control_qubit_index_list;
        let initQueue: InitVecQueue;
        if (Array.isArray(mat)) {
            let initMat: number[];
            if (isNumber(mat[0][0])) {
                initMat = (mat as number[][]).reduce((acc, cur) => acc.concat(cur));
            } else if (isNumber(mat[0][0].re)) {
                initMat = (mat as Complex[][]).map(convertComplexArrayToSerialComplexArray).reduce((acc, cur) => acc.concat(cur));
            } else {
                throw new Error("invalid Matrix"); // TODO: 暫定
            }
            initQueue = [GateMatrixOperatorQueueType.InitVec, this._target_qubit_index_list, initMat, this._control_qubit_index_list] as InitVecQueue;
        } else {
            // TODO: matがComplexMatrixかどうかの厳密な判定
            // initQueue = [GateMatrixOperatorQueueType.InitCppMat, this._target_qubit_index_list, mat, this._control_qubit_index_list] as InitCppMatQueue;
            throw new Error("undefined constructor");
        }

        this._queue = [initQueue];
    }

    /**
     * ゲートの複素数行列をRowMajorにして2次元配列で返す
     */
     get_matrix(): Complex[][] {
        const result = QuantumGateBase.client.gateMatrix.get_matrix(this);
        return vecToRowMajorMatrixXcd(result);
    };


    to_matrix_gate(): QuantumGateMatrix {
        return this; // copy?
    }

    /*
    copy
    set_matrix
    multiply_scalar()
    set_gate_property()
    add_control_qubit
    */
}

export class DenseMatrix extends QuantumGateMatrix {
    _type = MatrixGateType.DenseMatrix;;
}

function isNumber(n: any): n is number {
    return ((typeof n === "number") && (isFinite(n)));
}
