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

#include "vector.cpp"
#include "emjs.cpp"
//#include "complex.cpp"
#include "util.cpp"
#include <inttypes.h>

extern "C" {
    // @see https://emscripten.org/docs/porting/Debugging.html#handling-c-exceptions-from-javascript
    std::string getExceptionMessage(intptr_t exceptionPtr) { return std::string(reinterpret_cast<std::exception *>(exceptionPtr)->what()); }
    typedef void(*ReversibleBooleanFunc)(void);

    static emscripten::val lastVal = emscripten::val::undefined();
    void each_wrapper(const emscripten::val& v) {
        lastVal = v;
        lastVal();
        lastVal = emscripten::val::undefined();
    }

    extern int invoke_function_pointer(int(*f)(int), int a) {
        int r = (*f)(a);
        return r;
    }
}

// @see https://qiita.com/nokotan/items/35bea8b895eb7c9682de
EM_JS(int, ReversibleBooleanWrapper, (intptr_t funcPtr, int n0, int n1), {
    //console.log("EM_JS ReversibleBooleanWrapper funcPtr", funcPtr);
    var re = Module['dynCall']('iii', funcPtr, [n0, n1]);
    //console.log("EM_JS re:", re);
    return re;
    //return Emval.toHandle(result); // @see https://web.dev/emscripten-embedding-js-snippets/#emasyncjs-macro
});

EM_JS(int, AbstractVectorWrapper, (intptr_t funcPtr, int index), {
    console.log("EM_JS AbstractVectorWrapper", funcPtr, index);
    return v;
    //return Emval.toHandle(result); // @see https://web.dev/emscripten-embedding-js-snippets/#emasyncjs-macro
});


EMSCRIPTEN_BINDINGS(Bindings) {
    emscripten::function("getExceptionMessage", &getExceptionMessage);

    //register_complex<double>("complex128");
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
        // .function("multiply_elementwise_function", &QuantumState::multiply_elementwise_function, emscripten::allow_raw_pointers())
        .function("get_classical_value", &QuantumState::get_classical_value, emscripten::allow_raw_pointers())
        .function("set_classical_value", &QuantumState::set_classical_value, emscripten::allow_raw_pointers())
        .function("to_string", &QuantumState::to_string, emscripten::allow_raw_pointers())
        // NOTE: ITYPEをJSArrayにそのまま渡せないためoptional_overrideを使う
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
    emscripten::function("sqrtX", &gate::sqrtY, emscripten::allow_raw_pointers());
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
    // emscripten::function("ReversibleBoolean", &gate::ReversibleBoolean, emscripten::allow_raw_pointers());

    emscripten::function("ReversibleBoolean", emscripten::optional_override([](const emscripten::val &target_qubit_index_list, intptr_t funcPtr) { // , int n0, int n1
        std::vector<UINT> target_list = emscripten::vecFromJSArray<UINT>(target_qubit_index_list); // NOTE: arrayではないUINTを受けられるようにする
        //printf("ReversibleBoolean starting: %d\n", (int)funcPtr);
        //func();
        /*
        int wrapperResult = ReversibleBooleanWrapper(funcPtr, n0, n1);

        printf("ReversibleBoolean done %d\n", wrapperResult);
        */
        auto func = [funcPtr](int val, int dim) -> int {
            return ReversibleBooleanWrapper(funcPtr, val, dim);
        };

        return gate::ReversibleBoolean(target_list, func);

        //printf("re is %d\n", (int)re);
    }), emscripten::allow_raw_pointers());

    /*
    emscripten::function("testPointer", emscripten::optional_override([](void(*f)(void)) {
        printf("testPointer starting\n");
        (*f)();
        printf("testPointer is done\n");
        //printf("re is %d\n", (int)re);

    }), emscripten::allow_raw_pointers());
    */

    emscripten::function("StateReflection", &gate::StateReflection, emscripten::allow_raw_pointers());
    emscripten::function("BitFlipNoise", &gate::BitFlipNoise, emscripten::allow_raw_pointers());
    emscripten::function("DephasingNoise", &gate::DephasingNoise, emscripten::allow_raw_pointers());
    emscripten::function("IndependentXZNoise", &gate::IndependentXZNoise, emscripten::allow_raw_pointers());
    emscripten::function("DepolarizingNoise", &gate::DepolarizingNoise, emscripten::allow_raw_pointers());
    emscripten::function("TwoQubitDepolarizingNoise", &gate::TwoQubitDepolarizingNoise, emscripten::allow_raw_pointers());
    emscripten::function("AmplitudeDampingNoise", &gate::AmplitudeDampingNoise, emscripten::allow_raw_pointers());
    emscripten::function("Measurement", &gate::Measurement, emscripten::allow_raw_pointers());

    emscripten::class_<QuantumCircuit>("QuantumCircuit")
        .constructor<int>()
        .function("copy", &QuantumCircuit::copy, emscripten::allow_raw_pointers())
        //.function("add_gate_consume", emscripten::select_overload<void(QuantumGateBase*)>(&QuantumCircuit::add_gate), emscripten::allow_raw_pointers())
        //.function("add_gate_consume", emscripten::select_overload<void(QuantumGateBase*, UINT)>(&QuantumCircuit::add_gate), emscripten::allow_raw_pointers())
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

    emscripten::class_<ParametricQuantumCircuit, emscripten::base<QuantumCircuit>>("ParametricQuantumCircuit")
        .constructor<int>()
        .function("copy", &ParametricQuantumCircuit::copy, emscripten::allow_raw_pointers())
        .function("add_parametric_gate", emscripten::select_overload<void(QuantumGate_SingleParameter*)>(&ParametricQuantumCircuit::add_parametric_gate_copy), emscripten::allow_raw_pointers())
        .function("add_parametric_gate", emscripten::select_overload<void(QuantumGate_SingleParameter*, UINT)>(&ParametricQuantumCircuit::add_parametric_gate_copy), emscripten::allow_raw_pointers())
        .function("add_parametric_RX_gate", &ParametricQuantumCircuit::add_parametric_RX_gate)
        .function("add_parametric_RY_gate", &ParametricQuantumCircuit::add_parametric_RY_gate)
        .function("add_parametric_RZ_gate", &ParametricQuantumCircuit::add_parametric_RZ_gate)
        .function("add_parametric_multi_Pauli_rotation_gate", &ParametricQuantumCircuit::add_parametric_multi_Pauli_rotation_gate)
        .function("add_gate", emscripten::select_overload<void(const QuantumGateBase*)>(&ParametricQuantumCircuit::add_gate_copy), emscripten::allow_raw_pointers())
        .function("add_gate", emscripten::select_overload<void(const QuantumGateBase*, UINT)>(&ParametricQuantumCircuit::add_gate_copy), emscripten::allow_raw_pointers())
        .function("get_parameter_count", &ParametricQuantumCircuit::get_parameter_count, emscripten::allow_raw_pointers())
        .function("get_parameter", &ParametricQuantumCircuit::get_parameter, emscripten::allow_raw_pointers())
        .function("set_parameter", &ParametricQuantumCircuit::set_parameter, emscripten::allow_raw_pointers())
        .function("get_parametric_gate_position", &ParametricQuantumCircuit::get_parametric_gate_position, emscripten::allow_raw_pointers())
        .function("remove_gate", &ParametricQuantumCircuit::remove_gate, emscripten::allow_raw_pointers());

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
        return emscripten::val::take_ownership(convertCPPCTYPEToJSComplex(c.real(), c.imag()));
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

    /*
    emscripten::function("testAbstArg", emscripten::optional_override([](const emscripten::val &v) {
        //printf("testAbstArg name is %s\n", gate1->get_name().c_str());
        std::vector<emscripten::val> vv = emscripten::vecFromJSArray<emscripten::val>(v);
        //auto hoge = std::cref(vv[0]).as<QuantumGateBase>().get_name();
        //printf("AbstractVectorWrapper test is %d\n ", AbstractVectorWrapper(vv[0]));

        auto vecSize = vv.size();
        std::vector<QuantumGateBase*> list;
        for (int i = 0; i < vecSize; i++) {
            printf("testAbstArg. ptr %" PRIdPTR "\n", &vv[i]);
            //list.push_back((QuantumGateBase*) AbstractVectorWrapper(vv[i]));
        }

    }), emscripten::allow_raw_pointers());

    emscripten::function("testAbstArg2", emscripten::optional_override([](const QuantumGateBase &v) {
        printf("testAbstArg2. ptr %" PRIdPTR "\n", &v);
        return (intptr_t)&v;
    }), emscripten::allow_raw_pointers());
    emscripten::function("testAbstArg3", emscripten::optional_override([](const int v) {
        printf("testAbstArg3. ptr %d\n", v);
        QuantumGateBase *s = (QuantumGateBase*) v;
        printf("testAbstArg3 name is %s\n", s->get_name().c_str());


        std::vector<QuantumGateBase*> list;
        list.push_back(s);
        list.push_back(s);
        return gate::add(list);
    }), emscripten::allow_raw_pointers());
    */

    // 引数にstd::vector<QuantumGateBase*>を取る関数の場合、
    // abstractであるQuantumGateBaseをvecFromJSArrayやas<QuantumGateBase>で直接生成することができない。
    // またemscripten::valからvecFromJSArrayを利用した場合、valとQuantumGateBaseは型が異なるためC++に渡されるポインタも一致しない。
    // そのため、QuantumGateBaseを引数に取る関数でQuantumGateBase型で使われるポインタアドレスを取得し、
    // ポインタのリストを本来の関数のoptional_overrideから呼び出すことで実現する
    emscripten::function("_getAbstractQuantumGateBasePointer", emscripten::optional_override([](const QuantumGateBase &v) {
        return (intptr_t)&v;
    }), emscripten::allow_raw_pointers());

};
