import { Complex } from "../../type/common";
import { MatrixGateType } from "../../type/QuantumGateType";
import { QuantumGateBase } from "./QuantumGateBase";

export class QuantumGateMatrix extends QuantumGateBase {
    _type: MatrixGateType; // 非 abstract かつ extends するため値はコンストラクタで代入している
    constructor(
        target_qubit_index_list: number | number[],
        mat: (Complex | number)[][],
        control_qubit_index_list: number[] = []) {
        super();
        this._type = MatrixGateType.QuantumGateMatrix;
    }

    /*
    add_control_qubit(): void {

    };

   get_matrix(): Complex[][] {
       
   }
    */

}

export class DenseMatrix extends QuantumGateMatrix {
    _type = MatrixGateType.DenseMatrix;;

}
