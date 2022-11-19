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

#include "getGate.cpp"
#include "observable.cpp"
#include "state/data_cpp.cpp"
#include "utilClient/getStateVectorWithExpectationValue.cpp"

extern "C" {
    GetStateVectorWithExpectationValueResult getStateVectorWithExpectationValue(const emscripten::val &v) {
        const auto result = util_getStateVectorWithExpectationValue(v);
        return result;
    }

    DataCppResult state_dataCpp(const emscripten::val &serialInfo) {
        const auto data = data_cpp(serialInfo);
        return data;
    }

    struct RunShotResult {
        // std::vector<int> indexVector; // TODO: ITYPE を返すべきだが JS 側でlong longを扱う方法が分からないためlong intに落としている。64bit->8bitに落ちている
        std::vector<int> sampleMap;
    };

    RunShotResult runShotTask(const emscripten::val &v) {
        const auto circuitInfo = v["circuitInfo"];
        const auto size = circuitInfo["size"].as<int>();
        QuantumState state = getUpdatedState(circuitInfo);
        const int shot = v["shot"].as<int>();
        const auto samples = state.sampling(shot);

        /*
        std::vector<long int> indexVector;
        for (size_t i = 0; i < samples.size(); ++i) {
            const int sample = (long int)samples[i];
            indexVector.push_back(sample);
        }
        */

        const int basis = std::pow(2, size);
        std::vector<int> sampleMap; // (basis)で初期化すべき？
        for (int i = 0; i < basis; i++) {
            sampleMap.push_back(0);
        }

        const int sampleSize = samples.size();
        for (size_t i = 0; i < sampleSize; ++i) {
            const int sample = (long int)samples[i];
            sampleMap[sample] += 1;
        }

        return {
            sampleMap: sampleMap
        };
    }

    struct GetExpectationValueMapResult {
        std::vector<double> expectationValues;
    };

    GetExpectationValueMapResult getExpectationValueMap(const emscripten::val &request) {
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
}

EMSCRIPTEN_BINDINGS(Bindings) {
    emscripten::register_vector<double>("vector<double>");
    emscripten::register_vector<CPPCTYPE>("vector<CPPCTYPE>");
    emscripten::register_vector<ITYPE>("vector<ITYPE>");
    emscripten::register_vector<int>("vector<int>");

    emscripten::value_object<GetStateVectorWithExpectationValueResult>("GetStateVectorWithExpectationValueResult")
        .field("stateVector", &GetStateVectorWithExpectationValueResult::stateVector)
        .field("expectationValue", &GetStateVectorWithExpectationValueResult::expectationValue);

    emscripten::value_object<RunShotResult>("RunShotResult")
        .field("sampleMap", &RunShotResult::sampleMap);

    emscripten::value_object<GetExpectationValueMapResult>("GetExpectationValueMapResult")
        .field("expectationValues", &GetExpectationValueMapResult::expectationValues);

    emscripten::function("getStateVectorWithExpectationValue", &getStateVectorWithExpectationValue, emscripten::allow_raw_pointers());
    emscripten::function("state_dataCpp", &state_dataCpp, emscripten::allow_raw_pointers());
    emscripten::function("runShotTask", &runShotTask, emscripten::allow_raw_pointers());
    emscripten::function("getExpectationValueMap", &getExpectationValueMap, emscripten::allow_raw_pointers());

    emscripten::value_object<DataCppResult>("DataCppResult")
        .field("doubleVec", &DataCppResult::doubleVec)
        .field("cppVec", &DataCppResult::cppVec);
};
