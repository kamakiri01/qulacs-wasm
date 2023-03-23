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
#include <cppsim/utility.hpp>
#include <vqcsim/parametric_circuit.hpp>
#include <vqcsim/parametric_gate.hpp>
#include <vqcsim/parametric_gate_factory.hpp>
#include <vqcsim/GradCalculator.hpp>
#include <cppsim/circuit_optimizer.hpp>
#include <cppsim/simulator.hpp>
#include <cppsim/noisesimulator.hpp>
#include <vqcsim/causalcone_simulator.hpp>

#include "vector.cpp"
//#include "emjs.cpp"
#include "complex.cpp"
#include "util.cpp"

extern "C" {
    // @see https://emscripten.org/docs/porting/Debugging.html#handling-c-exceptions-from-javascript
    std::string getExceptionMessage(intptr_t exceptionPtr) { return std::string(reinterpret_cast<std::exception *>(exceptionPtr)->what()); }

    extern int invoke_function_pointer(int(*f)(int), int a) {
        int r = (*f)(a);
        return r;
    }
}

EMSCRIPTEN_BINDINGS(Bindings) {
    emscripten::function("getExceptionMessage", &getExceptionMessage);

    register_complex<double>("complex128");
    // @see ./vector.cpp
    /*
    emscripten::register_vector<double>("vector<double>");
    emscripten::register_vector<CPPCTYPE>("vector<CPPCTYPE>");
    emscripten::register_vector<ITYPE>("vector<ITYPE>");
    emscripten::register_vector<int>("vector<int>");
    emscripten::register_vector<UINT>("vector<UINT>");
    emscripten::register_vector<long int>("vector<long int>");
    */

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
        // NOTE: QuantumState#loadは引数1つにvectorとQuantumStateが渡るオーバーロードがあるが、
        // embindはoverloadTableをargの数でテーブル管理しているため、同時にこのオーバーロードを持つことができない。
        // https://github.com/emscripten-core/emscripten/issues/3436
        // https://github.com/emscripten-core/emscripten/issues/3588
        // そのため、load_XXXとしてバインドを露出し、JavaScript側クラスのprototype.loadでバインドを呼び分けることでユーザ向けにオーバーロード相当を実現する。
        .function("load_QuantumStateBase", emscripten::optional_override([](QuantumState& self, const QuantumStateBase &state) {
            self.load(&state);
        }), emscripten::allow_raw_pointers())
        .function("load_Vector", emscripten::optional_override([](QuantumState& self,  const emscripten::val &v) {
            std::vector<CPPCTYPE> vec = translateJSArraytoCPPVec(v);
            self.load(vec);
        }), emscripten::allow_raw_pointers())
        .function("get_device_name", &QuantumState::get_device_name, emscripten::allow_raw_pointers())
        .function("add_state", &QuantumState::add_state, emscripten::allow_raw_pointers())
        .function("multiply_coef_double", emscripten::optional_override([](QuantumState& self, const double &coef) {
            std::complex<double> c(coef, 0);
            self.multiply_coef(c);
        }), emscripten::allow_raw_pointers())
        .function("multiply_coef_complex", emscripten::optional_override([](QuantumState& self, const emscripten::val &v) {
            std::complex<double> c(v["real"].as<double>(), v["imag"].as<double>());
            self.multiply_coef(c);
        }), emscripten::allow_raw_pointers())
        .function("multiply_elementwise_function_wrapper", emscripten::optional_override([](QuantumState& self, intptr_t funcPtr) {
            // JSのfuncPtr先の関数をC++の型でラップする
            std::function<CPPCTYPE(ITYPE)> func = [funcPtr](ITYPE num) -> CPPCTYPE {
                int castedNum = (int) num;
                double complexArr[2]; // 戻り値のcomplex要素を格納するメモリを確保する
                QuantumStateMultiplyElementwiseFunctionWrapper(funcPtr, castedNum, complexArr); // メモリにfuncPtrの実行結果を書き込む
                double real = complexArr[0];
                double imag = complexArr[1];
                std::complex<double> c(real, imag);
                return c;
            };
            return self.multiply_elementwise_function(func);
        }), emscripten::allow_raw_pointers())
        .function("get_classical_value", &QuantumState::get_classical_value, emscripten::allow_raw_pointers())
        .function("set_classical_value", &QuantumState::set_classical_value, emscripten::allow_raw_pointers())
        .function("to_string", &QuantumState::to_string, emscripten::allow_raw_pointers())
        // NOTE: ITYPEをJSArrayにそのまま渡せないためoptional_overrideを使う
        .function("sampling", emscripten::optional_override([](QuantumState& self, UINT sampling_count, UINT random_seed) {
            std::vector<ITYPE> samples = self.sampling(sampling_count, random_seed);
            return emscripten::val::take_ownership(transpaleITYPEVecToJSArray(samples));
        }), emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](QuantumState& self, UINT sampling_count) {
            std::vector<ITYPE> samples = self.sampling(sampling_count);
            return emscripten::val::take_ownership(transpaleITYPEVecToJSArray(samples));
        }), emscripten::allow_raw_pointers())
        .function("get_vector", emscripten::optional_override([](QuantumState& self) {
            auto raw_data_cpp = self.data_cpp();
            int vecSize = pow(2, self.qubit_count);
            return emscripten::val::take_ownership(translateCPPArrToJSComplexArray(raw_data_cpp, vecSize));
        }), emscripten::allow_raw_pointers())
        .function("get_amplitude", emscripten::optional_override([](QuantumState& self, UINT index) {
            auto c = self.data_cpp()[index];
            return emscripten::val::take_ownership(translateCPPToJSComplex(c));
        }), emscripten::allow_raw_pointers())
        //.function("to_json", emscripten::optional_override([](QuantumState& self) { return to_json(self.to_ptree()); }), emscripten::allow_raw_pointers());
        // .function("data_cpp", &QuantumState::data_cpp, emscripten::allow_raw_pointers());
        .function("get_qubit_count", emscripten::optional_override([](QuantumState& self) { return self.qubit_count; }), emscripten::allow_raw_pointers());

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
        .function("get_qubit_count", emscripten::optional_override([](DensityMatrix& self) { return self.qubit_count; }), emscripten::allow_raw_pointers())
        .function("get_entropy", &DensityMatrix::get_entropy, emscripten::allow_raw_pointers())
        .function("get_squared_norm", &DensityMatrix::get_squared_norm, emscripten::allow_raw_pointers())
        .function("normalize", &DensityMatrix::normalize, emscripten::allow_raw_pointers())
        .function("allocate_buffer", &DensityMatrix::allocate_buffer, emscripten::allow_raw_pointers())
        //.function("copy", &DensityMatrix::copy, emscripten::allow_raw_pointers())
        .function("copy", emscripten::optional_override([](DensityMatrix& self) {
            return self.copy();
        }), emscripten::allow_raw_pointers())
        .function("load_QuantumStateBase", emscripten::optional_override([](DensityMatrix& self, const QuantumStateBase &state) {
            self.load(&state);
        }), emscripten::allow_raw_pointers())
        .function("load_Vector", emscripten::optional_override([](DensityMatrix& self,  const emscripten::val &v) {
            std::vector<CPPCTYPE> vec = translateJSArraytoCPPVec(v);
            self.load(vec);
        }), emscripten::allow_raw_pointers())
        .function("load_Matrix", emscripten::optional_override([](DensityMatrix& self,  const emscripten::val &v) {
            ComplexMatrix mat = translateJSMatrixtoComplexMatrix(v);
            self.load(mat);
        }), emscripten::allow_raw_pointers())
        .function("get_device_name", &DensityMatrix::get_device_name, emscripten::allow_raw_pointers())
        .function("add_state", &DensityMatrix::add_state, emscripten::allow_raw_pointers())
        .function("multiply_coef_double", emscripten::optional_override([](DensityMatrix& self, const double &coef) {
            std::complex<double> c(coef, 0);
            self.multiply_coef(c);
        }), emscripten::allow_raw_pointers())

        .function("multiply_coef_complex", emscripten::optional_override([](DensityMatrix& self, const emscripten::val &v) {
            std::complex<double> c(v["real"].as<double>(), v["imag"].as<double>());
            self.multiply_coef(c);
        }), emscripten::allow_raw_pointers())
        .function("get_classical_value", &DensityMatrix::get_classical_value, emscripten::allow_raw_pointers())
        .function("set_classical_value", &DensityMatrix::set_classical_value, emscripten::allow_raw_pointers())
        .function("to_string", &DensityMatrix::to_string, emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](DensityMatrix& self, UINT sampling_count, UINT random_seed) {
            std::vector<ITYPE> samples = self.sampling(sampling_count, random_seed);
            return emscripten::val::take_ownership(transpaleITYPEVecToJSArray(samples));
        }), emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](DensityMatrix& self, UINT sampling_count) {
            std::vector<ITYPE> samples = self.sampling(sampling_count);
            return emscripten::val::take_ownership(transpaleITYPEVecToJSArray(samples));
        }), emscripten::allow_raw_pointers())
        .function("get_matrix", emscripten::optional_override([](DensityMatrix& state) {
            int size = state.dim * state.dim;
            CTYPE* ptr = state.data_c();
            return emscripten::val::take_ownership(translateCTYPEArrMatrixToJSComplexMatrix(ptr, size, state.dim));
        }), emscripten::allow_raw_pointers());

    emscripten::class_<QuantumGateBase>("QuantumGateBase")
        .function("update_quantum_state", &QuantumGateBase::update_quantum_state, emscripten::allow_raw_pointers())
        .function("copy", &QuantumGateBase::copy, emscripten::allow_raw_pointers())
        .function("to_string", &QuantumGateBase::to_string, emscripten::allow_raw_pointers())
        .function("get_matrix", emscripten::optional_override([](QuantumGateBase& gate) {
            ComplexMatrix mat;
            gate.set_matrix(mat);
            return emscripten::val::take_ownership(translateComplexMatrixToJSComplexMatrix(mat));
        }), emscripten::allow_raw_pointers())
        //.function("to__repr___string", &QuantumGateBase::to__repr___string, emscripten::allow_raw_pointers())
        .function("get_target_index_list", &QuantumGateBase::get_target_index_list, emscripten::allow_raw_pointers())
        .function("get_control_index_list", &QuantumGateBase::get_control_index_list, emscripten::allow_raw_pointers())
        .function("get_name", &QuantumGateBase::get_name, emscripten::allow_raw_pointers())
        .function("is_commute", &QuantumGateBase::is_commute, emscripten::allow_raw_pointers())
        .function("is_Pauli", &QuantumGateBase::is_Pauli, emscripten::allow_raw_pointers())
        .function("is_Clifford", &QuantumGateBase::is_Clifford, emscripten::allow_raw_pointers())
        .function("is_Gaussian", &QuantumGateBase::is_Gaussian, emscripten::allow_raw_pointers())
        .function("is_parametric", &QuantumGateBase::is_parametric, emscripten::allow_raw_pointers())
        .function("is_diagonal", &QuantumGateBase::is_diagonal, emscripten::allow_raw_pointers());

    emscripten::class_<ClsPauliGate, emscripten::base<QuantumGateBase>>("ClsPauliGate");
    emscripten::class_<ClsOneQubitGate, emscripten::base<QuantumGateBase>>("ClsOneQubitGate");
    emscripten::class_<ClsPauliRotationGate, emscripten::base<QuantumGateBase>>("ClsPauliRotationGate");
    emscripten::class_<ClsTwoQubitGate, emscripten::base<QuantumGateBase>>("ClsTwoQubitGate");
    emscripten::class_<ClsOneQubitRotationGate, emscripten::base<QuantumGateBase>>("ClsOneQubitRotationGate");
    emscripten::class_<ClsOneControlOneTargetGate, emscripten::base<QuantumGateBase>>("ClsOneControlOneTargetGate");
    emscripten::class_<QuantumGate_SingleParameter, emscripten::base<QuantumGateBase>>("QuantumGate_SingleParameter")
        .function("set_parameter_value", &QuantumGate_SingleParameter::set_parameter_value, emscripten::allow_raw_pointers())
        .function("get_parameter_value", &QuantumGate_SingleParameter::get_parameter_value, emscripten::allow_raw_pointers());
    
    emscripten::class_<QuantumGateMatrix, emscripten::base<QuantumGateBase>>("QuantumGateMatrix")
        .function("to_string", &QuantumGateMatrix::to_string, emscripten::allow_raw_pointers())
        .function("copy", &QuantumGateMatrix::copy, emscripten::allow_raw_pointers())

        .function("multiply_scalar", emscripten::optional_override([](QuantumGateMatrix& self, const emscripten::val &value) {
            self.multiply_scalar(translateJSNumberOrComplexToCPPCTYPE(value));
        }), emscripten::allow_raw_pointers())

        .function("add_control_qubit", &QuantumGateMatrix::add_control_qubit, emscripten::allow_raw_pointers());
    emscripten::class_<QuantumGateSparseMatrix, emscripten::base<QuantumGateBase>>("QuantumGateSparseMatrix");
    emscripten::class_<QuantumGateDiagonalMatrix, emscripten::base<QuantumGateBase>>("QuantumGateDiagonalMatrix");
    emscripten::class_<ClsReversibleBooleanGate, emscripten::base<QuantumGateBase>>("ClsReversibleBooleanGate");
    emscripten::class_<ClsStateReflectionGate, emscripten::base<QuantumGateBase>>("ClsStateReflectionGate");
    emscripten::class_<QuantumGate_Probabilistic, emscripten::base<QuantumGateBase>>("QuantumGate_Probabilistic");
    emscripten::class_<QuantumGate_CPTP, emscripten::base<QuantumGateBase>>("QuantumGate_CPTP");
    //emscripten::class_<QuantumGate_Instrument, emscripten::base<QuantumGateBase>>("QuantumGate_Instrument");
    emscripten::class_<ClsNoisyEvolution, emscripten::base<QuantumGateBase>>("ClsNoisyEvolution");
    emscripten::class_<ClsNoisyEvolution_fast, emscripten::base<QuantumGateBase>>("ClsNoisyEvolution_fast");

    emscripten::function("Identity", &gate::Identity, emscripten::allow_raw_pointers());
    emscripten::function("X", &gate::X, emscripten::allow_raw_pointers());
    emscripten::function("Y", &gate::Y, emscripten::allow_raw_pointers());
    emscripten::function("Z", &gate::Z, emscripten::allow_raw_pointers());
    emscripten::function("H", &gate::H, emscripten::allow_raw_pointers());
    emscripten::function("S", &gate::S, emscripten::allow_raw_pointers());
    emscripten::function("Sdag", &gate::Sdag, emscripten::allow_raw_pointers());
    emscripten::function("T", &gate::T, emscripten::allow_raw_pointers());
    emscripten::function("Tdag", &gate::Tdag, emscripten::allow_raw_pointers());
    emscripten::function("sqrtX", &gate::sqrtX, emscripten::allow_raw_pointers());
    emscripten::function("sqrtYdag", &gate::sqrtXdag, emscripten::allow_raw_pointers());
    emscripten::function("sqrtY", &gate::sqrtY, emscripten::allow_raw_pointers());
    emscripten::function("sqrtYdag", &gate::sqrtYdag, emscripten::allow_raw_pointers());
    emscripten::function("P0", &gate::P0, emscripten::allow_raw_pointers());
    emscripten::function("P1", &gate::P1, emscripten::allow_raw_pointers());
    emscripten::function("U1", &gate::U1, emscripten::allow_raw_pointers());
    emscripten::function("U2", &gate::U2, emscripten::allow_raw_pointers());
    emscripten::function("U3", &gate::U3, emscripten::allow_raw_pointers());
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
    emscripten::function("FREDKIN", emscripten::optional_override([](UINT control_index, UINT target_index1, UINT target_index2) {
        // @see https://github.com/qulacs/qulacs/blob/2e6e0dc3feda505af5dbe1ae95c5973f7596f3aa/python/cppsim_wrapper.cpp#L855
        auto ptr = gate::SWAP(target_index1, target_index2);
        auto fredkin = gate::to_matrix_gate(ptr);
        fredkin->add_control_qubit(control_index, 1);
        delete ptr;
        return fredkin;
    }), emscripten::allow_raw_pointers());
    emscripten::function("Pauli", emscripten::optional_override([](const emscripten::val &target_qubit_index_list, const emscripten::val &pauli_ids) {
        std::vector<UINT> target_list = emscripten::vecFromJSArray<UINT>(target_qubit_index_list);
        std::vector<UINT> pauli_list = emscripten::vecFromJSArray<UINT>(pauli_ids);
        // @see https://github.com/qulacs/qulacs/blob/2e6e0dc3feda505af5dbe1ae95c5973f7596f3aa/python/cppsim_wrapper.cpp#L868
        if (target_list.size() != pauli_list.size())
            throw std::invalid_argument("Size of qubit list and pauli list must be equal.");
        auto ptr = gate::Pauli(target_list, pauli_list);
        return ptr;
    }), emscripten::allow_raw_pointers());
    emscripten::function("PauliRotation", emscripten::optional_override([](const emscripten::val &target_qubit_index_list, const emscripten::val &pauli_ids, double angle) {
        std::vector<UINT> target_list = emscripten::vecFromJSArray<UINT>(target_qubit_index_list);
        std::vector<UINT> pauli_list = emscripten::vecFromJSArray<UINT>(pauli_ids);
        // @see https://github.com/qulacs/qulacs/blob/2e6e0dc3feda505af5dbe1ae95c5973f7596f3aa/python/cppsim_wrapper.cpp#L881
        if (target_list.size() != pauli_list.size())
            throw std::invalid_argument("Size of qubit list and pauli list must be equal.");
        auto ptr = gate::PauliRotation(target_list, pauli_list, angle);
        return ptr;
    }), emscripten::allow_raw_pointers());
    emscripten::function("DenseMatrix_UINT", emscripten::optional_override([](UINT target_qubit_index, const emscripten::val &matrix) {
        ComplexMatrix mat = translateJSMatrixtoComplexMatrix(matrix);
        // @see https://github.com/qulacs/qulacs/blob/2e6e0dc3feda505af5dbe1ae95c5973f7596f3aa/python/cppsim_wrapper.cpp#L881
		if (mat.rows() != 2 || mat.cols() != 2) throw std::invalid_argument("matrix dims is not 2x2.");
		auto ptr = gate::DenseMatrix(target_qubit_index, mat);
		if (ptr == NULL) throw std::invalid_argument("Invalid argument passed to DenseMatrix.");
		return ptr;
    }), emscripten::allow_raw_pointers());
    emscripten::function("DenseMatrix_vector_UINT", emscripten::optional_override([](const emscripten::val &target_qubit_index_list, const emscripten::val &matrix) {
        std::vector<UINT> target_list = emscripten::vecFromJSArray<UINT>(target_qubit_index_list); // NOTE: arrayではないUINTを受けられるオーバーライドが必要
        ComplexMatrix mat = translateJSMatrixtoComplexMatrix(matrix);
        const ITYPE dim = 1ULL << target_list.size();
        if (mat.rows() != dim || mat.cols() != dim)
            throw std::invalid_argument("matrix dims is not consistent.");
        auto ptr = gate::DenseMatrix(target_list, mat);
        return ptr;

    }), emscripten::allow_raw_pointers());
    emscripten::function("SparseMatrix", emscripten::optional_override([](const emscripten::val &target_qubit_index_list, const emscripten::val &matrix) {
        std::vector<UINT> target_list = emscripten::vecFromJSArray<UINT>(target_qubit_index_list);
        SparseComplexMatrix mat = translateJSMatrixtoSparseComplexMatrix(matrix);
        const ITYPE dim = 1ULL << target_list.size();
        if (mat.rows() != dim || mat.cols() != dim)
            throw std::invalid_argument("matrix dims is not consistent.");
        auto ptr = gate::SparseMatrix(target_list, mat);
        return ptr;
    }), emscripten::allow_raw_pointers());

    /*
    emscripten::function("DiagonalMatrix", emscripten::optional_override([](const emscripten::val &target_qubit_index_list, const emscripten::val &diagonal_element) {
        std::vector<UINT> target_list = emscripten::vecFromJSArray<UINT>(target_qubit_index_list);
        ComplexVector vec = translateJSArraytoCPPVec(diagonal_element);
        const ITYPE dim = 1ULL << target_list.size();
        if (vec.size() != dim)
            throw std::invalid_argument("dim of diagonal elemet is not consistent.");
        auto ptr =
            gate::DiagonalMatrix(target_list, vec);
        return ptr;
    }), emscripten::allow_raw_pointers());
    */
    emscripten::function("RandomUnitary", emscripten::select_overload<QuantumGateMatrix*(std::vector<UINT>)>(&gate::RandomUnitary), emscripten::allow_raw_pointers());
    emscripten::function("RandomUnitary", emscripten::select_overload<QuantumGateMatrix*(std::vector<UINT>, UINT)>(&gate::RandomUnitary), emscripten::allow_raw_pointers());
    emscripten::function("ReversibleBoolean", emscripten::optional_override([](const emscripten::val &target_qubit_index_list, intptr_t funcPtr) {
        // JSのfuncで処理する際に内部的にはまたJSの値に戻るが、C++側で一旦Vector化する
        std::vector<UINT> target_list = emscripten::vecFromJSArray<UINT>(target_qubit_index_list); // NOTE: arrayではないUINTを受けられるようにする
        // JSのfuncPtr先の関数をC++の型でラップする
        auto func = [funcPtr](int val, int dim) -> int {
            return ReversibleBooleanWrapper(funcPtr, val, dim);
        };
        return gate::ReversibleBoolean(target_list, func);
    }), emscripten::allow_raw_pointers());

    emscripten::function("StateReflection", &gate::StateReflection, emscripten::allow_raw_pointers());
    emscripten::function("BitFlipNoise", &gate::BitFlipNoise, emscripten::allow_raw_pointers());
    emscripten::function("DephasingNoise", &gate::DephasingNoise, emscripten::allow_raw_pointers());
    emscripten::function("IndependentXZNoise", &gate::IndependentXZNoise, emscripten::allow_raw_pointers());
    emscripten::function("DepolarizingNoise", &gate::DepolarizingNoise, emscripten::allow_raw_pointers());
    emscripten::function("TwoQubitDepolarizingNoise", &gate::TwoQubitDepolarizingNoise, emscripten::allow_raw_pointers());
    emscripten::function("AmplitudeDampingNoise", &gate::AmplitudeDampingNoise, emscripten::allow_raw_pointers());
    emscripten::function("Measurement", &gate::Measurement, emscripten::allow_raw_pointers());

    emscripten::function("NoisyEvolution_fast_pointer", emscripten::optional_override([](Observable* hamiltonian, const emscripten::val &c_ops, double time) {
        std::vector<intptr_t> pointerVec = emscripten::vecFromJSArray<intptr_t>(c_ops);
        std::vector<GeneralQuantumOperator*> ops_list;
        auto vecSize = pointerVec.size();
        for (int i = 0; i < vecSize; i++) {
            intptr_t ptr = pointerVec[i]; // uintptr_t かも
            GeneralQuantumOperator *s = (GeneralQuantumOperator*) ptr;
            ops_list.push_back(s);
        }

        return gate::NoisyEvolution_fast(hamiltonian, ops_list, time);
    }), emscripten::allow_raw_pointers());

    emscripten::class_<QuantumCircuit>("QuantumCircuit")
        .constructor<int>()
        .function("copy", &QuantumCircuit::copy, emscripten::allow_raw_pointers())
        .function("to_string", &QuantumCircuit::to_string, emscripten::allow_raw_pointers())
        //.function("add_gate_consume", emscripten::select_overload<void(QuantumGateBase*)>(&QuantumCircuit::add_gate), emscripten::allow_raw_pointers())
        //.function("add_gate_consume", emscripten::select_overload<void(QuantumGateBase*, UINT)>(&QuantumCircuit::add_gate), emscripten::allow_raw_pointers())
        .function("add_gate", emscripten::optional_override([](QuantumCircuit& self, const QuantumGateBase* state) {
            self.add_gate_copy(state);
        }), emscripten::allow_raw_pointers())
        .function("add_gate", emscripten::optional_override([](QuantumCircuit& self, const QuantumGateBase* state, UINT index) {
            self.add_gate_copy(state, index);
        }), emscripten::allow_raw_pointers())
        .function("add_noise_gate", emscripten::select_overload<void(QuantumGateBase*, std::string, double)>(&QuantumCircuit::add_noise_gate_copy), emscripten::allow_raw_pointers())

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
        .function("add_U1_gate", &QuantumCircuit::add_U1_gate)
        .function("add_U2_gate", &QuantumCircuit::add_U2_gate)
        .function("add_U3_gate", &QuantumCircuit::add_U3_gate)
        .function("add_RX_gate", &QuantumCircuit::add_RX_gate)
        .function("add_RY_gate", &QuantumCircuit::add_RY_gate)
        .function("add_RZ_gate", &QuantumCircuit::add_RZ_gate)
        .function("add_RotInvX_gate", &QuantumCircuit::add_RX_gate)
        .function("add_RotInvY_gate", &QuantumCircuit::add_RY_gate)
        .function("add_RotInvZ_gate", &QuantumCircuit::add_RZ_gate)
        .function("add_RotX_gate", &QuantumCircuit::add_RX_gate)
        .function("add_RotY_gate", &QuantumCircuit::add_RY_gate)
        .function("add_RotZ_gate", &QuantumCircuit::add_RZ_gate);

    // NOTE: baseを利用すると、ParametricQuantumCircuit#add_gateがQuantumCircuit#add_Gateが定義されているoverloadTableを上書きしてしまうため、base宣言を外す実装も検討する
    // その場合、emscriptenから継承関係を認識できなくなるため、BindingErrorが発生しうる
    emscripten::class_<ParametricQuantumCircuit, emscripten::base<QuantumCircuit>>("ParametricQuantumCircuit")
    // emscripten::class_<ParametricQuantumCircuit>("ParametricQuantumCircuit")
        .constructor<int>()
        .function("copy", &ParametricQuantumCircuit::copy, emscripten::allow_raw_pointers())
        .function("add_parametric_gate", emscripten::select_overload<void(QuantumGate_SingleParameter*)>(&ParametricQuantumCircuit::add_parametric_gate_copy), emscripten::allow_raw_pointers())
        .function("add_parametric_gate", emscripten::select_overload<void(QuantumGate_SingleParameter*, UINT)>(&ParametricQuantumCircuit::add_parametric_gate_copy), emscripten::allow_raw_pointers())
        .function("add_parametric_RX_gate", &ParametricQuantumCircuit::add_parametric_RX_gate)
        .function("add_parametric_RY_gate", &ParametricQuantumCircuit::add_parametric_RY_gate)
        .function("add_parametric_RZ_gate", &ParametricQuantumCircuit::add_parametric_RZ_gate)
        .function("add_parametric_multi_Pauli_rotation_gate", emscripten::optional_override([](ParametricQuantumCircuit& self, const emscripten::val &target, const emscripten::val &pauli_id, double initial_angle) {
            std::vector<UINT> target_list = emscripten::vecFromJSArray<UINT>(target);
            std::vector<UINT> pauli_id_list = emscripten::vecFromJSArray<UINT>(pauli_id);
            self.add_parametric_multi_Pauli_rotation_gate(target_list, pauli_id_list, initial_angle);
        }), emscripten::allow_raw_pointers())
        //.function("add_gate", emscripten::select_overload<void(const QuantumGateBase*)>(&ParametricQuantumCircuit::add_gate_copy), emscripten::allow_raw_pointers())
        //.function("add_gate", emscripten::select_overload<void(const QuantumGateBase*, UINT)>(&ParametricQuantumCircuit::add_gate_copy), emscripten::allow_raw_pointers())
        .function("get_parameter_count", &ParametricQuantumCircuit::get_parameter_count, emscripten::allow_raw_pointers())
        .function("get_parameter", &ParametricQuantumCircuit::get_parameter, emscripten::allow_raw_pointers())
        .function("set_parameter", &ParametricQuantumCircuit::set_parameter, emscripten::allow_raw_pointers())
        .function("get_parametric_gate_position", &ParametricQuantumCircuit::get_parametric_gate_position, emscripten::allow_raw_pointers())
        .function("remove_gate", &ParametricQuantumCircuit::remove_gate, emscripten::allow_raw_pointers())
        .function("backprop", &ParametricQuantumCircuit::backprop, emscripten::allow_raw_pointers())
        .function("backprop_inner_product", &ParametricQuantumCircuit::backprop_inner_product, emscripten::allow_raw_pointers());
        

    emscripten::class_<GeneralQuantumOperator>("GeneralQuantumOperator")
        .constructor<int>()
        .function("get_term_count", &GeneralQuantumOperator::get_term_count, emscripten::allow_raw_pointers())
        .function("get_qubit_count", &GeneralQuantumOperator::get_qubit_count, emscripten::allow_raw_pointers())
        .function("get_term", &GeneralQuantumOperator::get_term, emscripten::allow_raw_pointers())
        .function("is_hermitian", &GeneralQuantumOperator::is_hermitian, emscripten::allow_raw_pointers())
        //.function("apply_to_state", &GeneralQuantumOperator::apply_to_state, emscripten::allow_raw_pointers())
        .function("apply_to_state", emscripten::optional_override([](GeneralQuantumOperator& self, QuantumStateBase* work_state, const QuantumStateBase& state_to_be_multiplied, QuantumStateBase* dst_state) {
            self.apply_to_state(work_state, state_to_be_multiplied, dst_state);
        }), emscripten::allow_raw_pointers())
        .function("get_transition_amplitude", emscripten::optional_override([](GeneralQuantumOperator& self, const QuantumStateBase* state_bra, const QuantumStateBase* state_ket) {
            auto c = self.get_transition_amplitude(state_bra, state_ket);
            return emscripten::val::take_ownership(translateCPPToJSComplex(c));
        }), emscripten::allow_raw_pointers())
        .function("add_operator", emscripten::optional_override([](GeneralQuantumOperator& self, const PauliOperator* mpt) {
            self.add_operator(mpt);
        }), emscripten::allow_raw_pointers())
        .function("add_operator", emscripten::optional_override([](GeneralQuantumOperator& self, const emscripten::val &coef, const emscripten::val &pauli_string) {
            auto c = translateJSNumberOrComplexToCPPCTYPE(coef);
            auto str = pauli_string.as<std::string>();
            self.add_operator(c,str);
        }), emscripten::allow_raw_pointers())
        .function("add_operator", emscripten::optional_override([](GeneralQuantumOperator& self, const emscripten::val &target_qubit_index_list, const emscripten::val &target_qubit_pauli_list, const emscripten::val &coef) {
            std::vector<UINT> index_list = emscripten::vecFromJSArray<UINT>(target_qubit_index_list);
            std::vector<UINT> pauli_list = emscripten::vecFromJSArray<UINT>(target_qubit_pauli_list);
            auto c = translateJSNumberOrComplexToCPPCTYPE(coef);
            self.add_operator(index_list, pauli_list, c);

        }), emscripten::allow_raw_pointers())
        .function("get_expectation_value", emscripten::optional_override([](GeneralQuantumOperator& self, const QuantumStateBase* state) {
            auto c = self.get_expectation_value(state);
            return emscripten::val::take_ownership(translateCPPToJSComplex(c));
        }), emscripten::allow_raw_pointers());

    emscripten::class_<HermitianQuantumOperator, emscripten::base<GeneralQuantumOperator>>("HermitianQuantumOperator")
        .constructor<int>();

    emscripten::class_<PauliOperator>("PauliOperator")
        .constructor()
        .constructor(emscripten::select_overload<PauliOperator(emscripten::val)>([](emscripten::val coef) {
            CPPCTYPE c = translateJSNumberOrComplexToCPPCTYPE(coef);
            PauliOperator pauli(c);
            return pauli;
        }))
        .constructor(emscripten::select_overload<PauliOperator(std::string, emscripten::val)>([](std::string strings, emscripten::val coef) {
            CPPCTYPE c = translateJSNumberOrComplexToCPPCTYPE(coef);
            PauliOperator pauli(strings, c);
            return pauli;
        }))
        .function("add_single_Pauli", &PauliOperator::add_single_Pauli, emscripten::allow_raw_pointers())
        .function("get_index_list", &PauliOperator::get_index_list, emscripten::allow_raw_pointers())
        .function("get_pauli_id_list", &PauliOperator::get_pauli_id_list, emscripten::allow_raw_pointers())
        .function("get_coef", emscripten::optional_override([](PauliOperator& self) {
            auto c = self.get_coef();
            return emscripten::val::take_ownership(translateCPPToJSComplex(c));
        }), emscripten::allow_raw_pointers())
        .function("copy", &PauliOperator::copy, emscripten::allow_raw_pointers())
        .function("change_coef", emscripten::optional_override([](PauliOperator& self, const emscripten::val coef) {
            CPPCTYPE c = translateJSNumberOrComplexToCPPCTYPE(coef);
            self.change_coef(c);
        }), emscripten::allow_raw_pointers())
        .function("get_pauli_string", &PauliOperator::get_pauli_string, emscripten::allow_raw_pointers())
        .function("get_expectation_value", emscripten::optional_override([](PauliOperator& self, const QuantumState* state) {
            CPPCTYPE c = self.get_expectation_value(state);
            return emscripten::val::take_ownership(translateCPPToJSComplex(c));
        }), emscripten::allow_raw_pointers())
        .function("get_transition_amplitude", emscripten::optional_override([](PauliOperator& self, const QuantumStateBase* state_bra, const QuantumStateBase* state_ket) {
            CPPCTYPE c = self.get_transition_amplitude(state_bra, state_ket);
            return emscripten::val::take_ownership(translateCPPToJSComplex(c));
        }), emscripten::allow_raw_pointers());

    emscripten::class_<QuantumCircuitOptimizer>("QuantumCircuitOptimizer")
        .constructor()
        .function("optimize", &QuantumCircuitOptimizer::optimize, emscripten::allow_raw_pointers())
        .function("optimize_light", &QuantumCircuitOptimizer::optimize_light, emscripten::allow_raw_pointers())
        .function("merge_all", &QuantumCircuitOptimizer::merge_all, emscripten::allow_raw_pointers());

    emscripten::class_<GradCalculator>("GradCalculator")
        .constructor()
        .function("calculate_grad", emscripten::optional_override([](GradCalculator& self, ParametricQuantumCircuit& x, Observable& obs) {
            std::vector<std::complex<double>> complexVec = self.calculate_grad(x, obs);
            return emscripten::val::take_ownership(translateCPPVecToJSComplexArray(complexVec));
        }), emscripten::allow_raw_pointers())
        .function("calculate_grad", emscripten::optional_override([](GradCalculator& self, ParametricQuantumCircuit& x, Observable& obs, const emscripten::val &theta) {
            std::vector<double> thetaVec = emscripten::vecFromJSArray<double>(theta);
            std::vector<std::complex<double>> complexVec = self.calculate_grad(x, obs, thetaVec);
            return emscripten::val::take_ownership(translateCPPVecToJSComplexArray(complexVec));
        }), emscripten::allow_raw_pointers());

    emscripten::class_<QuantumCircuitSimulator>("QuantumCircuitSimulator")
        .constructor<QuantumCircuit*, QuantumStateBase*>()
        .function("initialize_state_itype_wrapper", emscripten::optional_override([](QuantumCircuitSimulator& self, int computationl_basis) {
            ITYPE basis = (ITYPE) computationl_basis;
            self.initialize_state(basis);
        }), emscripten::allow_raw_pointers())
        .function("initialize_random_state", emscripten::select_overload<void()>(&QuantumCircuitSimulator::initialize_random_state), emscripten::allow_raw_pointers())
        .function("initialize_random_state", emscripten::select_overload<void(UINT)>(&QuantumCircuitSimulator::initialize_random_state), emscripten::allow_raw_pointers())
        .function("simulate", &QuantumCircuitSimulator::simulate, emscripten::allow_raw_pointers())
        .function("simulate_range", &QuantumCircuitSimulator::simulate_range, emscripten::allow_raw_pointers())
        .function("get_expectation_value", emscripten::optional_override([](QuantumCircuitSimulator& self, const Observable* observable) {
            CPPCTYPE c = self.get_expectation_value(observable);
            return emscripten::val::take_ownership(translateCPPToJSComplex(c));
        }), emscripten::allow_raw_pointers())
        .function("get_gate_count", &QuantumCircuitSimulator::get_gate_count, emscripten::allow_raw_pointers())
        .function("copy_state_to_buffer", &QuantumCircuitSimulator::copy_state_to_buffer, emscripten::allow_raw_pointers())
        .function("copy_state_from_buffer", &QuantumCircuitSimulator::copy_state_from_buffer, emscripten::allow_raw_pointers())
        .function("swap_state_and_buffer", &QuantumCircuitSimulator::swap_state_and_buffer, emscripten::allow_raw_pointers());

    emscripten::class_<NoiseSimulator>("NoiseSimulator")
        .constructor<QuantumCircuit*, QuantumState*>()
        .function("execute", emscripten::optional_override([](NoiseSimulator& self, const UINT sample_count) {
            std::vector<ITYPE> samples = self.execute(sample_count);
            return emscripten::val::take_ownership(transpaleITYPEVecToJSArray(samples));
        }), emscripten::allow_raw_pointers());

    emscripten::class_<CausalConeSimulator>("CausalConeSimulator")
        .constructor<const ParametricQuantumCircuit&, const Observable&>()
        .function("build", &CausalConeSimulator::build, emscripten::allow_raw_pointers())
        .function("get_expectation_value", emscripten::optional_override([](CausalConeSimulator& self) {
            CPPCTYPE c = self.get_expectation_value();
            return emscripten::val::take_ownership(translateCPPToJSComplex(c));
        }), emscripten::allow_raw_pointers())
        .function("get_circuit_list", &CausalConeSimulator::get_circuit_list, emscripten::allow_raw_pointers())
        .function("get_pauli_operator_list", &CausalConeSimulator::get_pauli_operator_list, emscripten::allow_raw_pointers())
        .function("get_coef_list", emscripten::optional_override([](CausalConeSimulator& self) {
            std::vector<CPPCTYPE> cVec = self.get_coef_list();
            return emscripten::val::take_ownership(translateCPPVecToJSComplexArray(cVec));
        }), emscripten::allow_raw_pointers());

    // NOTE: https://github.com/emscripten-core/emscripten/issues/11497
    emscripten::function("partial_trace_QuantumState", emscripten::optional_override([](const QuantumState* state, const emscripten::val &target_traceout) {
        std::vector<UINT> traceVec = emscripten::vecFromJSArray<UINT>(target_traceout);
        return state::partial_trace(state, traceVec);
    }), emscripten::allow_raw_pointers());
    emscripten::function("partial_trace_DensityMatrix", emscripten::optional_override([](const DensityMatrix* state, const emscripten::val &target_traceout) {
        std::vector<UINT> traceVec = emscripten::vecFromJSArray<UINT>(target_traceout);
        return state::partial_trace(state, traceVec);
    }), emscripten::allow_raw_pointers());

    emscripten::function("to_matrix_gate", &gate::to_matrix_gate, emscripten::allow_raw_pointers());
    emscripten::function("inner_product", emscripten::optional_override([](const QuantumState* state_bra, const QuantumState* state_ket) {
        auto c = state::inner_product(state_bra, state_ket);
        return emscripten::val::take_ownership(translateCPPToJSComplex(c));
    }), emscripten::allow_raw_pointers());
    emscripten::function("tensor_product_QuantumState", emscripten::select_overload<QuantumState*(const QuantumState*, const QuantumState*)>(&state::tensor_product), emscripten::allow_raw_pointers());     
    emscripten::function("tensor_product_DensityMatrix", emscripten::select_overload<DensityMatrix*(const DensityMatrix*, const DensityMatrix*)>(&state::tensor_product), emscripten::allow_raw_pointers());
    emscripten::function("permutate_qubit_QuantumState", emscripten::optional_override([](const QuantumState* state, const emscripten::val &qubit_order) {
        std::vector<UINT> order = emscripten::vecFromJSArray<UINT>(qubit_order);
        return state::permutate_qubit(state, order);
    }), emscripten::allow_raw_pointers());
    emscripten::function("permutate_qubit_DensityMatrix", emscripten::optional_override([](const DensityMatrix* state, const emscripten::val &qubit_order) {
        std::vector<UINT> order = emscripten::vecFromJSArray<UINT>(qubit_order);
        return state::permutate_qubit(state, order);
    }), emscripten::allow_raw_pointers());
    emscripten::function("drop_qubit", emscripten::optional_override([](const QuantumState* state, const emscripten::val &target, const emscripten::val &projection) {
        std::vector<UINT> t = emscripten::vecFromJSArray<UINT>(target);
        std::vector<UINT> p = emscripten::vecFromJSArray<UINT>(projection);
        return state::drop_qubit(state, t, p);
    }), emscripten::allow_raw_pointers());
    emscripten::function("make_superposition", emscripten::optional_override([](
        const emscripten::val &coef1, const QuantumState* state1, const emscripten::val &coef2, const QuantumState* state2) {
        auto state = state::make_superposition(
            translateJSNumberOrComplexToCPPCTYPE(coef1),
            state1,
            translateJSNumberOrComplexToCPPCTYPE(coef2),
            state2
        );
        return state;
    }), emscripten::allow_raw_pointers());

    // 引数のQuantumStateBaseはtensor_productと異なりそれぞれ違う継承クラスでも良いので、別名をJS側に出し分ける必要はない
    emscripten::function("make_mixture", emscripten::optional_override([](
        const emscripten::val &prob1, const QuantumStateBase* state1, const emscripten::val &prob2, const QuantumStateBase* state2) {
        auto state = state::make_mixture(
            translateJSNumberOrComplexToCPPCTYPE(prob1),
            state1,
            translateJSNumberOrComplexToCPPCTYPE(prob2),
            state2
        );
        return state;
    }), emscripten::allow_raw_pointers());

    emscripten::function("merge", emscripten::optional_override([](const QuantumGateBase* gate_applied_first, const QuantumGateBase* gate_applied_later) {
        return gate::merge(gate_applied_first, gate_applied_later);
    }), emscripten::allow_raw_pointers());
    emscripten::function("merge_QuantumGateBase_pointer", emscripten::optional_override([](const emscripten::val &v) {
        std::vector<intptr_t> pointerVec = emscripten::vecFromJSArray<intptr_t>(v);
        std::vector<QuantumGateBase*> list;
        auto vecSize = pointerVec.size();
        for (int i = 0; i < vecSize; i++) {
            intptr_t ptr = pointerVec[i]; // uintptr_t かも
            QuantumGateBase *s = (QuantumGateBase*) ptr;
            list.push_back(s);
        }
        return gate::merge(list);
    }), emscripten::allow_raw_pointers());

    emscripten::function("add", emscripten::optional_override([](const QuantumGateBase* gate1, const QuantumGateBase* gate2) {
        return gate::add(gate1, gate2);
    }), emscripten::allow_raw_pointers());
    emscripten::function("add_QuantumGateBase_pointer", emscripten::optional_override([](const emscripten::val &v) {
        std::vector<intptr_t> pointerVec = emscripten::vecFromJSArray<intptr_t>(v);
        std::vector<QuantumGateBase*> list;
        auto vecSize = pointerVec.size();
        for (int i = 0; i < vecSize; i++) {
            intptr_t ptr = pointerVec[i]; // uintptr_t かも
            QuantumGateBase *s = (QuantumGateBase*) ptr;
            list.push_back(s);
        }
        return gate::add(list);
    }), emscripten::allow_raw_pointers());

    emscripten::function("Probabilistic_QuantumGateBase_pointer", emscripten::optional_override([](const emscripten::val &v, const emscripten::val &v2) {
        std::vector<double> distribution = emscripten::vecFromJSArray<double>(v);
        std::vector<intptr_t> pointerVec = emscripten::vecFromJSArray<intptr_t>(v2);
        std::vector<QuantumGateBase*> list;
        auto vecSize = pointerVec.size();
        for (int i = 0; i < vecSize; i++) {
            intptr_t ptr = pointerVec[i]; // uintptr_t かも
            QuantumGateBase *s = (QuantumGateBase*) ptr;
            list.push_back(s);
        }
        return gate::Probabilistic(distribution, list);
    }), emscripten::allow_raw_pointers());

    emscripten::function("CPTP_QuantumGate_pointer", emscripten::optional_override([](const emscripten::val &v) {
        std::vector<intptr_t> pointerVec = emscripten::vecFromJSArray<intptr_t>(v);
        std::vector<QuantumGateBase*> gate_list;
        auto vecSize = pointerVec.size();
        for (int i = 0; i < vecSize; i++) {
            intptr_t ptr = pointerVec[i]; // uintptr_t かも
            QuantumGateBase *s = (QuantumGateBase*) ptr;
            gate_list.push_back(s);
        }
        return gate::CPTP(gate_list);
    }), emscripten::allow_raw_pointers());

    emscripten::function("CP_QuantumGate_pointer", emscripten::optional_override([](const emscripten::val &v, bool state_normalize, bool probability_normalize, bool assign_zero_if_not_matched) {
        std::vector<intptr_t> pointerVec = emscripten::vecFromJSArray<intptr_t>(v);
        std::vector<QuantumGateBase*> gate_list;
        auto vecSize = pointerVec.size();
        for (int i = 0; i < vecSize; i++) {
            intptr_t ptr = pointerVec[i]; // uintptr_t かも
            QuantumGateBase *s = (QuantumGateBase*) ptr;
            gate_list.push_back(s);
        }
        return gate::CP(gate_list, state_normalize, probability_normalize, assign_zero_if_not_matched);
    }), emscripten::allow_raw_pointers());

    emscripten::function("Instrument_QuantumGate_pointer", emscripten::optional_override([](const emscripten::val &v, UINT classical_register_address) {
        std::vector<intptr_t> pointerVec = emscripten::vecFromJSArray<intptr_t>(v);
        std::vector<QuantumGateBase*> gate_list;
        auto vecSize = pointerVec.size();
        for (int i = 0; i < vecSize; i++) {
            intptr_t ptr = pointerVec[i]; // uintptr_t かも
            QuantumGateBase *s = (QuantumGateBase*) ptr;
            gate_list.push_back(s);
        }
        return gate::Instrument(gate_list, classical_register_address);
    }), emscripten::allow_raw_pointers());

    emscripten::function("Adaptive", emscripten::optional_override([](QuantumGateBase* gate, intptr_t funcPtr) {
        // JSのfuncPtr先の関数をC++の型でラップする
        std::function<bool(const std::vector<UINT>&)> func = [funcPtr](const std::vector<UINT>& list) -> bool {
            // Vector/配列はdyncallを通すことができないため、ポインタを渡してJS側で要素を取り出してArrayを復元する
            // vectorをそのままJSに渡すとポインタアドレスからgetValueで要素を取り出せないため、配列ポインタに変換する
            auto size = list.size();
            int arr[size];
            for (int i = 0; i < size; i++) {
                arr[i] = (int)list[i];
            }
            return AdaptiveWrapper(funcPtr, arr, size);
        };

        return gate::Adaptive(gate, func);
    }), emscripten::allow_raw_pointers());
    emscripten::function("ParametricRX", &gate::ParametricRX, emscripten::allow_raw_pointers());
    emscripten::function("ParametricRY", &gate::ParametricRY, emscripten::allow_raw_pointers());
    emscripten::function("ParametricRZ", &gate::ParametricRZ, emscripten::allow_raw_pointers());

    // ポインタ取得用

    // 引数にstd::vector<QuantumGateBase*>を取る関数の場合、
    // (abstractである)QuantumGateBaseをvecFromJSArrayやas<QuantumGateBase>で直接生成することができない。
    // またemscripten::valからvecFromJSArrayを利用した場合、valとQuantumGateBaseは型が異なるためC++に渡されるポインタも一致しない。
    // そのため、QuantumGateBaseを引数に取る関数でQuantumGateBase型で使われるポインタアドレスを取得し、
    // ポインタのリストを本来の関数のoptional_overrideから呼び出すことで実現する
    emscripten::function("_getAbstractQuantumGateBasePointer", emscripten::optional_override([](const QuantumGateBase &v) {
        return (intptr_t)&v;
    }), emscripten::allow_raw_pointers());
    emscripten::function("_getAbstractGeneralQuantumOperatorPointer", emscripten::optional_override([](const GeneralQuantumOperator &v) {
        return (intptr_t)&v;
    }), emscripten::allow_raw_pointers());
};
