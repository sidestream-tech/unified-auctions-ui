import { ethers } from 'ethers';
import getSigner from '../signer';
import { Notifier } from '../types';
import { ETH_NUMBER_OF_DIGITS } from '../constants/UNITS';
import BigNumber from '../bignumber';
import getNetworkDate from '../date';
import getContract from '../contracts';
import executeTransaction from '../execute';

export const swapToMKR = async function (
    network: string,
    amountPaidAllowanceETH: string | number,
    amountReceivedMinMKR: string | number,
    notifier?: Notifier
) {
    const signer = await getSigner(network);
    const walletAddress = await signer.getAddress();
    const contractWeth = await getContract(network, 'ETH', true);
    const WETH_ADDRESS = contractWeth.address;
    const UNISWAP_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const MKR_ADDRESS = (await getContract(network, 'MCD_GOV')).address;

    // Allow operations with the uniswap to swap from weth
    await executeTransaction(
        network,
        'ETH',
        'approve',
        [UNISWAP_ADDRESS, new BigNumber(amountPaidAllowanceETH).shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(0)],
        {
            notifier,
        }
    );

    // Get some eth
    await executeTransaction(network, 'ETH', 'deposit', [], {
        methodOverrides: { value: ethers.utils.parseEther(String(amountPaidAllowanceETH)) },
        notifier,
    });

    // Get some mkr
    const deadline = await getNetworkDate(network);
    deadline.setMonth(deadline.getMonth() + 1);

    const transactionParamsSwapMkr = [
        new BigNumber(amountReceivedMinMKR).shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(0),
        [WETH_ADDRESS, MKR_ADDRESS],
        walletAddress,
        new BigNumber(Math.floor(deadline.getTime() / 1000)).toFixed(0),
    ];
    await executeTransaction(network, 'UNISWAP', 'swapETHForExactTokens', transactionParamsSwapMkr, {
        notifier,
        methodOverrides: { value: new BigNumber(amountPaidAllowanceETH).shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(0) },
    });
};
