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

struct GetExpectationValueMapResult {
    std::vector<double> expectationValues;
};

GetExpectationValueMapResult util_getExpectationValueMap(const emscripten::val &request) {
    const auto circuitInfo = request["circuitInfo"];
    const auto size = circuitInfo["size"].as<int>();
    const auto parametricPositionStep = request["parametricPositionStep"].as<int>();
    const auto parametricPositionQubitIndex = request["parametricPositionQubitIndex"].as<int>();

    printf("getExpectationValueMap pStep:%d pIndex:%d size:%d \n", parametricPositionStep, parametricPositionQubitIndex, size);

    ParametricQuantumCircuit* circuit = getSingleParametricCircuit(circuitInfo, parametricPositionStep, parametricPositionQubitIndex);

    QuantumState state(size);
    state.set_zero_state();
    // circuit->update_quantum_state(&state);

    const auto observableInfo = request["observableInfo"];
    Observable observable = getObservable(observableInfo, size);

    std::vector<double> expectationValues;
    const auto stepSize = request["stepSize"].as<int>();
    for (size_t i = 0; i < stepSize; ++i) {
        double angle = 2 * M_PI * ( (double)i / ( (double)stepSize - 1));
        circuit->set_parameter(0, angle);
        //auto second_state = state.copy();
        QuantumState second_state(size);
        circuit->update_quantum_state(&second_state);
        const auto result = observable.get_expectation_value(&second_state);
        const double expectationValue = result.real();
        printf("set_parameter-angle[%d]: %f expectationValue:%f \n",i, angle, expectationValue);
        expectationValues.push_back(expectationValue);
    }

    return {
        expectationValues: expectationValues
    };
}
