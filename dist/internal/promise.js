export function isThenable(value) {
    return (typeof value === "object" &&
        value !== null &&
        "then" in value &&
        typeof value.then === "function");
}
