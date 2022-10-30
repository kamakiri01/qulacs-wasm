// float 0~2 Math.PIに対する係数。qulacs関数は円周率の実数を受け取るので、wasm内で3.14を掛ける。RXをpauliXにするなら1を渡す。bloch球上の回転角。
export type ToWasmGateParameter = number;

// int[]
export type ToWasmGateControllIndex = number[];
