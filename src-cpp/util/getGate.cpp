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

QuantumGateBase* getGate(std::string gateType, int qubitIndex, double gateParam, std::vector<int> controllIndexs);

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

QuantumGateBase* getRotationGate(std::string gateType, double gateParam, int qubitIndex) {
    double angle = M_PI * gateParam;
    QuantumGateBase* gate;
    if (gateType == "rx") {
        gate = gate::RX(qubitIndex, angle);
    } else if (gateType == "ry") {
        gate = gate::RY(qubitIndex, angle);
    } else if (gateType == "rz") {
        gate = gate::RZ(qubitIndex, angle);
    }
    return gate;
}

QuantumGate_SingleParameter* getParametricGate(std::string gateType, double gateParam, int qubitIndex) {
    double angle = M_PI * gateParam;
    QuantumGate_SingleParameter* gate;
    if (gateType == "rx") {
        gate = gate::ParametricRX(qubitIndex, angle);
    } else if (gateType == "ry") {
        gate = gate::ParametricRY(qubitIndex, angle);
    } else if (gateType == "rz") {
        gate = gate::ParametricRZ(qubitIndex, angle);
    }
    return gate;
}


QuantumGateBase* getMultiGate(std::string gateType, int qubitIndex, std::vector<int> controllIndexs) {
    QuantumGateBase* gate;

    if (gateType == "cnot") {
        gate = gate::CNOT(controllIndexs[0], qubitIndex);
    } else if (gateType == "ccnot") {
        // @see https://github.com/corryvrequan/qulacs/blob/a1eb7cd2fb62243d28fc1ebd4da9fbd8126cf126/python/cppsim_wrapper.cpp#L308
        auto ptr = gate::X(qubitIndex);
        auto toffoli = gate::to_matrix_gate(ptr);
        toffoli->add_control_qubit(controllIndexs[0], 1);
        toffoli->add_control_qubit(controllIndexs[1], 1);
        delete ptr;
        gate = toffoli;
    }
    return gate;
}

int getIndex(std::list<std::string> ls, std::string key) {
    auto it = std::find(ls.cbegin(), ls.cend(), key);
    if (it == ls.end()) return -1;
    auto index = std::distance(ls.cbegin(), it);
    return index;
}

QuantumGateBase* getGate(std::string gateType, int qubitIndex, double gateParam, std::vector<int> controllIndexs) {
    QuantumGateBase* gate;
    // @see WasmQuantumGateType.ts
    const std::list<std::string> singleGateTypes{"x", "y", "z", "h", "t", "s"};
    const std::list<std::string> rotationGateTypes{"rx", "ry", "rz",};
    const std::list<std::string> multiGateTypes{"cnot", "ccnot"};
    if (gateType == "0") {
        // do nothing
    } else if (getIndex(singleGateTypes, gateType) > -1) {
        gate = getSingleGate(gateType, qubitIndex);
    } else if (getIndex(rotationGateTypes, gateType) > -1) {
        gate = getRotationGate(gateType, gateParam, qubitIndex);
    } else if (getIndex(multiGateTypes, gateType) > -1) {
        gate = getMultiGate(gateType, qubitIndex, controllIndexs);
    }
    return gate;
}

std::vector<double> translateCppcToVec(CPPCTYPE* raw_data_cpp, int vecSize) {
    std::vector<double> data;
    for (int i = 0; i < vecSize; i++) {
        auto c = raw_data_cpp[i];
        double real = c.real();
        double imag = c.imag();
        double a = 1.000000;
        data.push_back(real);
        data.push_back(imag);
    }
    return data;
}

std::vector<CPPCTYPE> transpaleCPPtoCPPVec(CPPCTYPE* raw_data_cpp, int vecSize) {
    std::vector<CPPCTYPE> data;
    for (int i = 0; i < vecSize; i++) {
        auto c = raw_data_cpp[i];
        data.push_back(c);
    }
    return data;
}
