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

struct RunShotResult {
    // std::vector<int> indexVector; // TODO: ITYPE を返すべきだが JS 側でlong longを扱う方法が分からないためlong intに落としている。64bit->8bitに落ちている
    std::vector<int> sampleMap;
};

// sampling 結果から分布の配列を返す
std::vector<int> createSampleMap(std::vector<ITYPE> samples, int qubit_count) {
    const int basis = std::pow(2, qubit_count);
    std::vector<int> sampleMap; // (basis)で初期化すべき？
    // 取りうる基底の数の配列長に初期化
    for (int i = 0; i < basis; i++) {
        sampleMap.push_back(0);
    }
    const int sampleSize = samples.size();
    for (size_t i = 0; i < sampleSize; ++i) {
        const int sample = (long int)samples[i]; // NNOTE: long long int対応を検討
        sampleMap[sample] += 1;
    }
    return sampleMap;
}

RunShotResult util_runShotTask(const emscripten::val &v) {
    const auto circuitInfo = v["circuitInfo"];
    const auto size = circuitInfo["size"].as<int>();
    QuantumState state = getUpdatedState(circuitInfo);
    const int shot = v["shot"].as<int>();
    const auto samples = state.sampling(shot);
    std::vector<int> sampleMap = createSampleMap(samples, size);
    return {
        sampleMap: sampleMap
    };
}
