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

struct SamplingResult: DataCppResult {
    std::vector<long int> samplingVec;
};

SamplingResult sampling(const emscripten::val &samplingInfo) {
    // data_cpp相当をやって、sampingしてかえす
    const auto size = samplingInfo["size"].as<int>();
    auto state = calcSerialInfoState(samplingInfo);
    const auto sampling_count = samplingInfo["sampling_count"].as<int>();
    std::vector<ITYPE> rawSamples = state->sampling(sampling_count);
    std::vector<long int> samples;

    const int sampleSize = rawSamples.size();
    for (size_t i = 0; i < sampleSize; ++i) {
        const int sample = (long int)rawSamples[i]; // NNOTE: long long int対応を検討
        samples.push_back(sample);
    }

    return {
        samplingVec: samples
    };
};
