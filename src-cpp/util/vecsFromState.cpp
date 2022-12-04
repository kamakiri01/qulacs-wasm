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

#include "calcSerialInfoState.cpp"

struct VecsFromState {
    std::vector<double> doubleVec;
    std::vector<CPPCTYPE> cppVec;
};

VecsFromState vecsFromState(QuantumState* state, int size) {
    const auto raw_data_cpp = state->data_cpp();
    const int vecSize = pow(2, size);
    std::vector<double> data = translateCppcToVec(raw_data_cpp, vecSize);
    std::vector<CPPCTYPE> cppData = transpaleCPPtoCPPVec(raw_data_cpp, vecSize);
    return {
        doubleVec: data,
        cppVec: cppData
    };
}
