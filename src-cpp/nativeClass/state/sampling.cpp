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

#include "../../util/calcSerialInfoState.cpp"
#include "data_cpp.cpp"


struct SamplingResult: public DataCppResult {
    std::vector<long int> samplingVec;
};

SamplingResult sampling(const emscripten::val &samplingInfo) {
    // data_cpp相当をやって、sampingしてかえす
    auto state = calcSerialInfoState(samplingInfo);
    const auto sampling_count = samplingInfo["sampling_count"].as<int>();
    std::vector<ITYPE> rawSamples = state->sampling(sampling_count);
    std::vector<long int> samples;

    const int sampleSize = rawSamples.size();
    for (size_t i = 0; i < sampleSize; ++i) {
        const int sample = (long int)rawSamples[i]; // NNOTE: long long int対応を検討
        samples.push_back(sample);
    }

    const auto size = samplingInfo["size"].as<int>();
    const auto vecs = vecsFromState(state, size);
    SamplingResult result = {vecs.doubleVec, vecs.cppVec, samples};
    return result;
};
