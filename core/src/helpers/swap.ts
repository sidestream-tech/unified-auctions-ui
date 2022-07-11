import getSigner from '../signer';
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
import getContract from '../contracts';
import executeTransaction from '../execute';

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
    const contractWeth = await getContract(network, 'ETH', true);
    const WETH_ADDRESS = contractWeth.address;
    const UNISWAP_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const MKR_ADDRESS = (await getContract(network, 'MCD_GOV')).address;
    const contractUniswap = await new Contract(UNISWAP_ADDRESS, UNISWAP, signer);

    // Allow operations with the uniswap to swap from weth
    await executeTransaction(network, 'ETH', 'approve', [UNISWAP_ADDRESS, new BigNumber(amountPaidAllowanceETH).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0)])

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
    const transactionPromise = contractUniswap['swapETHForExactTokens'](...transactionParamsSwapMkr, {
        ...gasParametersSwapMKR,
        type: gasParametersSwapMKR.gasPrice ? undefined : 2,
        value: new BigNumber(amountPaidAllowanceETH).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
    });
    await trackTransaction(transactionPromise, notifier, canTransactionBeConfirmed(network));
};
