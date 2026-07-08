export function debounceTime(ms) {
    return (src) => new Promise((resolve) => {
        setTimeout(() => resolve(src()), ms);
    });
}
