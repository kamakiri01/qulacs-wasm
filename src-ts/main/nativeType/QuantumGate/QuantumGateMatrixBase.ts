import { Complex } from "../../type/common";
import { QuantumGateBase } from "./QuantumGateBase";

export abstract class QuantumGateMatrixBase extends QuantumGateBase {
    abstract get_matrix(): Complex[][];
    abstract to_matrix_gate(): QuantumGateMatrixBase;
}
