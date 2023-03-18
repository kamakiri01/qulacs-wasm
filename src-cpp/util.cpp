int* transpaleITYPEVecToIntArray(const std::vector<ITYPE> vec) {
    int size = vec.size();
    int arr[size];
    for (int i = 0; i < size; i++) {
        arr[i] = (int) vec[i]; // NOTE: long long intをintに丸めている。JSで (un)signed long long intを取得する方法を検討
    }
    return arr;
}

CPPCTYPE translateJSNumberOrComplexToCPPCTYPE(const emscripten::val &v) {
    std::complex<double> c;
    if (v.hasOwnProperty("real") && v.hasOwnProperty("imag")) {
        std::complex<double> c(v["real"].as<double>(), v["imag"].as<double>());
        return c;
    } else {
        std::complex<double> c(v.as<double>(), 0);
        return c;
    }
}

std::vector<CPPCTYPE> translateJSArraytoCPPVec(const emscripten::val &v) {
    auto vec = emscripten::vecFromJSArray<emscripten::val>(v);
    std::vector<CPPCTYPE> cppVec;
    auto vecSize = vec.size();
    for (int i = 0; i < vecSize; i++) {
        auto raw = vec[i]; // complex or number
        cppVec.push_back(translateJSNumberOrComplexToCPPCTYPE(raw));
    }
    return cppVec;
}

ComplexMatrix translateJSMatrixtoComplexMatrix(const emscripten::val &val) {
    auto vec = emscripten::vecFromJSArray<emscripten::val>(val);
    auto vecSize = vec.size(); // maybe same dim
    ComplexMatrix mat(vecSize, vecSize);
    for (int i = 0; i < vecSize; i++) {
        auto v = translateJSArraytoCPPVec(vec[i]);
        auto vSize = v.size(); // maybe same dim
        for (int j = 0; j < vSize; j++) {
            mat(i, j) = v[j];
        }
    }
    return mat;
}

// translateJSMatrixtoComplexMatrix の疎行列版。行列型以外の仕様は変わらない
SparseComplexMatrix translateJSMatrixtoSparseComplexMatrix(const emscripten::val &val) {
    auto vec = emscripten::vecFromJSArray<emscripten::val>(val);
    auto vecSize = vec.size(); // maybe same dim
    SparseComplexMatrix mat(vecSize, vecSize);


    std::vector<Eigen::Triplet<CPPCTYPE>> tripletVec;
    for (int i = 0; i < vecSize; i++) {
        auto v = translateJSArraytoCPPVec(vec[i]);
        auto vSize = v.size(); // maybe same dim
        for (int j = 0; j < vSize; j++) {
            //mat(i, j) = v[j];
            tripletVec.push_back( Eigen::Triplet<CPPCTYPE>(i, j, v[j]) );
        }
    }
    mat.setFromTriplets(tripletVec.begin(), tripletVec.end());
    return mat;
}
