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

std::vector<CPPCTYPE> transpaleComplexAltVectoCPPVec(std::vector<double> vec) {
    std::vector<CPPCTYPE> data;
    const auto vecSize = vec.size(); // 偶数を暗黙に仮定する
    for (int i = 0; i < vecSize; i+=2) {
        auto real = vec[i];
        auto imag = vec[i+1];
        auto c = CPPCTYPE(real, imag);
        data.push_back(c);
    }
    return data;
}

void applyStateAction(QuantumState* state, std::vector<emscripten::val> stateAction) {
    const std::string stateActionTye = stateAction[0].as<std::string>();
    if (stateActionTye == "empty") {
        // do nothing
    } else if (stateActionTye == "setzerostate") {
        state->set_zero_state();
    } else if (stateActionTye == "setcomputationalbasis") {
        int comp_basis = stateAction[1].as<int>();
        state->set_computational_basis(comp_basis);
    } else if (stateActionTye == "sethaarrandomstatenoseed") {
        state->set_Haar_random_state();
    } else if (stateActionTye == "sethaarrandomstateseed") {
        auto seed = stateAction[1].as<UINT>();
        state->set_Haar_random_state(seed);
    } else if (stateActionTye == "loadwasmvector") {
        auto wasmVec = stateAction[1].as<std::vector<CPPCTYPE>>();
        state->load(wasmVec);
    } else if (stateActionTye == "loadcomplexserialvector") {
        auto complexAltVec = emscripten::vecFromJSArray<double>(stateAction[1]);
        auto wasmVec = transpaleComplexAltVectoCPPVec(complexAltVec);
        state->load(wasmVec);
    }
}

void applyOperatorGate(QuantumState* state, std::vector<emscripten::val> gateData) {
    QuantumGateBase* gate = getGate(gateData);
    gate->update_quantum_state(state);
    delete gate;
}

QuantumState* calcSerialInfoState(const emscripten::val &serialInfo) {
    const auto size = serialInfo["size"].as<int>();
    QuantumState* state = new QuantumState(size);
    const auto operators = emscripten::vecFromJSArray<emscripten::val>(serialInfo["operators"]);
    int operatorsCount = operators.size();
    for (size_t i = 0; i < operatorsCount; ++i) {
        const auto op = emscripten::vecFromJSArray<emscripten::val>(operators[i]);
        const std::string operatorType = op[0].as<std::string>();
        const auto operatorData = emscripten::vecFromJSArray<emscripten::val>(op[1]);
        if (operatorType == "stateaction") {
            applyStateAction(state, operatorData);
        } else if (operatorType == "gate") {
            applyOperatorGate(state, operatorData);
        }
    }
    return state;
}
