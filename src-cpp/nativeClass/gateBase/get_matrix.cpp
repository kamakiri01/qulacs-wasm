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

struct GateBaseGetMatrixResult {
    std::vector<double> doubleVec;
    ComplexMatrix cppMat;
};

std::vector<double> translateComplexMatrixToRowMajorVec(ComplexMatrix mat) {
    std::vector<double> data;
    for(int i=0;i<mat.rows();++i){
        for(int j=0;j<mat.cols();++j){
            auto c = mat(i, j);
            double real = c.real();
            double imag = c.imag();
            data.push_back(real);
            data.push_back(imag); 
        }
    }
    return data;
}

GateBaseGetMatrixResult gateBase_get_matrix(const emscripten::val &gateBaseGetMatrixInfo) {
    auto gateData = emscripten::vecFromJSArray<emscripten::val>(gateBaseGetMatrixInfo["gate"]);
    auto gate = getGate(gateData);
    ComplexMatrix mat;
    gate->set_matrix(mat);
    return {
        doubleVec: translateComplexMatrixToRowMajorVec(mat),
        cppMat: mat
    };
}
