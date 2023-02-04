#include <emscripten/bind.h>
#include <cppsim/state.hpp>
#include <cppsim/gate_factory.hpp>
#include <cppsim/gate_merge.hpp>
#include <cppsim/gate_matrix.hpp>
#include <cppsim/state_dm.hpp>
#include <string>
#include <vector>
#include <emscripten.h>
#include <iostream>
#include <emscripten/html5.h>
#include <cppsim/circuit.hpp>
#include <vqcsim/parametric_circuit.hpp>
#include <vqcsim/parametric_gate.hpp>
#include <vqcsim/parametric_gate_factory.hpp>

#include "emjs.cpp"
#include "complex.cpp"
#include "util.cpp"

extern "C" {
    // @see https://emscripten.org/docs/porting/Debugging.html#handling-c-exceptions-from-javascript
    std::string getExceptionMessage(intptr_t exceptionPtr) { return std::string(reinterpret_cast<std::exception *>(exceptionPtr)->what()); }
}

using namespace gate;
//using namespace state;
EMSCRIPTEN_BINDINGS(Bindings) {
    emscripten::function("getExceptionMessage", &getExceptionMessage);

    register_complex<double>("complex128");
    emscripten::register_vector<double>("vector<double>");
    emscripten::register_vector<CPPCTYPE>("vector<CPPCTYPE>");
    emscripten::register_vector<ITYPE>("vector<ITYPE>");
    emscripten::register_vector<int>("vector<int>");
    emscripten::register_vector<UINT>("vector<UINT>");
    emscripten::register_vector<long int>("vector<long int>");
    emscripten::value_object<ComplexMatrix>("ComplexMatrix");

    emscripten::class_<QuantumStateBase>("QuantumStateBase");
    emscripten::class_<QuantumGateBase>("QuantumGateBase");

    emscripten::class_<QuantumCircuit>("QuantumCircuit")
        .constructor<int>()
        .function("copy", &QuantumCircuit::copy, emscripten::allow_raw_pointers())
        .function("add_gate", emscripten::select_overload<void(const QuantumGateBase*)>(&QuantumCircuit::add_gate_copy), emscripten::allow_raw_pointers())
        .function("add_gate", emscripten::select_overload<void(const QuantumGateBase*, UINT)>(&QuantumCircuit::add_gate_copy), emscripten::allow_raw_pointers())
        .function("update_quantum_state", emscripten::select_overload<void(QuantumStateBase*)>(&QuantumCircuit::update_quantum_state), emscripten::allow_raw_pointers())
        .function("update_quantum_state", emscripten::select_overload<void(QuantumStateBase*, UINT, UINT)>(&QuantumCircuit::update_quantum_state), emscripten::allow_raw_pointers())
        // bad pattern. state.data_cpp()[0].real() overwrite 0 with unknown reason...
        // .function("update_quantum_state", emscripten::optional_override([](QuantumCircuit& self, QuantumState state) { self.update_quantum_state(&state); }))
        .function("calculate_depth", &QuantumCircuit::calculate_depth)
        .function("add_X_gate", &QuantumCircuit::add_X_gate)
        .function("add_H_gate", &QuantumCircuit::add_H_gate)
        .function("add_CNOT_gate", &QuantumCircuit::add_CNOT_gate);

    emscripten::class_<ParametricQuantumCircuit, emscripten::base<QuantumCircuit>>("ParametricQuantumCircuit")
        .constructor<int>()
        .function("copy", &ParametricQuantumCircuit::copy, emscripten::allow_raw_pointers())
        .function("add_parametric_gate", emscripten::select_overload<void(QuantumGate_SingleParameter*)>(&ParametricQuantumCircuit::add_parametric_gate_copy), emscripten::allow_raw_pointers())
        .function("add_parametric_gate", emscripten::select_overload<void(QuantumGate_SingleParameter*, UINT)>(&ParametricQuantumCircuit::add_parametric_gate_copy), emscripten::allow_raw_pointers())
        .function("add_parametric_RX_gate", &ParametricQuantumCircuit::add_parametric_RX_gate);

    emscripten::class_<QuantumState, emscripten::base<QuantumStateBase>>("QuantumState")
        .constructor<int>()
        .function("set_zero_state", &QuantumState::set_zero_state, emscripten::allow_raw_pointers())
        .function("set_Haar_random_state", emscripten::select_overload<void()>(&QuantumState::set_Haar_random_state), emscripten::allow_raw_pointers())
        .function("set_Haar_random_state", emscripten::select_overload<void(UINT)>(&QuantumState::set_Haar_random_state), emscripten::allow_raw_pointers())
        .function("set_computational_basis", emscripten::optional_override([](QuantumState& self, unsigned long comp_basis) { self.set_computational_basis(comp_basis); }))
        .function("get_zero_probability", &QuantumState::get_zero_probability, emscripten::allow_raw_pointers())
        .function("get_entropy", &QuantumState::get_entropy, emscripten::allow_raw_pointers())
        .function("get_vector", emscripten::optional_override([](QuantumState& self) {
            auto raw_data_cpp = self.data_cpp();
            int vecSize = pow(2, self.qubit_count);
            double arr[vecSize*2];
            for (int i = 0; i < vecSize; i++) {
                auto c = raw_data_cpp[i];
                arr[i*2] = c.real();
                arr[i*2+1] = c.imag();
            }
            return emscripten::val::take_ownership(convertArray(arr, vecSize));
        }), emscripten::allow_raw_pointers())
        .function("get_amplitude", emscripten::optional_override([](QuantumState& self, UINT index) {
            auto c = self.data_cpp()[index];
            double arr[2];
            arr[0] = c.real();
            arr[1] = c.imag();
            return emscripten::val::take_ownership(convertArray(arr, 1));
        }), emscripten::allow_raw_pointers())
        .function("get_qubit_count", emscripten::optional_override([](QuantumState& self) { return self.qubit_count; }), emscripten::allow_raw_pointers())
        .function("data_cpp", &QuantumState::data_cpp, emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](QuantumState& self, UINT sampling_count, UINT random_seed) {
            std::vector<ITYPE> samples = self.sampling(sampling_count, random_seed);
            return emscripten::val::take_ownership(convertIntArrayToJSArray(transpaleITYPEVecToIntArray(samples), samples.size()));
        }), emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](QuantumState& self, UINT sampling_count) {
            std::vector<ITYPE> samples = self.sampling(sampling_count);
            return emscripten::val::take_ownership(convertIntArrayToJSArray(transpaleITYPEVecToIntArray(samples), samples.size()));
        }), emscripten::allow_raw_pointers());

    emscripten::class_<DensityMatrix, emscripten::base<QuantumStateBase>>("DensityMatrix")
        .constructor<int>()
        .function("set_zero_state", &DensityMatrix::set_zero_state, emscripten::allow_raw_pointers())
        .function("set_Haar_random_state", emscripten::select_overload<void()>(&DensityMatrix::set_Haar_random_state), emscripten::allow_raw_pointers())
        .function("set_Haar_random_state", emscripten::select_overload<void(UINT)>(&DensityMatrix::set_Haar_random_state), emscripten::allow_raw_pointers())
        .function("set_computational_basis", emscripten::optional_override([](DensityMatrix& self, unsigned long comp_basis) { self.set_computational_basis(comp_basis); }))
        .function("get_zero_probability", &DensityMatrix::get_zero_probability, emscripten::allow_raw_pointers())
        .function("get_entropy", &DensityMatrix::get_entropy, emscripten::allow_raw_pointers())
        .function("get_matrix", emscripten::optional_override([](DensityMatrix& state) {
            auto raw_data_cpp = state.data_cpp();
            int vecSize = state.dim * state.dim;
            double arr[vecSize*2];
            CTYPE* ptr = state.data_c();
            for (ITYPE y = 0; y < state.dim; ++y) {
                for (ITYPE x = 0; x < state.dim; ++x) {
                    auto c = ptr[y * state.dim + x];
                    arr[(x+(y*state.dim))*2] = c.real();
                    arr[(x+(y*state.dim))*2+1] = c.imag();
                }
            }
            return emscripten::val::take_ownership(convertMatrix(arr, vecSize));
        }), emscripten::allow_raw_pointers())
        .function("get_marginal_probability", emscripten::optional_override([](DensityMatrix& state, const emscripten::val &measured_values) {
            std::vector<UINT> values = emscripten::vecFromJSArray<UINT>(measured_values);
            return state.get_marginal_probability(values);
        }), emscripten::allow_raw_pointers())
        .function("get_qubit_count", emscripten::optional_override([](DensityMatrix& self) {
            return self.qubit_count;
        }), emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](DensityMatrix& self, UINT sampling_count, UINT random_seed) {
            std::vector<ITYPE> samples = self.sampling(sampling_count, random_seed);
            return emscripten::val::take_ownership(convertIntArrayToJSArray(transpaleITYPEVecToIntArray(samples), samples.size()));
        }), emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](DensityMatrix& self, UINT sampling_count) {
            std::vector<ITYPE> samples = self.sampling(sampling_count);
            return emscripten::val::take_ownership(convertIntArrayToJSArray(transpaleITYPEVecToIntArray(samples), samples.size()));
        }), emscripten::allow_raw_pointers());

    emscripten::class_<ClsOneQubitGate, emscripten::base<QuantumGateBase>>("ClsOneQubitGate")
        .function("update_quantum_state", &ClsOneQubitGate::update_quantum_state, emscripten::allow_raw_pointers());

    emscripten::class_<ClsTwoQubitGate, emscripten::base<QuantumGateBase>>("ClsTwoQubitGate")
        .function("update_quantum_state", &ClsTwoQubitGate::update_quantum_state, emscripten::allow_raw_pointers());

    emscripten::class_<ClsOneControlOneTargetGate, emscripten::base<QuantumGateBase>>("ClsOneControlOneTargetGate")
        .function("update_quantum_state", &ClsOneControlOneTargetGate::update_quantum_state, emscripten::allow_raw_pointers());

    emscripten::function("X", &X, emscripten::allow_raw_pointers());
    emscripten::function("Y", &Y, emscripten::allow_raw_pointers());
    emscripten::function("Z", &Z, emscripten::allow_raw_pointers());
    emscripten::function("H", &H, emscripten::allow_raw_pointers());
    emscripten::function("S", &S, emscripten::allow_raw_pointers());
    emscripten::function("T", &T, emscripten::allow_raw_pointers());
    emscripten::function("CNOT", &CNOT, emscripten::allow_raw_pointers());
    emscripten::function("RX", &RX, emscripten::allow_raw_pointers());

    // NOTE: https://github.com/emscripten-core/emscripten/issues/11497
    emscripten::function("partial_trace", emscripten::optional_override([](const QuantumState* state, const emscripten::val &trace) {
                std::vector<UINT> traceVec = emscripten::vecFromJSArray<UINT>(trace);
                return state::partial_trace(state, traceVec);
            }), emscripten::allow_raw_pointers());
    emscripten::function("partial_trace", emscripten::optional_override([](const DensityMatrix* state, const emscripten::val &target_traceout) {
                std::vector<UINT> traceVec = emscripten::vecFromJSArray<UINT>(target_traceout);
                return state::partial_trace(state, traceVec);
            }), emscripten::allow_raw_pointers());
};
