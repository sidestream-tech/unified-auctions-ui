import { ethers } from 'ethers';
import BigNumber from '../src/bignumber';

export const formatToHex = (value: BigNumber, digits: number) => {
    return ethers.utils.hexZeroPad('0x' + value.toString(16), digits);
};
