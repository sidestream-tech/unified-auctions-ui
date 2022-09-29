import { ethers } from 'ethers';

export const pad32 = (val: string) => {
    return ethers.utils.hexZeroPad(val, 32);
};

export const concat = (prefix: string, postfix: string) => {
    return ethers.utils.concat([prefix, postfix]);
};

export const stripZeros = (val: string) => {
    return ethers.utils.hexStripZeros(val);
};
