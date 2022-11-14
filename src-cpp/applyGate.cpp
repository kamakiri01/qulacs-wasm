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

#include "state/double.cpp"

void applyGate(QuantumCircuit* circuit, int gateType, int qubitIndex) {
    printf("applyGate: %d\n", gateType);
    switch(gateType) {
        case 1:
            circuit->add_X_gate(qubitIndex);
            break;
        case 2:
            circuit->add_Y_gate(qubitIndex);
            break;
        case 3:
            circuit->add_Z_gate(qubitIndex);
            break;
        case 4:
            circuit->add_H_gate(qubitIndex);
            break;
        case 5:
            circuit->add_T_gate(qubitIndex);
            break;
        case 6:
            circuit->add_S_gate(qubitIndex);
            break;
    }
}

void applyParametricGate(QuantumCircuit* circuit, int gateType, double gateParam, int qubitIndex) {
    double angle = M_PI * gateParam;
    switch(gateType) {
        case 7:
            circuit->add_RX_gate(qubitIndex, angle);
            break;
        case 8:
            circuit->add_RY_gate(qubitIndex, angle);
            break;
        case 9:
            circuit->add_RZ_gate(qubitIndex, angle);
            break;
    }
}
void applyMultiGate(QuantumCircuit* circuit, int gateType, int qubitIndex, std::vector<int> controllIndexs) {
    switch(gateType) {
        case 10:
            circuit->add_CNOT_gate(qubitIndex, controllIndexs[0]);
            break;
        case 11:
        // @see https://github.com/corryvrequan/qulacs/blob/a1eb7cd2fb62243d28fc1ebd4da9fbd8126cf126/python/cppsim_wrapper.cpp#L308
            auto ptr = gate::X(qubitIndex);
            auto toffoli = gate::to_matrix_gate(ptr);
            toffoli->add_control_qubit(controllIndexs[0], 1);
            toffoli->add_control_qubit(controllIndexs[1], 1);
            delete ptr;
            circuit->add_gate(toffoli);
            break;
    }
}

std::vector<double> translateDataCppToVec(CPPCTYPE* raw_data_cpp, int vecSize) {
    std::vector<double> data;
    for (int i = 0; i < vecSize; i++) {
        auto c = raw_data_cpp[i];
        //printf("CPP: %f \n", c.real());
        //data.push_back(c.real());
        //data.push_back(c.imag());
        double real = c.real();
        double imag = c.imag();
        double a = 1.000000;
        data.push_back(real);
        data.push_back(imag);

        //data.push_back(a);
        //data.push_back(a);
        printf("c[%d] real: %f imam:%f a:%f realLX:%08lx aLX:%08lx minus:%f \n", i, real, imag, a, real, a, (a - real));
        printf("r: %f %lf %+10.10lx\n", real, real, real);
        printf("a: %f %lf %+10.10lx\n", a, a, a);

        printf("real:");
        utilFunc(real);
        printf("a:");
        utilFunc(a);
        printf("t:");
        utilFunc(0.9999999999999998);
        //printf("minus: %f\n", (a - real));
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
