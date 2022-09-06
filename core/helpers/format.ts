import { ethers } from 'ethers';
import BigNumber from '../src/bignumber';

export const formatToHexWithoutPad = (value: BigNumber | number) => {
    const number = typeof value === 'number' ? new BigNumber(value) : value;
    return `0x${number.toString(16)}`;
};

export const formatToHex = (value: BigNumber, digits: number) => {
    return ethers.utils.hexZeroPad(formatToHexWithoutPad(value), digits);
};
