import { ethers } from 'ethers';

const createStructCoder = function (wordSize = 16) {
    const coder = new ethers.utils.AbiCoder();
    coder._getWordSize = () => wordSize;
    return coder;
};

export default createStructCoder;
