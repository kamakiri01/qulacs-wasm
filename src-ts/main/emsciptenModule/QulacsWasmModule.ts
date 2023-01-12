import { ToWasmSerialInfo, ToWasmSamplingInfo, GetZeroProbabilityInfo, GetMarginalProbabilityInfo, GateBaseGetMatrixInfo } from "./RequestType";
import { StateDataCppResult, SamplingResult, StateGetZeroProbabilityResult, StateGetMarginalProbabilityResult, GateBaseGetMatrixResult } from "./ResultType";

export interface QulacsWasmModule extends EmscriptenWasm.Module {
    getExceptionMessage(exceptionPtr: number): string;
    state_dataCpp(request: ToWasmSerialInfo): StateDataCppResult;
    state_sampling(request: ToWasmSamplingInfo): SamplingResult;
    state_get_zero_probability(request: GetZeroProbabilityInfo): StateGetZeroProbabilityResult;
    state_get_marginal_probability(request: GetMarginalProbabilityInfo): StateGetMarginalProbabilityResult;
    gate_base_get_matrix(request: GateBaseGetMatrixInfo): GateBaseGetMatrixResult;
}
