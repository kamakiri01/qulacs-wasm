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

Observable getObservable(const emscripten::val &observableInfo, int size) {
    Observable observable(size);
    auto observableSteps = emscripten::vecFromJSArray<emscripten::val>(observableInfo["observable"]); // ToWasmObservableData
    int observableStepsCount = observableSteps.size();

    for (size_t i = 0; i < observableStepsCount; ++i) {
        const auto step = observableSteps[i]; // ToWasmObservableStep
        const double coefficient = step["coefficient"].as<double>();
        const auto operators = emscripten::vecFromJSArray<emscripten::val>(step["operators"]); // GateType[]
        const int operatorsCount = operators.size();
        std::string Pauli_string = "";
        for (size_t j = 0; j < operatorsCount; ++j) {
            std::string pauli = "";
            int o = operators[j].as<int>();
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
        observable.add_operator(coefficient, Pauli_string.c_str());
    }

    // NOTE: for文前に置くべきか
    if (observableStepsCount == 0) {
        observable.add_operator(1, "");
    }
    return observable;
}