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

struct GetMarginalProbabilityResult {
    double marginal_prob;
};

GetMarginalProbabilityResult get_marginal_probability(const emscripten::val &getMarginalProbabilityInfo) {
    auto state = calcSerialInfoState(getMarginalProbabilityInfo);
    std::vector<UINT> measured_values = emscripten::vecFromJSArray<UINT>(getMarginalProbabilityInfo["measured_values"]);
    auto marginal_prob = state->get_marginal_probability(measured_values);
    return {
        marginal_prob: marginal_prob
    };
}
