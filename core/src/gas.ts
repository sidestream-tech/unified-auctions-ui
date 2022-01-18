import { ethers } from 'ethers';
import BigNumber from './bignumber';

const API_URL = 'https://ethgasstation.info/json/ethgasAPI.json';
const TRANSACTION_SPEED = 'fast';

export const getCurrentGasPrice = async function () {
    const gasData = await fetch(API_URL).then(r => r.json());
    const gasPriceString = ethers.utils.formatUnits(gasData[TRANSACTION_SPEED] / 10, 'gwei');
    return new BigNumber(gasPriceString);
};
