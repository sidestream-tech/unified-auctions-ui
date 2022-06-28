import type { Notifier, SurplusAuction, SurplusAuctionBase } from './types';
import { getEarliestDate } from './helpers/getEarliestDate';
import BigNumber from './bignumber';
import getContract from './contracts';
import { Contract, ethers } from 'ethers';
import getNetworkDate from './date';
import { RAD, WAD, WAD_NUMBER_OF_DIGITS } from './constants/UNITS';
import executeTransaction from './execute';
import getProvider from './provider';
import UNI_SWAP from './abis/UNI_SWAP.json';
import ETH from './abis/ETH.json';
import { getGasParametersForTransaction } from './gas';
import trackTransaction from './tracker';
import { getNetworkConfigByType } from './constants/NETWORKS';
import getSigner from './signer';

const getSurplusAuctionLastIndex = async (contract: Contract): Promise<number> => {
    const auctionsQuantityBinary = await contract.kicks();
    return new BigNumber(auctionsQuantityBinary._hex).toNumber();
};

const getAuctionState = async (network: string, earliestEndDate: Date, greatestBid: number) => {
    const isBidExpired = (await getNetworkDate(network)) > earliestEndDate;
    const haveBids = greatestBid !== 0;
    if (haveBids) {
        if (isBidExpired) {
            return 'ready-for-collection';
        }
        return 'have-bids';
    }
    if (isBidExpired) {
        return 'requires-restart';
    }
    return 'just-started';
};

export const fetchSurplusAuctionByIndex = async function (
    network: string,
    auctionIndex: number
): Promise<SurplusAuction> {
    const contract = await getContract(network, 'MCD_FLAP');
    const auctionData = await contract.bids(auctionIndex);
    const isAuctionCollected = new BigNumber(auctionData.end).eq(0);
    const baseAuctionInfo: SurplusAuctionBase = {
        network,
        id: auctionIndex,
    };

    if (isAuctionCollected) {
        const auctionLastIndex = await getSurplusAuctionLastIndex(contract);
        if (auctionLastIndex < auctionIndex) {
            throw new Error('No active auction exists with this id');
        }
        return { ...baseAuctionInfo, state: 'collected' };
    }

    const auctionEndDate = new Date(auctionData.end * 1000);
    const bidEndDate = auctionData.tic ? new Date(auctionData.tic * 1000) : undefined;
    const earliestEndDate = bidEndDate ? getEarliestDate(auctionEndDate, bidEndDate) : auctionEndDate;
    const state = await getAuctionState(network, earliestEndDate, auctionData.tic);
    return {
        ...baseAuctionInfo,
        earliestEndDate,
        bidAmountMKR: new BigNumber(auctionData.bid._hex).div(WAD),
        receiveAmountDAI: new BigNumber(auctionData.lot._hex).div(RAD),
        receiverAddress: auctionData.guy,
        auctionEndDate,
        bidEndDate,
        state,
    };
};

const getActiveSurplusAuctionOrUndefined = async (network: string, auctionIndex: number) => {
    const auction = await fetchSurplusAuctionByIndex(network, auctionIndex);
    if (auction.state === 'collected') {
        return;
    }
    return auction;
};

export const fetchActiveSurplusAuctions = async function (network: string): Promise<SurplusAuction[]> {
    const contract = await getContract(network, 'MCD_FLAP');
    const auctionLastIndex = await getSurplusAuctionLastIndex(contract);

    const surplusAuctions: SurplusAuction[] = [];
    let currentSurplusAuction;
    for (let i = auctionLastIndex; i > 0; i--) {
        currentSurplusAuction = await getActiveSurplusAuctionOrUndefined(network, i);
        if (!currentSurplusAuction) {
            break;
        }
        surplusAuctions.push(currentSurplusAuction);
    }
    return surplusAuctions;
};

const surplusAuctionRestartedCallback = async function (
    network: string,
    auctionIndex: number
): Promise<SurplusAuction> {
    const restartedAuction = await getActiveSurplusAuctionOrUndefined(network, auctionIndex);
    if (!restartedAuction) {
        throw new Error('Failed to refetch the restarted auction.');
    }
    return restartedAuction;
};

export const restartSurplusAuction = async function (
    network: string,
    auctionIndex: number,
    notifier?: Notifier
): Promise<SurplusAuction> {
    const auction = await getActiveSurplusAuctionOrUndefined(network, auctionIndex);
    if (!auction || auction!.state !== 'requires-restart') {
        throw new Error("Can't restart the active auction");
    }
    await executeTransaction(network, 'MCD_FLAP', 'tick', [new BigNumber(auctionIndex).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0)], notifier);
    return await surplusAuctionRestartedCallback(network, auctionIndex);
};

export const bidToSurplusAuction = async function (
    network: string,
    auctionIndex: number,
    bet: string,
    notifier?: Notifier
) {
    const auction = await getActiveSurplusAuctionOrUndefined(network, Number(auctionIndex));
    if (!auction) {
        throw new Error('Did not find the auction to bid on.');
    }
    const transactionParameters = [
        new BigNumber(auctionIndex).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        auction.receiveAmountDAI.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        new BigNumber(bet).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
    ];
    await executeTransaction(network, 'MCD_FLAP', 'tend', transactionParameters, notifier);
};

export const collectSurplusAuction = async function (network: string, auctionIndex: number, notifier?: Notifier) {
    const auction = await getActiveSurplusAuctionOrUndefined(network, Number(auctionIndex));
    if (!auction || auction.state !== 'ready-for-collection') {
        throw new Error('Did not find the auction to collect.');
    }
    await executeTransaction(
        network,
        'MCD_FLAP',
        'deal',
        [new BigNumber(auctionIndex).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0)],
        notifier
    );
};

const canTransactionBeConfirmed = function (network: string, confirmTransaction?: boolean) {
    const networkConfig = getNetworkConfigByType(network);
    if (networkConfig.isFork) {
        return false;
    }
    return confirmTransaction;
};
export const approveEthToMkrSwap = async function (network: string, notifier?: Notifier) {
    const signer = await getSigner(network);
    const contractEth = await new Contract('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', ETH, signer);
    console.log(contractEth)
    let deadline = await getNetworkDate(network);
    deadline.setHours(deadline.getDate() + 1);


    // transaction to approve swaps
    const gasParametersApprove = await getGasParametersForTransaction(network);
    const transactionPromiseApprove = contractEth['approve'](...['0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', new BigNumber(100).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0)], {
        ...gasParametersApprove,
        type: gasParametersApprove.gasPrice ? undefined : 2,
    });
    return trackTransaction(transactionPromiseApprove, notifier, canTransactionBeConfirmed(network));
}
export const exchangeEthToMkr = async function (network: string, receiverAddress: string, amount: BigNumber = new BigNumber(100), notifier?: Notifier) {
    const signer = await getSigner(network);
    const contract = await new Contract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', UNI_SWAP, signer);
    let deadline = await getNetworkDate(network);
    deadline.setHours(deadline.getDate() + 1);

    // transaction to swap
    const transactionParameters = [
        amount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        new BigNumber(0).toFixed(0),
        ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xC4269cC7acDEdC3794b221aA4D9205F564e27f0d'],
        receiverAddress,
        new BigNumber(Math.floor(deadline.getTime() / 1000)).toFixed(0)
    ]
    const gasParameters = await getGasParametersForTransaction(network);
    console.log(contract)
    const transactionPromise = contract['swapExactTokensForETH(uint256,uint256,address[],address,uint256)'](...transactionParameters, {
        ...gasParameters,
        type: gasParameters.gasPrice ? undefined : 2,
    });
    return trackTransaction(transactionPromise, notifier, canTransactionBeConfirmed(network));
}
