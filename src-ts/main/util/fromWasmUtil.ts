import { Complex, WasmVector } from "../type/common";

export function convertWasmVectorToArray<T>(vector: WasmVector<T>): T[] {
    const data: any[] = [];
    const size = vector.size();
    for (let i = 0; i < size; i+=1) {
        data.push(vector.get(i));
    }
    return data;
}

export function convertAlternateArrayToComplexArray(arr: number[]): Complex[] {
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
