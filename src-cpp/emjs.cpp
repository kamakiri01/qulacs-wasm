#include <emscripten/bind.h>

// NOTE: 戻り型に自作structやstd::stringなどJSプリミティブでない型を渡すと、引数のintの処理が変わってしまう、getValueで正しい値も得られなくなる。型の指定によってオンメモリの扱いが変わる？
// NOTE: 専用のEM_JSを使うべき？ https://emscripten.org/docs/api_reference/emscripten.h.html#c.EM_ASM_INT
// NOTE: Noteの型言及参照 https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#calling-javascript-from-c-c
EM_JS(emscripten::EM_VAL, convertDoubleArrayToJSComplexArray, (double* arr, int vecSize), {
    var result = [];
    const bit = 8;
    for (let i = 0; i < vecSize; i++) {
      var real = getValue(arr + i*2 *bit, "double"); // NOTE もっと効率よく取れるはず。HEAP32
      var imag = getValue(arr + i*2 *bit + bit, "double");
      result.push({
        real,
        imag
      });
    }
    return Emval.toHandle(result); // @see https://web.dev/emscripten-embedding-js-snippets/#emasyncjs-macro
});

EM_JS(emscripten::EM_VAL, convertCPPCTYPEToJSComplex, (double real, double imag), {
    var result = {
        real: real,
        imag: imag
    };
    return Emval.toHandle(result);
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
                real: getValue(arr + p*2 *bit, "double"), // NOTE もっと効率よく取れるはず。HEAP32
                imag: getValue(arr + p*2 *bit + bit, "double")
            });
        }
    }
    return Emval.toHandle(result); // @see https://web.dev/emscripten-embedding-js-snippets/#emasyncjs-macro
});

EM_JS(emscripten::EM_VAL, convertIntArrayToJSArray, (int* arr, int vecSize), {
    var result = [];
    const byte = 4; // ITYPE = (un)signed long long
    for (let i = 0; i < vecSize; i++) {
      result.push(getValue(arr + i *byte, "i32"));
    }
    return Emval.toHandle(result); // @see https://web.dev/emscripten-embedding-js-snippets/#emasyncjs-macro
});

// ---

// @see https://qiita.com/nokotan/items/35bea8b895eb7c9682de#%E5%BF%9C%E7%94%A82-cc%E3%81%8B%E3%82%89%E6%96%87%E5%AD%97%E5%88%97%E3%82%92%E5%8F%97%E3%81%91%E5%8F%96%E3%82%8B
EM_JS(int, ReversibleBooleanWrapper, (intptr_t funcPtr, int n0, int n1), {
    var re = Module['dynCall']('iii', funcPtr, [n0, n1]);
    return re;
});

EM_JS(int, AdaptiveWrapper, (intptr_t funcPtr, int* arr, int size), {
    // @see https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#calling-javascript-functions-as-function-pointers-from-c
    var re = Module['dynCall']('iii', funcPtr, [arr, size]);
    return re;
});

EM_JS(void, QuantumStateMultiplyElementwiseFunctionWrapper, (intptr_t funcPtr, ITYPE num, double* complexArrPtr), {
    // 受け取ったfuncPtrの関数がcomplexArrPtrにstd::Complex<double>の要素をそれぞれ格納することを期待する
    // @see https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#calling-javascript-functions-as-function-pointers-from-c
    Module['dynCall']('vii', funcPtr, [num, complexArrPtr]);
});
