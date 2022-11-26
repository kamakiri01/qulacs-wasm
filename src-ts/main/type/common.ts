export interface Complex {
    re: number;
    im: number;
}

/**
 * emscriptenによるvector<T>のJS表現
 * C++の配列のI/FのうちJS側で値の取り出しに必要なものを定義する
 */
export interface WasmVector<T> {
    get: (index: number) => T;
    size: () => number;
}
