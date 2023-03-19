import { Complex } from "../../lib/bundle";

export function round4(n: number): number {
    return Math.abs(Math.round(n * 1000) / 1000);
}

export function round4ComplexMatrix(matrix: Complex[][]): Complex[][] {
    return matrix.map(vec => {
        return vec.map(c => {
            return {
                real: round4(c.real),
                imag: round4(c.imag)
            }
        });
    })
}