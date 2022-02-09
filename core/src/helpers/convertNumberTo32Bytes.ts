import { ethers } from 'ethers';

const convertNumberTo32Bytes = function (number: number): string {
    const hexString = ethers.utils.hexlify(number);
    const paddedHexString = ethers.utils.hexlify(ethers.utils.zeroPad(hexString, 32));
    return paddedHexString;
};

export default convertNumberTo32Bytes;
