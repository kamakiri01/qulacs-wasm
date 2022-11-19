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

GetStateVectorWithExpectationValueResult util_getExpectationValueMap(const emscripten::val &request) {
    const auto circuitInfo = request["circuitInfo"];
    const auto size = circuitInfo["size"].as<int>();
    QuantumState state = getUpdatedState(circuitInfo);
    const auto observableInfo = request["observableInfo"];
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
