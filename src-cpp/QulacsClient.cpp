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

#include "applyGate.cpp"
#include "observable.cpp"
#include "state/data_cpp.cpp"

extern "C" {
    struct GetStateVectorWithExpectationValueResult {
        std::vector<double> stateVector;
        double expectationValue;
    };

    QuantumState getUpdatedState(const emscripten::val &circuitInfo) {
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
        return state;
    }

    GetStateVectorWithExpectationValueResult getStateVectorWithExpectationValue(const emscripten::val &v) {
        const auto circuitInfo = v["circuitInfo"];
        const auto size = circuitInfo["size"].as<int>();
        QuantumState state = getUpdatedState(circuitInfo);
        const auto observableInfo = v["observableInfo"];
        Observable observable = getObservable(observableInfo, size);

        const auto result = observable.get_expectation_value(&state);
        printf("exp re: %lf im:%lf \n", result.real(), result.imag());

        const auto raw_data_cpp = state.data_cpp();
        const int vecSize = pow(2, size);
        std::vector<double> data = translateDataCppToVec(raw_data_cpp, vecSize);

        return {
            stateVector: data,
            expectationValue: result.real()
        };
    }

//---
    DataCppResult state_dataCpp(const emscripten::val &serialInfo) {
        const auto data = data_cpp(serialInfo);
        return data;
    }
}

EMSCRIPTEN_BINDINGS(Bindings) {
    emscripten::register_vector<double>("vector<double>");
    emscripten::register_vector<CPPCTYPE>("vector<CPPCTYPE>");
    emscripten::value_object<GetStateVectorWithExpectationValueResult>("GetStateVectorWithExpectationValueResult")
        .field("stateVector", &GetStateVectorWithExpectationValueResult::stateVector)
        .field("expectationValue", &GetStateVectorWithExpectationValueResult::expectationValue);
    emscripten::function("getStateVectorWithExpectationValue", &getStateVectorWithExpectationValue, emscripten::allow_raw_pointers());
    emscripten::function("state_dataCpp", &state_dataCpp, emscripten::allow_raw_pointers());
    emscripten::value_object<DataCppResult>("DataCppResult")
        .field("doubleVec", &DataCppResult::doubleVec)
        .field("cppVec", &DataCppResult::cppVec);
};
