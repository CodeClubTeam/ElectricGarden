export const calculateFilterFactor = (range: {
    first: number;
    last: number;
}) => {
    const maxPoints = 100;

    const filteredLength = range.last - range.first;

    // limit k to powers of 2, e.g. 64, 128, 256
    // so that the same points will be chosen reliably, reducing flicker
    let k = Math.pow(2, Math.ceil(Math.log2(filteredLength / maxPoints)));
    k = isNaN(k) ? 1 : k;
    return Math.max(1, k);
};
