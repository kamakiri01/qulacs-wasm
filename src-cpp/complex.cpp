#include <inttypes.h>
#include <emscripten/bind.h>

/**
 * @see reference from https://github.com/ryukau/UhhyouWebSynthesizers/blob/6e4e3dfe1f4afd2205a9371330d2f6191ff6ab74/lib/pocketfft/build/pocketfftbind.cpp
*/
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
};
