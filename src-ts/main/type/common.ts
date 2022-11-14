export interface Complex {
    re: number;
    im: number;
}

// C++の配列と同じI/F
/**
 * emscriptenによるvector<double>
 */
export interface WasmVector {
    get: (index: number) => number;
    size: () => number;
}
