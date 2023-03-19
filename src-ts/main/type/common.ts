/**
 * Qulacsと同じ複素数を表現する構造体
 */
export interface Complex {
    real: number;
    imag: number;
}

/**
 * 複素数の四則演算ラッパー
 */
export var CMath = {
    add: (a: CPPTYPE, b: CPPTYPE): Complex => {
        a = translateNumberOrComplexToCPPCTYPE(a);
        b = translateNumberOrComplexToCPPCTYPE(b);
        return { real: a.real + b.real, imag: a.imag + b.imag };
    },
    mul: (a: CPPTYPE, b: CPPTYPE): Complex => {
        a = translateNumberOrComplexToCPPCTYPE(a);
        b = translateNumberOrComplexToCPPCTYPE(b);
        return {
            real: a.real * b.real - a.imag * b.imag,
            imag: a.real * b.imag + a.imag * b.real
        }
    },
    div: (a: CPPTYPE, b: CPPTYPE): Complex => {
        a = translateNumberOrComplexToCPPCTYPE(a);
        b = translateNumberOrComplexToCPPCTYPE(b);
        const r2 = b.real * b.real + b.imag * b.imag;
        return {
            real: (a.real * b.real + a.imag * b.imag) / r2,
            imag: (-a.real * b.imag + a.imag * b.real) / r2
        }
    }
}

/**
 * emscriptenによるvector<T>のJS表現
 * C++の配列のI/FのうちJS側で値の取り出しに必要なものを定義する
 */
export interface WasmVector<T> {
    get: (index: number) => T;
    size: () => number;
}

type CPPTYPE = number | Complex;

function translateNumberOrComplexToCPPCTYPE(n: number | Complex): Complex {
    if (typeof n === "number") {
        return { real: n, imag: 0 };
    } else {
        return n;
    }
}
