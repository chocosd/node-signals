export function distinctUntilChanged(equals = Object.is) {
    let previous;
    let hasPrevious = false;
    return (src) => {
        const value = src();
        if (hasPrevious && equals(previous, value)) {
            return previous;
        }
        previous = value;
        hasPrevious = true;
        return value;
    };
}
