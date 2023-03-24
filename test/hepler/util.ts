import { Complex } from "../../lib/bundle";

export function round4(n: number): number {
    return Math.abs(Math.round(n * 1000) / 1000);
}

export function round4Complex(complex: Complex): Complex {
    return {
        real: round4(complex.real),
        imag: round4(complex.imag)
    }
}

export function round4ComplexVector(vector: Complex[]): Complex[] {
    return vector.map(c => round4Complex(c));
}

export function round4ComplexMatrix(matrix: Complex[][]): Complex[][] {
    return matrix.map(vec => round4ComplexVector(vec));
}
