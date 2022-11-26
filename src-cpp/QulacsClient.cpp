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
#include "getObservable.cpp"
#include "state/data_cpp.cpp"
#include "utilClient/getStateVectorWithExpectationValue.cpp"
#include "utilClient/runShotTask.cpp"
#include "utilClient/getExpectationValueMap.cpp"

extern "C" {
    DataCppResult state_dataCpp(const emscripten::val &serialInfo) {
        const auto data = data_cpp(serialInfo);
        return data;
    }

    GetStateVectorWithExpectationValueResult getStateVectorWithExpectationValue(const emscripten::val &v) {
        const auto result = util_getStateVectorWithExpectationValue(v);
        return result;
    }

    RunShotResult runShotTask(const emscripten::val &v) {
        const auto data = util_runShotTask(v);
        return data;
    }

    GetExpectationValueMapResult getExpectationValueMap(const emscripten::val &v) {
        const auto data = util_getExpectationValueMap(v);
        return data;
    }

    int test_calc(const emscripten::val &v) {
        const auto arr = emscripten::vecFromJSArray<int>(v);
        int num = 0;
        const int size = arr.size();
        for (int i = 0; i < size; ++i) {
            const auto e = arr[i];
            num += e;
        }
        return num;
    }

    int test_calc2(const emscripten::val &v) {
        const auto arr = emscripten::vecFromJSArray<std::string>(v);
        int num = 0;
        const int size = arr.size();
        for (int i = 0; i < size; ++i) {
            const auto e = arr[i];
            num += e.size();
        }
        return num;
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

    emscripten::value_object<DataCppResult>("DataCppResult")
        .field("doubleVec", &DataCppResult::doubleVec)
        .field("cppVec", &DataCppResult::cppVec);

    emscripten::function("getStateVectorWithExpectationValue", &getStateVectorWithExpectationValue, emscripten::allow_raw_pointers());
    emscripten::function("state_dataCpp", &state_dataCpp, emscripten::allow_raw_pointers());
    emscripten::function("runShotTask", &runShotTask, emscripten::allow_raw_pointers());
    emscripten::function("getExpectationValueMap", &getExpectationValueMap, emscripten::allow_raw_pointers());
    emscripten::function("test_calc", &test_calc, emscripten::allow_raw_pointers());
    emscripten::function("test_calc2", &test_calc2, emscripten::allow_raw_pointers());
};
