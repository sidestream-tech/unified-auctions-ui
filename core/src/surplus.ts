import type { Notifier, SurplusAuction, SurplusAuctionBase } from './types';
import { getEarliestDate } from './helpers/getEarliestDate';
import BigNumber from './bignumber';
import getContract from './contracts';
import { Contract } from 'ethers';
import getNetworkDate from './date';
import { RAD, WAD, WAD_NUMBER_OF_DIGITS, RAD_NUMBER_OF_DIGITS } from './constants/UNITS';
import executeTransaction from './execute';
import getSigner from './signer';
import { getGasParametersForTransaction } from './gas';
import trackTransaction from './tracker';
import { getNetworkConfigByType } from './constants/NETWORKS';
import WETH from './abis/WETH.json';
import { ethers } from 'hardhat';
import UNISWAP from './abis/UNISWAP.json';

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
    if (auction === undefined || auction?.state !== 'requires-restart') {
        throw new Error("Can't restart the active auction");
    }
    await executeTransaction(network, 'MCD_FLAP', 'tick', [auctionIndex], notifier);
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
        auctionIndex,
        auction.receiveAmountDAI.shiftedBy(RAD_NUMBER_OF_DIGITS).toFixed(0),
        new BigNumber(bet).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
    ];
    await executeTransaction(network, 'MCD_FLAP', 'tend', transactionParameters, notifier);
};

export const collectSurplusAuction = async function (network: string, auctionIndex: number, notifier?: Notifier) {
    const auction = await getActiveSurplusAuctionOrUndefined(network, Number(auctionIndex));
    if (!auction || auction.state !== 'ready-for-collection') {
        throw new Error('Did not find the auction to collect.');
    }
    await executeTransaction(network, 'MCD_FLAP', 'deal', [auctionIndex], notifier);
};

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
