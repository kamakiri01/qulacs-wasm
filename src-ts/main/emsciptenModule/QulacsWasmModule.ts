import { StateGetVectorRequest, StateSamplingRequest, SateGetZeroProbabilityRequest, StateGetMarginalProbabilityRequest, GateBaseGetMatrixRequest, GateMatrixGetMatrixRequest } from "./RequestType";
import { StateDataCppResult, SamplingResult, StateGetZeroProbabilityResult, StateGetMarginalProbabilityResult, GateBaseGetMatrixResult, GateMatrixGetMatrixResult } from "./ResultType";

export interface QulacsWasmModule extends EmscriptenWasm.Module {
    getExceptionMessage(exceptionPtr: number): string;
    state_dataCpp(request: StateGetVectorRequest): StateDataCppResult;
    state_sampling(request: StateSamplingRequest): SamplingResult;
    state_get_zero_probability(request: SateGetZeroProbabilityRequest): StateGetZeroProbabilityResult;
    state_get_marginal_probability(request: StateGetMarginalProbabilityRequest): StateGetMarginalProbabilityResult;
    gate_base_get_matrix(request: GateBaseGetMatrixRequest): GateBaseGetMatrixResult;
    gate_matrix_get_matrix(request: GateMatrixGetMatrixRequest): GateMatrixGetMatrixResult;
}
