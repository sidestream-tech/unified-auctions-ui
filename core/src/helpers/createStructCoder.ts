import { ethers } from 'ethers';

const createStructCoder = function (length = 16) {
    const coder = new ethers.utils.AbiCoder();
    coder._getWordSize = () => length;
    return coder;
};

export default createStructCoder;
