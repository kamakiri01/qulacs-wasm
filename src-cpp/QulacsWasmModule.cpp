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
#include <inttypes.h>
#include <vqcsim/parametric_circuit.hpp>
#include <vqcsim/parametric_gate.hpp>
#include <vqcsim/parametric_gate_factory.hpp>

extern "C" {
    // @see https://emscripten.org/docs/porting/Debugging.html#handling-c-exceptions-from-javascript
    std::string getExceptionMessage(intptr_t exceptionPtr) { return std::string(reinterpret_cast<std::exception *>(exceptionPtr)->what()); }
}

template<typename Complex> struct ComplexAccess {
  static emscripten::val getReal(const Complex &v) { return emscripten::val(v.real()); }
  static emscripten::val getImag(const Complex &v) { return emscripten::val(v.imag()); }

  static bool setReal(Complex &v, const typename Complex::value_type &value) {
    v.real(value);
    return true;
  }

  static bool setImag(Complex &v, const typename Complex::value_type &value) {
    v.imag(value);
    return true;
  }
};

template<typename T> emscripten::class_<std::complex<T>> register_complex(const char *name) {
  typedef std::complex<T> C;

  return emscripten::class_<std::complex<T>>(name)
    .template constructor<>()
    .property("real", &ComplexAccess<C>::getReal, &ComplexAccess<C>::setReal)
    .property("imag", &ComplexAccess<C>::getImag, &ComplexAccess<C>::setImag);
}

// 戻り型に自作structやstd::stringなどJSプリミティブでない型を渡すと、引数のintの処理が変わってしまう、getValueで正しい値も得られなくなる。型の指定によってオンメモリの扱いが変わる？
EM_JS(emscripten::EM_VAL, convertArray, (double* arr, int vecSize), {
    var result = [];
    const bit = 8;
    for (let i = 0; i < vecSize; i++) {
      var real = getValue(arr + i*2 *bit, "double"); // NOTE もっと効率よく取れるはず。HEAP32
      var imag = getValue(arr + i*2 *bit + bit, "double");
      result.push({
        re: real,
        im: imag
      });
    }
    return Emval.toHandle(result); // @see https://web.dev/emscripten-embedding-js-snippets/#emasyncjs-macro
});

EM_JS(emscripten::EM_VAL, convertMatrix, (double* arr, int vecSize), {
    var size = Math.sqrt(vecSize);
    var result = [];
    const bit = 8;
    for (let y = 0; y < size; y++) {
        result[y] = [];
        for (let x = 0; x < size; x++) {
            var p = y*size+x;
            result[y].push({
                re: getValue(arr + p*2 *bit, "double"), // NOTE もっと効率よく取れるはず。HEAP32
                im: getValue(arr + p*2 *bit + bit, "double")
            });
        }
    }
    return Emval.toHandle(result); // @see https://web.dev/emscripten-embedding-js-snippets/#emasyncjs-macro
});

EM_JS(emscripten::EM_VAL, convertVecToJSArray, (int* arr, int vecSize), {
    var result = [];
    const byte = 4; // ITYPE = (un)signed long long
    for (let i = 0; i < vecSize; i++) {
      result.push(getValue(arr + i *byte, "i32"));
    }
    return Emval.toHandle(result); // @see https://web.dev/emscripten-embedding-js-snippets/#emasyncjs-macro
});



using namespace gate;
using namespace state;
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
        /*
        // bad pattern. state.data_cpp()[0].real() overwrite 0 with unknown reason...
        .function("update_quantum_state", emscripten::optional_override([](QuantumCircuit& self, QuantumState state) {
            self.update_quantum_state(&state);
        }))
        */
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
            int size = samples.size();
            int arr[size];
            for (int i = 0; i < size; i++) {
                arr[i] = (int) samples[i]; // NOTE: long long intをintに丸めている。JSで (un)signed long long intを取得する方法を検討
            }
            return emscripten::val::take_ownership(convertVecToJSArray(arr, size));
        }), emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](QuantumState& self, UINT sampling_count) {
            std::vector<ITYPE> samples = self.sampling(sampling_count);
            int size = samples.size();
            int arr[size];
            for (int i = 0; i < size; i++) {
                arr[i] = (int) samples[i]; // NOTE: long long intをintに丸めている。JSで (un)signed long long intを取得する方法を検討
            }
            return emscripten::val::take_ownership(convertVecToJSArray(arr, size));
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
            int size = samples.size();
            int arr[size];
            for (int i = 0; i < size; i++) {
                arr[i] = (int) samples[i]; // NOTE: long long intをintに丸めている。JSで (un)signed long long intを取得する方法を検討
            }
            return emscripten::val::take_ownership(convertVecToJSArray(arr, size));
        }), emscripten::allow_raw_pointers())
        .function("sampling", emscripten::optional_override([](DensityMatrix& self, UINT sampling_count) {
            std::vector<ITYPE> samples = self.sampling(sampling_count);
            int size = samples.size();
            int arr[size];
            for (int i = 0; i < size; i++) {
                arr[i] = (int) samples[i]; // NOTE: long long intをintに丸めている。JSで (un)signed long long intを取得する方法を検討
            }
            return emscripten::val::take_ownership(convertVecToJSArray(arr, size));
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

    // emscripten::function("__ScriptEngine_returnFromJS", bridgeReturnFromJS); // https://github.com/emscripten-core/emscripten/issues/11497

    emscripten::function("partial_trace", emscripten::optional_override([](const QuantumState* state, const emscripten::val &trace) {
                std::vector<UINT> traceVec = emscripten::vecFromJSArray<UINT>(trace);
                return partial_trace(state, traceVec);
            }), emscripten::allow_raw_pointers());
    emscripten::function("partial_trace", emscripten::optional_override([](const DensityMatrix* state, const emscripten::val &target_traceout) {
                std::vector<UINT> traceVec = emscripten::vecFromJSArray<UINT>(target_traceout);
                return partial_trace(state, traceVec);
            }), emscripten::allow_raw_pointers());
};
