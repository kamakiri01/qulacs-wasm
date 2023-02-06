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

    emscripten::class_<QuantumState, emscripten::base<QuantumStateBase>>("QuantumState")
        .constructor<int>()
        .function("set_zero_state", &QuantumState::set_zero_state, emscripten::allow_raw_pointers())
        .function("set_Haar_random_state", emscripten::select_overload<void()>(&QuantumState::set_Haar_random_state), emscripten::allow_raw_pointers())
        .function("set_Haar_random_state", emscripten::select_overload<void(UINT)>(&QuantumState::set_Haar_random_state), emscripten::allow_raw_pointers())
        .function("set_computational_basis", emscripten::optional_override([](QuantumState& self, unsigned long comp_basis) { self.set_computational_basis(comp_basis); }))
        .function("get_zero_probability", &QuantumState::get_zero_probability, emscripten::allow_raw_pointers())
        .function("get_marginal_probability", &QuantumState::get_marginal_probability, emscripten::allow_raw_pointers())
        .function("get_entropy", &QuantumState::get_entropy, emscripten::allow_raw_pointers())
        .function("get_squared_norm", &QuantumState::get_squared_norm, emscripten::allow_raw_pointers())
        .function("normalize", &QuantumState::normalize, emscripten::allow_raw_pointers())
        .function("allocate_buffer", &QuantumState::allocate_buffer, emscripten::allow_raw_pointers())
        .function("copy", &QuantumState::copy, emscripten::allow_raw_pointers())
        .function("load", emscripten::select_overload<void(const QuantumStateBase*)>(&QuantumState::load), emscripten::allow_raw_pointers())
        // .function("load", emscripten::select_overload<void(const QuantumState)>(&QuantumState::load), emscripten::allow_raw_pointers()) // add (const std::vector<CPPCTYPE>&) optional_override
        .function("get_device_name", &QuantumState::get_device_name, emscripten::allow_raw_pointers())
        .function("add_state", &QuantumState::add_state, emscripten::allow_raw_pointers())
        .function("multiply_coef", &QuantumState::multiply_coef, emscripten::allow_raw_pointers())
        .function("multiply_elementwise_function", &QuantumState::multiply_elementwise_function, emscripten::allow_raw_pointers())
        .function("get_classical_value", &QuantumState::get_classical_value, emscripten::allow_raw_pointers())
        .function("set_classical_value", &QuantumState::set_classical_value, emscripten::allow_raw_pointers())
        .function("to_string", &QuantumState::to_string, emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](QuantumState& self, UINT sampling_count, UINT random_seed) {
            std::vector<ITYPE> samples = self.sampling(sampling_count, random_seed);
            return emscripten::val::take_ownership(convertIntArrayToJSArray(transpaleITYPEVecToIntArray(samples), samples.size()));
        }), emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](QuantumState& self, UINT sampling_count) {
            std::vector<ITYPE> samples = self.sampling(sampling_count);
            return emscripten::val::take_ownership(convertIntArrayToJSArray(transpaleITYPEVecToIntArray(samples), samples.size()));
        }), emscripten::allow_raw_pointers())
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
        .function("data_cpp", &QuantumState::data_cpp, emscripten::allow_raw_pointers());

    emscripten::class_<DensityMatrix, emscripten::base<QuantumStateBase>>("DensityMatrix")
        .constructor<int>()
        .function("set_zero_state", &DensityMatrix::set_zero_state, emscripten::allow_raw_pointers())
        .function("set_computational_basis", emscripten::optional_override([](DensityMatrix& self, unsigned long comp_basis) { self.set_computational_basis(comp_basis); }))
        .function("set_Haar_random_state", emscripten::select_overload<void()>(&DensityMatrix::set_Haar_random_state), emscripten::allow_raw_pointers())
        .function("set_Haar_random_state", emscripten::select_overload<void(UINT)>(&DensityMatrix::set_Haar_random_state), emscripten::allow_raw_pointers())
        .function("get_zero_probability", &DensityMatrix::get_zero_probability, emscripten::allow_raw_pointers())
        .function("get_marginal_probability", emscripten::optional_override([](DensityMatrix& state, const emscripten::val &measured_values) {
            std::vector<UINT> values = emscripten::vecFromJSArray<UINT>(measured_values);
            return state.get_marginal_probability(values);
        }), emscripten::allow_raw_pointers())
        .function("get_qubit_count", emscripten::optional_override([](DensityMatrix& self) {
            return self.qubit_count;
        }), emscripten::allow_raw_pointers())
        .function("get_entropy", &DensityMatrix::get_entropy, emscripten::allow_raw_pointers())
        .function("get_squared_norm", &DensityMatrix::get_squared_norm, emscripten::allow_raw_pointers())
        .function("normalize", &DensityMatrix::normalize, emscripten::allow_raw_pointers())
        .function("allocate_buffer", &DensityMatrix::allocate_buffer, emscripten::allow_raw_pointers())
        .function("copy", &DensityMatrix::copy, emscripten::allow_raw_pointers())
        .function("load", emscripten::select_overload<void(const QuantumStateBase*)>(&DensityMatrix::load), emscripten::allow_raw_pointers())
        // load (const std::vector<CPPCTYPE>&))
        // load (const ComplexMatrix&)
        .function("get_device_name", &DensityMatrix::get_device_name, emscripten::allow_raw_pointers())
        .function("add_state", &DensityMatrix::add_state, emscripten::allow_raw_pointers())
        .function("multiply_coef", &DensityMatrix::multiply_coef, emscripten::allow_raw_pointers())
        .function("get_classical_value", &DensityMatrix::get_classical_value, emscripten::allow_raw_pointers())
        .function("set_classical_value", &DensityMatrix::set_classical_value, emscripten::allow_raw_pointers())
        .function("to_string", &DensityMatrix::to_string, emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](DensityMatrix& self, UINT sampling_count, UINT random_seed) {
            std::vector<ITYPE> samples = self.sampling(sampling_count, random_seed);
            return emscripten::val::take_ownership(convertIntArrayToJSArray(transpaleITYPEVecToIntArray(samples), samples.size()));
        }), emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](DensityMatrix& self, UINT sampling_count) {
            std::vector<ITYPE> samples = self.sampling(sampling_count);
            return emscripten::val::take_ownership(convertIntArrayToJSArray(transpaleITYPEVecToIntArray(samples), samples.size()));
        }), emscripten::allow_raw_pointers())
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
        }), emscripten::allow_raw_pointers());


    emscripten::class_<QuantumGateBase>("QuantumGateBase")
        .function("update_quantum_state", &QuantumGateBase::update_quantum_state, emscripten::allow_raw_pointers())
        .function("copy", &QuantumGateBase::copy, emscripten::allow_raw_pointers())
        .function("to_string", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
        .function("get_matrix", emscripten::optional_override([](QuantumGateBase& gate) {
            ComplexMatrix mat;
            gate.set_matrix(mat);
            int arrSize = mat.rows() * mat.cols();
            double arr[arrSize*2];
            for (ITYPE y = 0; y < mat.cols(); ++y) {
                for (ITYPE x = 0; x < mat.rows(); ++x) {
                    auto c = mat(x, y);
                    arr[(x+(y*mat.cols()))*2] = c.real();
                    arr[(x+(y*mat.cols()))*2+1] = c.imag();
                }
            }
            return emscripten::val::take_ownership(convertMatrix(arr, arrSize));
        }), emscripten::allow_raw_pointers())
    .function("to__repr___string", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
    .function("get_target_index_list", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
    .function("get_control_index_list", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
    .function("get_name", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
    .function("is_commute", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
    .function("is_Pauli", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
    .function("is_Clifford", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
    .function("is_Gaussian", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
    .function("is_parametric", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
    .function("is_diagonal", &QuantumGateBase::to_string, emscripten::allow_raw_pointers());

    emscripten::class_<ClsOneQubitGate, emscripten::base<QuantumGateBase>>("ClsOneQubitGate");
    emscripten::class_<ClsTwoQubitGate, emscripten::base<QuantumGateBase>>("ClsTwoQubitGate");
    emscripten::class_<ClsOneControlOneTargetGate, emscripten::base<QuantumGateBase>>("ClsOneControlOneTargetGate");

    emscripten::class_<QuantumGateMatrix, emscripten::base<QuantumGateBase>>("QuantumGateMatrix");
    /*
        .function("update_quantum_state", &QuantumGateMatrix::update_quantum_state, emscripten::allow_raw_pointers())
        .function("add_control_qubit", &QuantumGateMatrix::add_control_qubit, emscripten::allow_raw_pointers())
        .function("multiply_scalar", &QuantumGateMatrix::multiply_scalar, emscripten::allow_raw_pointers())
        .function("copy", &QuantumGateMatrix::copy, emscripten::allow_raw_pointers())
        .function("to_string", &QuantumGateMatrix::to_string, emscripten::allow_raw_pointers())
    */

    emscripten::function("Identity", &gate::Identity, emscripten::allow_raw_pointers());
    emscripten::function("X", &gate::X, emscripten::allow_raw_pointers());
    emscripten::function("Y", &gate::Y, emscripten::allow_raw_pointers());
    emscripten::function("Z", &gate::Z, emscripten::allow_raw_pointers());
    emscripten::function("H", &gate::H, emscripten::allow_raw_pointers());
    emscripten::function("S", &gate::S, emscripten::allow_raw_pointers());
    emscripten::function("Sdag", &gate::Sdag, emscripten::allow_raw_pointers());
    emscripten::function("T", &gate::T, emscripten::allow_raw_pointers());
    emscripten::function("Tdag", &gate::Tdag, emscripten::allow_raw_pointers());
    emscripten::function("RX", &gate::RX, emscripten::allow_raw_pointers());
    emscripten::function("RY", &gate::RY, emscripten::allow_raw_pointers());
    emscripten::function("RZ", &gate::RZ, emscripten::allow_raw_pointers());
    emscripten::function("RotInvX", &gate::RotInvX, emscripten::allow_raw_pointers());
    emscripten::function("RotInvY", &gate::RotInvY, emscripten::allow_raw_pointers());
    emscripten::function("RotInvZ", &gate::RotInvZ, emscripten::allow_raw_pointers());
    emscripten::function("RotX", &gate::RotX, emscripten::allow_raw_pointers());
    emscripten::function("RotY", &gate::RotY, emscripten::allow_raw_pointers());
    emscripten::function("RotZ", &gate::RotZ, emscripten::allow_raw_pointers());
    emscripten::function("CNOT", &gate::CNOT, emscripten::allow_raw_pointers());
    emscripten::function("CZ", &gate::CZ, emscripten::allow_raw_pointers());
    emscripten::function("SWAP", &gate::SWAP, emscripten::allow_raw_pointers());
    emscripten::function("TOFFOLI", emscripten::optional_override([](UINT control_index1, UINT control_index2, UINT target_index) {
            // @see https://github.com/corryvrequan/qulacs/blob/a1eb7cd2fb62243d28fc1ebd4da9fbd8126cf126/python/cppsim_wrapper.cpp#L308
            auto ptr = gate::X(target_index);
            if (ptr == NULL) throw std::invalid_argument("Invalid argument passed to TOFFOLI.");
            auto toffoli = gate::to_matrix_gate(ptr);
            toffoli->add_control_qubit(control_index1, 1);
            toffoli->add_control_qubit(control_index2, 1);
            delete ptr;
            return toffoli;
        }), emscripten::allow_raw_pointers());

    emscripten::class_<QuantumCircuit>("QuantumCircuit")
        .constructor<int>()
        .function("copy", &QuantumCircuit::copy, emscripten::allow_raw_pointers())
        .function("add_gate_consume", emscripten::select_overload<void(QuantumGateBase*)>(&QuantumCircuit::add_gate), emscripten::allow_raw_pointers())
        .function("add_gate_consume", emscripten::select_overload<void(QuantumGateBase*, UINT)>(&QuantumCircuit::add_gate), emscripten::allow_raw_pointers())
        .function("add_gate", emscripten::select_overload<void(const QuantumGateBase*)>(&QuantumCircuit::add_gate_copy), emscripten::allow_raw_pointers())
        .function("add_gate", emscripten::select_overload<void(const QuantumGateBase*, UINT)>(&QuantumCircuit::add_gate_copy), emscripten::allow_raw_pointers())
        .function("remove_gate", &QuantumCircuit::remove_gate)
        .function("update_quantum_state", emscripten::select_overload<void(QuantumStateBase*)>(&QuantumCircuit::update_quantum_state), emscripten::allow_raw_pointers())
        .function("update_quantum_state", emscripten::select_overload<void(QuantumStateBase*, UINT, UINT)>(&QuantumCircuit::update_quantum_state), emscripten::allow_raw_pointers())
        // bad pattern. state.data_cpp()[0].real() overwrite 0 with unknown reason...
        // .function("update_quantum_state", emscripten::optional_override([](QuantumCircuit& self, QuantumState state) { self.update_quantum_state(&state); }))
        .function("calculate_depth", &QuantumCircuit::calculate_depth)
        .function("add_X_gate", &QuantumCircuit::add_X_gate)
        .function("add_Y_gate", &QuantumCircuit::add_Y_gate)
        .function("add_Z_gate", &QuantumCircuit::add_Z_gate)
        .function("add_H_gate", &QuantumCircuit::add_H_gate)
        .function("add_S_gate", &QuantumCircuit::add_H_gate)
        .function("add_Sdag_gate", &QuantumCircuit::add_Sdag_gate)
        .function("add_T_gate", &QuantumCircuit::add_T_gate)
        .function("add_Tdag_gate", &QuantumCircuit::add_Tdag_gate)
        .function("add_CNOT_gate", &QuantumCircuit::add_CNOT_gate)
        .function("add_CZ_gate", &QuantumCircuit::add_CZ_gate)
        .function("add_SWAP_gate", &QuantumCircuit::add_SWAP_gate)
        .function("add_RX_gate", &QuantumCircuit::add_RX_gate)
        .function("add_RY_gate", &QuantumCircuit::add_RY_gate)
        .function("add_RZ_gate", &QuantumCircuit::add_RZ_gate);

    emscripten::class_<ParametricQuantumCircuit, emscripten::base<QuantumCircuit>>("ParametricQuantumCircuit")
        .constructor<int>()
        .function("copy", &ParametricQuantumCircuit::copy, emscripten::allow_raw_pointers())
        .function("add_parametric_gate", emscripten::select_overload<void(QuantumGate_SingleParameter*)>(&ParametricQuantumCircuit::add_parametric_gate_copy), emscripten::allow_raw_pointers())
        .function("add_parametric_gate", emscripten::select_overload<void(QuantumGate_SingleParameter*, UINT)>(&ParametricQuantumCircuit::add_parametric_gate_copy), emscripten::allow_raw_pointers())
        .function("add_parametric_RX_gate", &ParametricQuantumCircuit::add_parametric_RX_gate);

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
