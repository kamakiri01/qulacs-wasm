import { Complex } from "../type/common";

export function convertComplexArrayToSerialComplexArray(arr: Complex[]): number[] {
    const result: number[] = [];
    const length = arr.length;
    for (let i = 0; i < length; i++) {
        result.push(arr[i].re);
        result.push(arr[i].im);
    }
    return result;
}
