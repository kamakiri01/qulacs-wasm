export function range(from: number, to: number): number[] {
    const length = to - from;
    return [...Array(length)].map((_, i) => i + from);
}
