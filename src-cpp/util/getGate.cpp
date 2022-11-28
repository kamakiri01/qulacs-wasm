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

QuantumGateBase* getGate(int gateType, int qubitIndex, double gateParam, std::vector<int> controllIndexs);

QuantumGateBase* getSingleGate(int gateType, int qubitIndex) {
    // @see WasmQuantumGateType.ts
    QuantumGateBase* gate;
    switch(gateType) {
        case 1:
            gate = gate::X(qubitIndex);
            break;
        case 2:
            gate = gate::Y(qubitIndex);
            break;
        case 3:
            gate = gate::Z(qubitIndex);
            break;
        case 4:
            gate = gate::H(qubitIndex);
            break;
        case 5:
            gate = gate::T(qubitIndex);
            break;
        case 6:
            gate = gate::S(qubitIndex);
            break;
    }
    return gate;
}

QuantumGateBase* getRotationGate(int gateType, double gateParam, int qubitIndex) {
    double angle = M_PI * gateParam;
    QuantumGateBase* gate;
    switch(gateType) {
        case 7:
            gate = gate::RX(qubitIndex, angle);
            break;
        case 8:
            gate = gate::RY(qubitIndex, angle);
            break;
        case 9:
            gate = gate::RZ(qubitIndex, angle);
            break;
    }
    return gate;
}

QuantumGate_SingleParameter* getParametricGate(int gateType, double gateParam, int qubitIndex) {
    double angle = M_PI * gateParam;
    QuantumGate_SingleParameter* gate;
    switch(gateType) {
        case 7:
            gate = gate::ParametricRX(qubitIndex, angle);
            break;
        case 8:
            gate = gate::ParametricRY(qubitIndex, angle);
            break;
        case 9:
            gate = gate::ParametricRZ(qubitIndex, angle);
            break;
    }
    return gate;
}


QuantumGateBase* getMultiGate(int gateType, int qubitIndex, std::vector<int> controllIndexs) {
    QuantumGateBase* gate;
    switch(gateType) {
        case 10:
            gate = gate::CNOT(controllIndexs[0], qubitIndex);
            break;
        case 11:
        // @see https://github.com/corryvrequan/qulacs/blob/a1eb7cd2fb62243d28fc1ebd4da9fbd8126cf126/python/cppsim_wrapper.cpp#L308
            auto ptr = gate::X(qubitIndex);
            auto toffoli = gate::to_matrix_gate(ptr);
            toffoli->add_control_qubit(controllIndexs[0], 1);
            toffoli->add_control_qubit(controllIndexs[1], 1);
            delete ptr;
            //circuit->add_gate(toffoli);
            gate = toffoli;
            break;
    }
    return gate;
}

QuantumGateBase* getGate(int gateType, int qubitIndex, double gateParam, std::vector<int> controllIndexs) {
    QuantumGateBase* gate;
    // @see WasmQuantumGateType.ts
    switch(gateType) {
        case 0:
            break; // empty gate. do nothing
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            gate = getSingleGate(gateType, qubitIndex);
            break;
        case 7:
        case 8:
        case 9:
            gate = getRotationGate(gateType, gateParam, qubitIndex);
            break;
        case 10:
        case 11:
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
