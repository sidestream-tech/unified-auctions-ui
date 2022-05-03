export const sum = (a: number, b: number) => {
    if ('development' === process.env.NODE_ENV) {
        console.info('boop');
    }
    return a + b;
};

console.info(sum(1, 2));
