export const numberToBytes32 = function (number: number): string {
    return `0x${number.toString().padStart(64, '0')}`;
};
