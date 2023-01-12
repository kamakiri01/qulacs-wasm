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

struct VecsFromState {
    std::vector<double> doubleVec;
    std::vector<CPPCTYPE> cppVec;
};

std::vector<double> translateCppcToVec(CPPCTYPE* raw_data_cpp, int vecSize) {
    std::vector<double> data;
    for (int i = 0; i < vecSize; i++) {
        auto c = raw_data_cpp[i];
        double real = c.real();
        double imag = c.imag();
        data.push_back(real);
        data.push_back(imag);
    }
    return data;
}

std::vector<CPPCTYPE> translateCPPtoCPPVec(CPPCTYPE* raw_data_cpp, int vecSize) {
    std::vector<CPPCTYPE> data;
    for (int i = 0; i < vecSize; i++) {
        auto c = raw_data_cpp[i];
        data.push_back(c);
    }
    return data;
}

VecsFromState vecsFromState(QuantumState* state, int size) {
    const auto raw_data_cpp = state->data_cpp();
    const int vecSize = pow(2, size);
    std::vector<double> data = translateCppcToVec(raw_data_cpp, vecSize);
    std::vector<CPPCTYPE> cppData = translateCPPtoCPPVec(raw_data_cpp, vecSize);
    return {
        doubleVec: data,
        cppVec: cppData
    };
}
