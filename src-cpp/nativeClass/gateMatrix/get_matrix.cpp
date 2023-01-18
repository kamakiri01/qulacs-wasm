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

struct GateMatrixGetMatrixResult {
    std::vector<double> doubleVec;
    ComplexMatrix cppMat;
};

GateMatrixGetMatrixResult gateMatrix_get_matrix(const emscripten::val &gateMatrixGetMatrixInfo) {
    auto operators = emscripten::vecFromJSArray<emscripten::val>(gateMatrixGetMatrixInfo["operators"]);
    QuantumGateMatrix* gateMatrix;

    int operatorsCount = operators.size();
    for (size_t i = 0; i < operatorsCount; ++i) {
        auto op = emscripten::vecFromJSArray<emscripten::val>(operators[i]);
        std::string operatorType = op[0].as<std::string>();
        if (operatorType == "initvec") {
            std::vector<UINT> targetIndex = emscripten::vecFromJSArray<UINT>(op[1]);
            std::vector<UINT> controlndex = emscripten::vecFromJSArray<UINT>(op[3]);
            auto initVec = emscripten::vecFromJSArray<double>(op[2]);
            std::vector<double> data;
            std::vector<CPPCTYPE> initMatVec = transpaleComplexAltVectoCPPVec(initVec);
            int sqrtSize = sqrt(initMatVec.size());

            Eigen::Map<Eigen::MatrixXcd> m(initMatVec.data(), sqrtSize, sqrtSize);
            auto initMat = m.transpose();

            gateMatrix = new QuantumGateMatrix(targetIndex, initMat, controlndex);
        } else if (operatorType == "addcontrolqubit") {
            // wip: undefined
        }
    }

    ComplexMatrix mat;
    gateMatrix->set_matrix(mat);
    return {
        doubleVec: translateComplexMatrixToRowMajorVec(mat),
        cppMat: mat
    };
}
