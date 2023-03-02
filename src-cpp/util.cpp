int* transpaleITYPEVecToIntArray(const std::vector<ITYPE> vec) {
    int size = vec.size();
    int arr[size];
    for (int i = 0; i < size; i++) {
        arr[i] = (int) vec[i]; // NOTE: long long intをintに丸めている。JSで (un)signed long long intを取得する方法を検討
    }
    return arr;
}

std::vector<CPPCTYPE> translateJSArraytoCPPVec(const emscripten::val &v) {
    auto vec = emscripten::vecFromJSArray<emscripten::val>(v);

    std::vector<CPPCTYPE> cppVec;
    auto vecSize = vec.size();
    for (int i = 0; i < vecSize; i++) {
        auto raw = vec[i]; // number or complex
        try {
            std::complex<double> c(raw["real"].as<double>(), raw["imag"].as<double>());
            cppVec.push_back(c);
        } catch (...) {
            std::complex<double> c(raw.as<double>(), 0);
            cppVec.push_back(c);
        }
    }
    return cppVec;
}

template <typename Of, typename What>
inline bool instanceof(const What w)
{
  return dynamic_cast<const Of*>(w) != 0;
} 