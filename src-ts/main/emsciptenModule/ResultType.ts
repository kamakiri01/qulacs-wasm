import { WasmVector } from "../type/common";

export interface StateDataCppResult {
    /**
     * std::vector<double>
     */
    doubleVec: WasmVector<number>,

    /**
     * std::vector<CPPTYPE>
     * 
     * stateを継続利用する際にwasmに返送するためJS側で参照を維持する。JS側でこの値を利用することはない
     */
    cppVec: WasmVector<unknown>;
}

export interface SamplingResult extends StateDataCppResult {
    samplingVec: WasmVector<number>;
}

export interface StateGetZeroProbabilityResult {
    prob: number;
}

export interface StateGetMarginalProbabilityResult {
    marginal_prob: number;
}

export interface GateBaseGetMatrixResult {
    /**
     * std::vector<double>
     */
    doubleVec: WasmVector<number>;

    /**
     * 暫定
     * ComplexMatrix = Eigen::MatrixXcd
     */
    cppMat: WasmVector<unknown>;
}
