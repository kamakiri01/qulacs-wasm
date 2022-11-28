#include <emscripten/bind.h>
#include <cppsim/state.hpp>
#include <cppsim/gate_factory.hpp>
#include <cppsim/gate_merge.hpp>
#include <cppsim/gate_matrix.hpp>
#include <vqcsim/parametric_circuit.hpp>

#include <string>
#include <vector>
#include <emscripten.h>
#include <iostream>
#include <emscripten/html5.h>
#include <cppsim/circuit.hpp>

struct GetStateVectorWithExpectationValueResult {
    std::vector<double> stateVector;
    double expectationValue;
};

// circuitInfo から QuantumCircuit を生成して返す
QuantumCircuit* getCircuit(const emscripten::val &circuitInfo) {
    const auto size = circuitInfo["size"].as<int>();
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
            QuantumGateBase* gate = getGate(gateType, j, gateParam, indexs);
            circuit->add_gate(gate);
        }
    }
    return circuit;
}

// circuit->get_parameter_count() = 1のcircuitを返す
// circuitInfo と 対象座標から ParametricQuantumCircuit を生成して返す
ParametricQuantumCircuit* getSingleParametricCircuit(const emscripten::val &circuitInfo, int target_step, int target_index) {
    const auto size = circuitInfo["size"].as<int>();
    ParametricQuantumCircuit* circuit = new ParametricQuantumCircuit(size);

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
            if (target_step == i && target_index == j) {
                QuantumGateBase* gate = getParametricGate(gateType, j, gateParam); // step-index位置のゲートがParametricだと暗黙に仮定する。また、このパスは1回しか通らない
                circuit->add_parametric_gate((QuantumGate_SingleParameter*)gate);
            } else {
                QuantumGateBase* gate = getGate(gateType, j, gateParam, indexs);
                circuit->add_gate(gate);
            }
        }
    }
    UINT param_count = circuit->get_parameter_count();
    return circuit;
}

QuantumState getUpdatedState(const emscripten::val &circuitInfo) {
    const auto size = circuitInfo["size"].as<int>();
    QuantumCircuit* circuit = getCircuit(circuitInfo);
    QuantumState state(size);
    state.set_zero_state();
    circuit->update_quantum_state(&state);
    return state;
}

GetStateVectorWithExpectationValueResult util_getStateVectorWithExpectationValue(const emscripten::val &request) {
    const auto circuitInfo = request["circuitInfo"];
    const auto size = circuitInfo["size"].as<int>();
    QuantumState state = getUpdatedState(circuitInfo);
    const auto observableInfo = request["observableInfo"];
    Observable observable = getObservable(observableInfo, size);

    const auto result = observable.get_expectation_value(&state);
    const auto raw_data_cpp = state.data_cpp();
    const int vecSize = pow(2, size);
    std::vector<double> data = translateCppcToVec(raw_data_cpp, vecSize);

    return {
        stateVector: data,
        expectationValue: result.real()
    };
}
