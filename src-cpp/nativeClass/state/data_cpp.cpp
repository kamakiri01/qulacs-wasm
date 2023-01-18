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
#include "../../util/vecsFromState.cpp"

struct DataCppResult {
    std::vector<double> doubleVec;
    std::vector<CPPCTYPE> cppVec;
};

DataCppResult data_cpp(const emscripten::val &serialInfo) {
    auto size = serialInfo["size"].as<int>();
    auto state = calcSerialInfoState(serialInfo);
    auto raw_data_cpp = state->data_cpp();
    int vecSize = pow(2, size);
    auto vecs = vecsFromState(state, size);
    return {
        doubleVec: vecs.doubleVec,
        cppVec: vecs.cppVec
    };
}
