import { ToWasmSerialInfo, ToWasmSamplingInfo, GetZeroProbabilityInfo, GetMarginalProbabilityInfo, GateBaseGetMatrixInfo, GateMatrixGetMatrixInfo } from "./RequestType";
import { StateDataCppResult, SamplingResult, StateGetZeroProbabilityResult, StateGetMarginalProbabilityResult, GateBaseGetMatrixResult, GateMatrixGetMatrixResult } from "./ResultType";

export interface QulacsWasmModule extends EmscriptenWasm.Module {
    getExceptionMessage(exceptionPtr: number): string;
    state_dataCpp(request: ToWasmSerialInfo): StateDataCppResult;
    state_sampling(request: ToWasmSamplingInfo): SamplingResult;
    
    state_get_zero_probability(request: GetZeroProbabilityInfo): StateGetZeroProbabilityResult;
    state_get_marginal_probability(request: GetMarginalProbabilityInfo): StateGetMarginalProbabilityResult;
    gate_base_get_matrix(request: GateBaseGetMatrixInfo): GateBaseGetMatrixResult;
    gate_matrix_get_matrix(request: GateMatrixGetMatrixInfo): GateMatrixGetMatrixResult;
}
