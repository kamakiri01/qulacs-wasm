export function round4(n: number): number {
    return Math.abs(Math.round(n * 1000) / 1000);
}
