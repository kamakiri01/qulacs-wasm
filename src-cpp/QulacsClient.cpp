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
#include "client/getStateVectorWithExpectationValue.cpp"
#include "client/runShotTask.cpp"
#include "client/getExpectationValueMap.cpp"

extern "C" {
    DataCppResult state_dataCpp(const emscripten::val &serialInfo) {
        const auto data = data_cpp(serialInfo);
        return data;
    }

    SamplingResult state_sampling(const emscripten::val &samplingInfo) {
        const auto data = sampling(samplingInfo);
        return data;
    }

    GerZeroProbabilityResult state_get_zero_probability(const emscripten::val &getZeroProbabilityInfo) {
        const auto data = get_zero_probability(getZeroProbabilityInfo);
        return data;
    }

    GetMarginalProbabilityResult state_get_marginal_probability(const emscripten::val &getMarginalProbabilityInfo) {
        const auto data = get_marginal_probability(getMarginalProbabilityInfo);
        return data;
    }

    GetStateVectorWithExpectationValueResult getStateVectorWithExpectationValue(const emscripten::val &v) {
        const auto result = util_getStateVectorWithExpectationValue(v);
        return result;
    }

    RunShotResult runShotTask(const emscripten::val &v) {
        const auto data = util_runShotTask(v);
        return data;
    }

    GetExpectationValueMapResult getExpectationValueMap(const emscripten::val &v) {
        const auto data = util_getExpectationValueMap(v);
        return data;
    }

}

EMSCRIPTEN_BINDINGS(Bindings) {
    emscripten::register_vector<double>("vector<double>");
    emscripten::register_vector<CPPCTYPE>("vector<CPPCTYPE>");
    emscripten::register_vector<ITYPE>("vector<ITYPE>");
    emscripten::register_vector<int>("vector<int>");
    emscripten::register_vector<long int>("vector<long int>");

    emscripten::value_object<GetStateVectorWithExpectationValueResult>("GetStateVectorWithExpectationValueResult")
        .field("stateVector", &GetStateVectorWithExpectationValueResult::stateVector)
        .field("expectationValue", &GetStateVectorWithExpectationValueResult::expectationValue);

    emscripten::value_object<RunShotResult>("RunShotResult")
        .field("sampleMap", &RunShotResult::sampleMap);

    emscripten::value_object<GetExpectationValueMapResult>("GetExpectationValueMapResult")
        .field("expectationValues", &GetExpectationValueMapResult::expectationValues);

    emscripten::value_object<DataCppResult>("DataCppResult")
        .field("doubleVec", &DataCppResult::doubleVec)
        .field("cppVec", &DataCppResult::cppVec);

    emscripten::value_object<SamplingResult>("SamplingResult")
        .field("doubleVec", &SamplingResult::doubleVec)
        .field("cppVec", &SamplingResult::cppVec)
        .field("samplingVec", &SamplingResult::samplingVec);

    emscripten::value_object<GerZeroProbabilityResult>("GerZeroProbabilityResult")
        .field("prob", &GerZeroProbabilityResult::prob);

    emscripten::value_object<GetMarginalProbabilityResult>("GetMarginalProbabilityResult")
        .field("marginal_prob", &GetMarginalProbabilityResult::marginal_prob);

    emscripten::function("getStateVectorWithExpectationValue", &getStateVectorWithExpectationValue, emscripten::allow_raw_pointers());
    emscripten::function("state_dataCpp", &state_dataCpp, emscripten::allow_raw_pointers());
    emscripten::function("state_sampling", &state_sampling, emscripten::allow_raw_pointers());
    emscripten::function("state_get_zero_probability", &state_get_zero_probability, emscripten::allow_raw_pointers());
    emscripten::function("state_get_marginal_probability", &state_get_marginal_probability, emscripten::allow_raw_pointers());
    emscripten::function("runShotTask", &runShotTask, emscripten::allow_raw_pointers());
    emscripten::function("getExpectationValueMap", &getExpectationValueMap, emscripten::allow_raw_pointers());
};
