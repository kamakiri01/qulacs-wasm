#include "emjs.cpp"

// JS to C++

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

// C++ to JS

emscripten::EM_VAL transpaleITYPEVecToJSArray(const std::vector<ITYPE> &vec) {
    int size = vec.size();
    int arr[size];
    for (int i = 0; i < size; i++) {
        arr[i] = vec[i];
    }
    return convertIntArrayToJSArray(arr, size);
}

emscripten::EM_VAL translateCPPArrToJSComplexArray(CPPCTYPE *cppArr, int &size) {
    double arr[size*2];
    for (int i = 0; i < size; i++) {
        CPPCTYPE c = cppArr[i];
        arr[i*2] = c.real();
        arr[i*2+1] = c.imag();
    }
    return convertDoubleArrayToJSComplexArray(arr, size);
}

emscripten::EM_VAL translateCPPVecToJSComplexArray(std::vector<std::complex<double>> &cppVec) {
    int size = cppVec.size();
    double arr[size*2];
    for (int i = 0; i < size; i++) {
        arr[i*2] = cppVec[i].real();
        arr[i*2+1] = cppVec[i].imag();
    }
    return convertDoubleArrayToJSComplexArray(arr, size);
}

emscripten::EM_VAL translateCPPToJSComplex(CPPCTYPE &cpp) {
    return convertCPPCTYPEToJSComplex(cpp.real(), cpp.imag());
}

emscripten::EM_VAL translateCTYPEArrMatrixToJSComplexMatrix(CTYPE* ptr, int &size, int dim) {
    double arr[size*2];
    for (ITYPE y = 0; y < dim; ++y) {
        for (ITYPE x = 0; x < dim; ++x) {
            auto c = ptr[y * dim + x];
            arr[(x+(y*dim))*2] = c.real();
            arr[(x+(y*dim))*2+1] = c.imag();
        }
    }
    return convertMatrix(arr, size);
}

emscripten::EM_VAL translateComplexMatrixToJSComplexMatrix(ComplexMatrix &mat) {
    int arrSize = mat.rows() * mat.cols();
    double arr[arrSize*2];
    for (ITYPE y = 0; y < mat.cols(); ++y) {
        for (ITYPE x = 0; x < mat.rows(); ++x) {
            auto c = mat(x, y);
            arr[(x+(y*mat.cols()))*2] = c.real();
            arr[(x+(y*mat.cols()))*2+1] = c.imag();
        }
    }
    return convertMatrix(arr, arrSize);
}
