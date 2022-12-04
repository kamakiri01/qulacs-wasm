#pragma once

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

struct GerZeroProbabilityResult {
    double prob;
};

GerZeroProbabilityResult get_zero_probability(const emscripten::val &getZeroProbabilityInfo) {
    auto state = calcSerialInfoState(getZeroProbabilityInfo);
    const auto index = getZeroProbabilityInfo["target_qubit_index"].as<int>();
    auto prob = state->get_zero_probability(index);
    return {
        prob: prob
    };
}
