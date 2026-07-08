export function throttleTime(ms) {
    let lastEmit = 0;
    return (src) => {
        const value = src();
        const now = Date.now();
        const elapsed = now - lastEmit;
        if (elapsed >= ms || lastEmit === 0) {
            lastEmit = now;
            return value;
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                lastEmit = Date.now();
                resolve(src());
            }, ms - elapsed);
        });
    };
}
