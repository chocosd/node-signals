export function map(fn) {
    return (src) => fn(src());
}
