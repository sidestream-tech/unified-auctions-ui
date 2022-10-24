import { ethers } from 'ethers';
import BigNumber from '../src/bignumber';

export const pad32 = (val: string) => {
    return ethers.utils.hexZeroPad(val, 32);
};

export const concat = (prefix: string, postfix: string) => {
    return ethers.utils.concat([prefix, postfix]);
};

export const stripZeros = (val: string) => {
    return ethers.utils.hexStripZeros(val);
};

export const roundUpToFirstSignificantDecimal = (number: BigNumber) => {
    const power = Math.abs(number.e || 0);
    return new BigNumber(number.toFixed(power + 1, BigNumber.ROUND_UP));
};

export const roundDownToFirstSignificantDecimal = (number: BigNumber) => {
    const power = Math.abs(number.e || 0);
    return new BigNumber(number.toFixed(power + 1, BigNumber.ROUND_DOWN));
};

export const getMethodSignature = (methodString: string) => {
    return ethers.utils.id(methodString).substring(0, 10);
};

export const postpendZeros = (val: string, numberOf32ByteSegments: number) => {
    const dataLength = numberOf32ByteSegments * 32 + 2;
    if (val.length > dataLength) {
        throw new Error(`String has more than ${dataLength} decimals: ${val}`);
    }
    return `${val}${new Array(dataLength - val.length).join('0')}`;
};

export const argsToData = (...args: [string, number][]) => {
    const bytes = args.map(([arg, segments]) => postpendZeros(arg, segments).substring(2)).join('');
    return `0x${bytes}`;
};
