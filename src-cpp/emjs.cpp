#include <emscripten/bind.h>

// NOTE: 戻り型に自作structやstd::stringなどJSプリミティブでない型を渡すと、引数のintの処理が変わってしまう、getValueで正しい値も得られなくなる。型の指定によってオンメモリの扱いが変わる？
// NOTE: 専用のEM_JSを使うべき？ https://emscripten.org/docs/api_reference/emscripten.h.html#c.EM_ASM_INT
// NOTE: Noteの型言及参照 https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#calling-javascript-from-c-c

EM_JS(emscripten::EM_VAL, convertArray, (double* arr, int vecSize), {
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

