


export function toMiliseconds(ms, s, m): number {
    let total = ms;
    total += (s * 1000)
    total += (m * 60 * 1000)
    return total
}