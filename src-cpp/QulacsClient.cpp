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

extern "C" {
    struct GetStateVectorWithExpectationValueResult {
        std::vector<double> stateVector;
        double expectationValue;
    };

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

        GetStateVectorWithExpectationValueResult getStateVectorWithExpectationValue(const emscripten::val &v) {
        // ToWasmCalcStateInfo型を分解
        const auto circuitInfo = v["circuitInfo"];
        const auto size = circuitInfo["size"].as<int>();
        printf("data size: %d\n", size);

        //QuantumCircuit circuit(size);
        QuantumCircuit* circuit = new QuantumCircuit(size);

        const auto circuitSteps = emscripten::vecFromJSArray<emscripten::val>(circuitInfo["circuit"]); // ToWasmQuantumCircuitData
        int stepsCount = circuitSteps.size();
        // いったん　CircuitInfo　的な中間型を考えずに進める。以後必要なら型名を付ける
        for (size_t i = 0; i < stepsCount; ++i) {
            const auto step = emscripten::vecFromJSArray<emscripten::val>(circuitSteps[i]); // ToWasmQuantumCircuitStep
            int stepCount = step.size();
            for (int j = 0; j < stepCount; ++j) {
                const auto gateRaw = emscripten::vecFromJSArray<emscripten::val>(step[j]); // ToWasmQuantumGate
                int gateType = gateRaw[0].as<int>();
                double gateParam = gateRaw[1].as<double>();
                std::vector<int> indexs = emscripten::vecFromJSArray<int>(gateRaw[2]);
                // ここでcircuit構築
                switch(gateType) {
                    case 0:
                        break; // empty gate. do nothing
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                        applyGate(circuit, gateType, j);
                        break;
                    case 7:
                    case 8:
                    case 9:
                        applyParametricGate(circuit, gateType, gateParam, j);
                        break;
                    case 10:
                    case 11:
                        applyMultiGate(circuit, gateType, j, indexs);
                }
            }
        }
        QuantumState state(size);
        state.set_zero_state();
        circuit->update_quantum_state(&state);

        Observable observable(size);

        const auto observableInfo = v["observableInfo"];
        auto observableSteps = emscripten::vecFromJSArray<emscripten::val>(observableInfo["observable"]); // ToWasmObservableData
        int observableStepsCount = observableSteps.size();

        printf("observableStepsCount: %d \n", observableStepsCount);
        for (size_t i = 0; i < observableStepsCount; ++i) {
            printf("for observableStepsCount: %d\n", i);
            const auto step = observableSteps[i]; // ToWasmObservableStep
            const double coefficient = step["coefficient"].as<double>();
            printf("for1\n");
            const auto operators = emscripten::vecFromJSArray<emscripten::val>(step["operators"]); // GateType[]
            printf("for2\n");
            const int operatorsCount = operators.size();
            printf("for coefficient:%lf, operatorsCount: %d\n", coefficient, operatorsCount);
            std::string Pauli_string = "";
            for (size_t j = 0; j < operatorsCount; ++j) {
                std::string pauli = "";
                int o = operators[j].as<int>();
                printf("o: %d \n", o);
                switch (o) {
                    case 0:
                        continue; // empty gate
                    case 1:
                        pauli += "X ";
                        break;
                    case 2:
                        pauli += "Y ";
                        break;
                    case 3:
                        pauli += "Z ";
                        break;
                }
                Pauli_string += pauli + std::to_string(j);
            }
            printf("Pauli_string: %8s\n", Pauli_string.c_str());
            observable.add_operator(coefficient, Pauli_string.c_str());
            printf("add_operator done\n");
        }

        // NOTE: for文前に置くべきか
        if (observableStepsCount == 0) {
            observable.add_operator(1, "");
        }
            printf("add_operator done2\n");

        const auto result = observable.get_expectation_value(&state);
        printf("exp re: %lf im:%lf \n", result.real(), result.imag());

        const auto raw_data_cpp = state.data_cpp(); // std::vector<std::complex<double>>
        std::vector<double> data;
        printf("data size: %d\n", size);
        const int vecSize = pow(2, size);
        for (int i = 0; i < vecSize; i++) {
            auto c = raw_data_cpp[i];
            data.push_back(c.real());
            data.push_back(c.imag());
            printf("c[%d] re: %lf im:%lf \n", i, c.real(), c.imag());
        }

        return {
            stateVector: data,
            expectationValue: result.real()
        };
    }
}

EMSCRIPTEN_BINDINGS(Bindings) {
    emscripten::register_vector<double>("vector<double>");
    emscripten::value_object<GetStateVectorWithExpectationValueResult>("GetStateVectorWithExpectationValueResult")
        .field("stateVector", &GetStateVectorWithExpectationValueResult::stateVector)
        .field("expectationValue", &GetStateVectorWithExpectationValueResult::expectationValue);
    emscripten::function("getStateVectorWithExpectationValue", &getStateVectorWithExpectationValue, emscripten::allow_raw_pointers());
};
