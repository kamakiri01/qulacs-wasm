#include <emscripten/bind.h>
#include <cppsim/state.hpp>
#include <cppsim/gate_factory.hpp>
#include <cppsim/gate_merge.hpp>
#include <cppsim/gate_matrix.hpp>
#include <string>
#include <vector>
#include <emscripten.h>
#include <iostream>
#include <emscripten/html5.h>
#include <cppsim/circuit.hpp>

#include "util/getGate.cpp"
#include "util/getObservable.cpp"
#include "nativeClass/state/data_cpp.cpp"
#include "nativeClass/state/sampling.cpp"
#include "nativeClass/state/get_zero_probability.cpp"
#include "nativeClass/state/get_marginal_probability.cpp"
#include "nativeClass/gateBase/get_matrix.cpp"
#include "nativeClass/gateMatrix/get_matrix.cpp"

extern "C" {
    DataCppResult state_dataCpp(const emscripten::val &serialInfo) { return data_cpp(serialInfo); }
    SamplingResult state_sampling(const emscripten::val &samplingInfo) { return sampling(samplingInfo); }
    GetZeroProbabilityResult state_get_zero_probability(const emscripten::val &getZeroProbabilityInfo) { return get_zero_probability(getZeroProbabilityInfo); }
    GetMarginalProbabilityResult state_get_marginal_probability(const emscripten::val &getMarginalProbabilityInfo) { return get_marginal_probability(getMarginalProbabilityInfo); }
    GateBaseGetMatrixResult gate_base_get_matrix(const emscripten::val &gateBaseGetMatrixInfo) { return gateBase_get_matrix(gateBaseGetMatrixInfo); }
    GateMatrixGetMatrixResult gate_matrix_get_matrix(const emscripten::val &gateMatrixGetMatrixInfo) { return gateMatrix_get_matrix(gateMatrixGetMatrixInfo); }

    // @see https://emscripten.org/docs/porting/Debugging.html#handling-c-exceptions-from-javascriptd
    std::string getExceptionMessage(intptr_t exceptionPtr) { return std::string(reinterpret_cast<std::exception *>(exceptionPtr)->what()); }
}

EMSCRIPTEN_BINDINGS(Bindings) {
    emscripten::register_vector<double>("vector<double>");
    emscripten::register_vector<CPPCTYPE>("vector<CPPCTYPE>");
    emscripten::register_vector<ITYPE>("vector<ITYPE>");
    emscripten::register_vector<int>("vector<int>");
    emscripten::register_vector<long int>("vector<long int>");

    emscripten::value_object<ComplexMatrix>("ComplexMatrix");

    emscripten::value_object<DataCppResult>("DataCppResult")
        .field("doubleVec", &DataCppResult::doubleVec)
        .field("cppVec", &DataCppResult::cppVec);

    emscripten::value_object<SamplingResult>("SamplingResult")
        .field("doubleVec", &SamplingResult::doubleVec)
        .field("cppVec", &SamplingResult::cppVec)
        .field("samplingVec", &SamplingResult::samplingVec);

    emscripten::value_object<GetZeroProbabilityResult>("GetZeroProbabilityResult")
        .field("prob", &GetZeroProbabilityResult::prob);

    emscripten::value_object<GetMarginalProbabilityResult>("GetMarginalProbabilityResult")
        .field("marginal_prob", &GetMarginalProbabilityResult::marginal_prob);

    emscripten::value_object<GateBaseGetMatrixResult>("GateBaseGetMatrixResult")
        .field("doubleVec", &GateBaseGetMatrixResult::doubleVec)
        .field("cppMat", &GateBaseGetMatrixResult::cppMat);

    emscripten::value_object<GateMatrixGetMatrixResult>("GateMatrixGetMatrixResult")
        .field("doubleVec", &GateMatrixGetMatrixResult::doubleVec)
        .field("cppMat", &GateMatrixGetMatrixResult::cppMat);

    emscripten::function("state_dataCpp", &state_dataCpp, emscripten::allow_raw_pointers());
    emscripten::function("state_sampling", &state_sampling, emscripten::allow_raw_pointers());
    emscripten::function("state_get_zero_probability", &state_get_zero_probability, emscripten::allow_raw_pointers());
    emscripten::function("state_get_marginal_probability", &state_get_marginal_probability, emscripten::allow_raw_pointers());
    emscripten::function("gate_base_get_matrix", &gate_base_get_matrix, emscripten::allow_raw_pointers());
    emscripten::function("gate_matrix_get_matrix", &gate_matrix_get_matrix, emscripten::allow_raw_pointers());
    emscripten::function("getExceptionMessage", &getExceptionMessage);
};
