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
        auto raw = vec[i]; // complex or number
        if (raw.hasOwnProperty("real") && raw.hasOwnProperty("imag")) {
            std::complex<double> c(raw["real"].as<double>(), raw["imag"].as<double>());
            cppVec.push_back(c);
        } else {
            std::complex<double> c(raw.as<double>(), 0);
            cppVec.push_back(c);
        }
    }
    return cppVec;
}

ComplexMatrix translateJSMatrixtoComplexMatrix(const emscripten::val &val, UINT dim) {
    auto vec = emscripten::vecFromJSArray<emscripten::val>(val);
    ComplexMatrix mat(dim, dim);
    auto vecSize = vec.size(); // maybe same dim
    for (int i = 0; i < vecSize; i++) {
        auto v = translateJSArraytoCPPVec(vec[i]);
        auto vSize = v.size(); // maybe same dim
        for (int j = 0; j < vSize; j++) {
            mat(i, j) = v[j];
        }
    }
    return mat;
}
