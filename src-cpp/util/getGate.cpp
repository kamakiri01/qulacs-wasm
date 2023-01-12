#pragma once

#include <emscripten/bind.h>
#include <cppsim/state.hpp>
#include <cppsim/gate_factory.hpp>
#include <cppsim/gate_merge.hpp>
#include <cppsim/gate_matrix.hpp>
#include <vqcsim/parametric_circuit.hpp>
#include <vqcsim/parametric_gate.hpp>
#include <vqcsim/parametric_gate_factory.hpp>

#include <string>
#include <vector>
#include <emscripten.h>
#include <iostream>
#include <emscripten/html5.h>
#include <cppsim/circuit.hpp>

QuantumGateBase* getGate(std::vector<emscripten::val> gateData);

QuantumGateBase* getSingleGate(std::string gateType, int qubitIndex) {
    // @see WasmQuantumGateType.ts
    QuantumGateBase* gate;
    if (gateType == "x") {
        gate = gate::X(qubitIndex);
    } else if (gateType == "y") {
        gate = gate::Y(qubitIndex);
    } else if (gateType == "z") {
        gate = gate::Z(qubitIndex);
    } else if (gateType == "h") {
        gate = gate::H(qubitIndex);
    } else if (gateType == "t") {
        gate = gate::T(qubitIndex);
    } else if (gateType == "s") {
        gate = gate::S(qubitIndex);
    }
    return gate;
}

QuantumGateBase* getRotationGate(std::string gateType, int qubitIndex, double angle) {
    QuantumGateBase* gate;
    if (gateType == "rx") {
        gate = gate::RX(qubitIndex, angle);
    } else if (gateType == "ry") {
        gate = gate::RY(qubitIndex, angle);
    } else if (gateType == "rz") {
        gate = gate::RZ(qubitIndex, angle);
    } else if (gateType == "rotx") {
        gate = gate::RotX(qubitIndex, angle);
    } else if (gateType == "roty") {
        gate = gate::RotY(qubitIndex, angle);
    } else if (gateType == "rotz") {
        gate = gate::RotZ(qubitIndex, angle);
    } else {
        // throw
    }
    return gate;
}

QuantumGate_SingleParameter* getParametricGate(std::string gateType, int qubitIndex, double angle) {
    QuantumGate_SingleParameter* gate;
    if (gateType == "rx") {
        gate = gate::ParametricRX(qubitIndex, angle);
    } else if (gateType == "ry") {
        gate = gate::ParametricRY(qubitIndex, angle);
    } else if (gateType == "rz") {
        gate = gate::ParametricRZ(qubitIndex, angle);
    } else {
        // throw
    }
    return gate;
}

QuantumGateBase* getOneControlOneTargetGate(std::string gateType, int targetQubitIndex, int controlQubitIndex) {
    QuantumGateBase* gate;
    if (gateType == "cnot") {
        gate = gate::CNOT(controlQubitIndex, targetQubitIndex);
    } else if (gateType == "cz") {
        gate = gate::CZ(controlQubitIndex, targetQubitIndex);
    } else {
        // throw
    }
    return gate;
}

QuantumGateBase* getTwoControlOneTargetGate(std::string gateType, int targetQubitIndex, int controlQubitIndex0, int controlQubitIndex1) {
    QuantumGateBase* gate;
    if (gateType == "ccnot") {
        // @see https://github.com/corryvrequan/qulacs/blob/a1eb7cd2fb62243d28fc1ebd4da9fbd8126cf126/python/cppsim_wrapper.cpp#L308
        auto ptr = gate::X(targetQubitIndex);
        auto toffoli = gate::to_matrix_gate(ptr);
        toffoli->add_control_qubit(controlQubitIndex0, 1);
        toffoli->add_control_qubit(controlQubitIndex1, 1);
        delete ptr;
        gate = toffoli;
    } else {
        // throw
    }
    return gate;
}

int getIndex(std::list<std::string> ls, std::string key) {
    auto it = std::find(ls.cbegin(), ls.cend(), key);
    if (it == ls.end()) return -1;
    auto index = std::distance(ls.cbegin(), it);
    return index;
}

QuantumGateBase* getGate(std::vector<emscripten::val> gateData) {
    std::string gateType = gateData[0].as<std::string>();
    const int targetQubitIndex = gateData[1].as<int>();

    QuantumGateBase* gate;
    // @see WasmQuantumGateType.ts
    const std::list<std::string> singleGateTypes{"i", "x", "y", "z", "h", "t", "s"};
    const std::list<std::string> rotationGateTypes{"rx", "ry", "rz",};
    const std::list<std::string> oneControlOneTargetGateTypes{"cnot", "cz"};
    const std::list<std::string> twoControlOneTargetGateTypes{"ccnot"};
    if (getIndex(singleGateTypes, gateType) > -1) {
        gate = getSingleGate(gateType, targetQubitIndex);
    } else if (getIndex(rotationGateTypes, gateType) > -1) {
        const double angle = gateData[2].as<double>();
        gate = getRotationGate(gateType, targetQubitIndex, angle);
    } else if (getIndex(oneControlOneTargetGateTypes, gateType) > -1) {
        const int controlQubitIndex = gateData[2].as<int>();
        gate = getOneControlOneTargetGate(gateType, targetQubitIndex, controlQubitIndex);
    } else if (getIndex(twoControlOneTargetGateTypes, gateType) > -1) {
        const int controlQubitIndex0 = gateData[2].as<int>();
        const int controlQubitIndex1 = gateData[3].as<int>();
        gate = getTwoControlOneTargetGate(gateType, targetQubitIndex, controlQubitIndex0, controlQubitIndex1);
    }
    return gate;
}
