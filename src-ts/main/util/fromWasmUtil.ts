import { Complex, WasmVector } from "../type/common";

export function convertWasmVectorToArray<T>(vector: WasmVector<T>): T[] {
    const data: any[] = [];
    const size = vector.size();
    for (let i = 0; i < size; i+=1) {
        data.push(vector.get(i));
    }
    return data;
}

export function convertSerialComplexArrayToComplexArray(arr: number[]): Complex[] {
    const result: Complex[] = [];
    const length = arr.length;
    for (let i = 0; i < length; i+=2) {
        result.push({
            re: arr[i],
            im: arr[i+1]
        })
    }
    return result;
}

/**
 * 1次元のベクトルをRowMajorの2次元行列を表す2次元配列にして返す。
 * vecの長さがN^2に等しいことを暗黙に仮定する。
 */
export function vecToRowMajorMatrixXcd<T>(vec: T[]): T[][] {
    const len = vec.length;
    const n = Math.sqrt(vec.length) | 0; // 正方行列の行・列の長さは同じため、要素数の平方根nは整数を保証する。JITにintを解釈させるため `| 0` を付与する
    const mat: T[][] = [];
    for (let i = 0; i < len;i += n) {
        mat.push(vec.slice(i, i + n));
    }
    return mat;
}