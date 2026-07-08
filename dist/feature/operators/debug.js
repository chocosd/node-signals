export function debug(label = "debug") {
    return (src) => {
        const value = src();
        console.log(label, value);
        return value;
    };
}
