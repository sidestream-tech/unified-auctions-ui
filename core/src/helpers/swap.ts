import getSigner from '../signer';
import WETH from '../abis/WETH.json';
import UNISWAP from '../abis/UNISWAP_V2_ROUTER_02.json';

import { Notifier } from '../types';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { WAD_NUMBER_OF_DIGITS } from '../constants/UNITS';
import BigNumber from '../bignumber';
import { getGasParametersForTransaction } from '../gas';
import trackTransaction from '../tracker';
import getNetworkDate from '../date';

import { getNetworkConfigByType } from '../network';

const canTransactionBeConfirmed = function (network: string, confirmTransaction?: boolean) {
    const networkConfig = getNetworkConfigByType(network);
    if (networkConfig.isFork) {
        return false;
    }
    return confirmTransaction;
};

export const swapToMKR = async function (
    network: string,
    amountPaidAllowanceETH: string | number,
    amountReceivedMinMKR: string | number,
    notifier?: Notifier
) {
    const signer = await getSigner(network);
    const address = await signer.getAddress();
    const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const UNISWAP_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const MKR_ADDRESS = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
    const contractWeth = await new Contract(WETH_ADDRESS, WETH, signer);
    const contractUniswap = await new Contract(UNISWAP_ADDRESS, UNISWAP, signer);

    // Allow operations with the uniswap to swap from weth
    const gasParameters = await getGasParametersForTransaction(network);
    let transactionPromise = contractWeth['approve'](
        ...[UNISWAP_ADDRESS, new BigNumber(amountPaidAllowanceETH).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0)],
        {
            ...gasParameters,
            type: gasParameters.gasPrice ? undefined : 2,
        }
    );

    await trackTransaction(transactionPromise, notifier, canTransactionBeConfirmed(network));

    //Get some eth
    await trackTransaction(
        contractWeth.deposit({
            value: ethers.utils.parseEther(String(amountPaidAllowanceETH)),
        }),
        notifier,
        canTransactionBeConfirmed(network)
    );

    // get some mkr
    const deadline = await getNetworkDate(network);
    deadline.setHours(deadline.getDate() + 1);
    const transactionParamsSwapMkr = [
        new BigNumber(amountReceivedMinMKR).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        [WETH_ADDRESS, MKR_ADDRESS],
        address,
        new BigNumber(Math.floor(deadline.getTime() / 1000)).toFixed(0),
    ];
    const gasParametersSwapMKR = await getGasParametersForTransaction(network);
    transactionPromise = contractUniswap['swapETHForExactTokens'](...transactionParamsSwapMkr, {
        ...gasParametersSwapMKR,
        type: gasParametersSwapMKR.gasPrice ? undefined : 2,
        value: new BigNumber(amountPaidAllowanceETH).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
    });
    await trackTransaction(transactionPromise, notifier, canTransactionBeConfirmed(network));
};
