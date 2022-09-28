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

export const randomBigNumber = (min: BigNumber, max: BigNumber) => {
    const generatedBytes = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    const offset = new BigNumber(generatedBytes).mod(max.minus(min));
    return offset.plus(min);
};
