import BigNumber from 'auctions-core/src/bignumber';
import { DebtAuctionActive } from 'auctions-core/src/types';
import { bidToDebtAuction, enrichDebtAuction, collectDebtAuction } from 'auctions-core/src/debt';
import getSigner from 'auctions-core/src/signer';
import { fetchVATbalanceDAI, depositToVAT, fetchBalanceDAI } from 'auctions-core/src/wallet';
import {
    getDebtAuctionAuthorizationStatus,
    authorizeDebtAuction,
    fetchAllowanceAmountDAI,
    setAllowanceAmountDAI,
} from 'auctions-core/src/authorizations';
import { formatToAutomaticDecimalPointsString } from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';
import { KEEPER_DEBT_MINIMUM_NET_PROFIT_DAI } from '../variables';
import { setupWallet } from '../signer';

let isSetupCompleted = false;
const currentlyExecutedAuctions = new Set();

export const setupDebtKeeper = async function (network: string) {
    await setupWallet(network);
    if (Number.isNaN(KEEPER_DEBT_MINIMUM_NET_PROFIT_DAI)) {
        console.info('debt keeper: no KEEPER_DEBT_MINIMUM_NET_PROFIT_DAI env variable provided, keeper will not run');
        return;
    }
    console.info(
        `debt keeper: setup complete, looking for minimum net profit of "${KEEPER_DEBT_MINIMUM_NET_PROFIT_DAI}" DAI`
    );
    isSetupCompleted = true;
};

const checkAndParticipateIfPossible = async function (network: string, auction: DebtAuctionActive) {
    // check if setupDebtKeeper hasn't run
    if (!isSetupCompleted) {
        return;
    }

    const signer = await getSigner(network);
    const walletAddress = await signer.getAddress();

    // enrich the auction with more numbers
    const auctionTransaction = await enrichDebtAuction(network, auction);

    // check if the current user is the winner
    if (auctionTransaction.receiverAddress.toLocaleLowerCase() === walletAddress.toLowerCase()) {
        // check if auction became inactive or finished
        if (auctionTransaction.state !== 'ready-for-collection') {
            console.info(
                `debt keeper: current wallet "${walletAddress}" is the latest bidder of the auction "${
                    auction.id
                }", waiting for auction expiration at ${auction.earliestEndDate.toISOString()}`
            );
        } else {
            console.info(
                `debt keeper: wallet "${walletAddress}" won auction "${auction.id}", moving on to collection`
            );
            await collectDebtAuction(network, auction.id);
            console.info(`debt keeper: auction "${auction.id}" was successfully collected`);
        }
        return;
    }

    if (auctionTransaction.state === 'ready-for-collection') {
        console.info(
            `debt keeper: auction "${auction.id}" has already finished and the winner is not "${walletAddress}"`
        );
        return;
    }

    if (auctionTransaction.state === 'requires-restart') {
        console.info(`debt keeper: auction "${auction.id}" is inactive`);
        return;
    }

    // check auction's net profit – profit without transaction fees
    const netProfit = auctionTransaction.marketUnitPrice
        .minus(auctionTransaction.unitPrice)
        .times(auctionTransaction.nextMaximumLotReceived)
        .minus(auctionTransaction.combinedBidFeesDai);
    if (netProfit.isLessThan(new BigNumber(KEEPER_DEBT_MINIMUM_NET_PROFIT_DAI))) {
        console.info(
            `debt keeper: auction "${
                auction.id
            }" net profit is smaller than min profit (${formatToAutomaticDecimalPointsString(
                netProfit
            )} < ${KEEPER_DEBT_MINIMUM_NET_PROFIT_DAI})`
        );
        return;
    } else {
        console.info(
            `debt keeper: auction "${auction.id}" net profit is ${formatToAutomaticDecimalPointsString(
                netProfit
            )} DAI after transaction fees, checking wallet DAI balance`
        );
    }

    // check the VAT DAI balance
    const vatBalanceDai = await fetchVATbalanceDAI(network, walletAddress);
    if (vatBalanceDai.isLessThan(auctionTransaction.bidAmountDai)) {
        console.info(
            `debt keeper: VAT DAI balance (${formatToAutomaticDecimalPointsString(
                vatBalanceDai
            )}) is less than fixed bid amount (${formatToAutomaticDecimalPointsString(
                auctionTransaction.bidAmountDai
            )}) for auction "${auction.id}", checking walllet DAI balance to deposit to VAT`
        );
        // check the wallet's DAI balance
        const balanceDai = await fetchBalanceDAI(network, walletAddress);
        if (balanceDai.isLessThan(auctionTransaction.bidAmountDai)) {
            console.info(
                `debt keeper: wallet DAI balance (${formatToAutomaticDecimalPointsString(
                    balanceDai
                )}) is less than fixed bid amount (${formatToAutomaticDecimalPointsString(
                    auctionTransaction.bidAmountDai
                )}) for auction "${auction.id}"`
            );
        } else {
            console.info(
                `debt keeper: wallet DAI balance (${formatToAutomaticDecimalPointsString(
                    balanceDai
                )}) is within limits, checking allowance`
            );
            const allowanceAmount = await fetchAllowanceAmountDAI(network, walletAddress);
            if (allowanceAmount.isGreaterThanOrEqualTo(auctionTransaction.bidAmountDai)) {
                console.info(
                    `debt keeper: current allowance (${formatToAutomaticDecimalPointsString(
                        allowanceAmount
                    )}) is within limits, depositing to VAT`
                );
                await depositToVAT(network, walletAddress, auctionTransaction.bidAmountDai);
                await checkAndParticipateIfPossible(network, auction);
            } else {
                console.info(
                    `debt keeper: current allowance (${formatToAutomaticDecimalPointsString(
                        allowanceAmount
                    )}) is not within limits, increasing allowance`
                );
                await setAllowanceAmountDAI(network, walletAddress);
                await checkAndParticipateIfPossible(network, auction);
            }
        }
        return;
    } else {
        console.info(
            `debt keeper: VAT DAI balance (${formatToAutomaticDecimalPointsString(
                vatBalanceDai
            )}) is within limits, checking if contract is authorized`
        );
    }

    // check the authorization status of the contract
    const isAuthed = await getDebtAuctionAuthorizationStatus(network, walletAddress);
    if (isAuthed) {
        console.info('debt keeper: contract is authorized, moving on to execution');
    } else {
        console.info('debt keeper: contract is not authorized, authorizing contract');
        await authorizeDebtAuction(network, walletAddress, false);
        await checkAndParticipateIfPossible(network, auction);
        return;
    }

    // bid on the Auction
    console.info(`debt keeper: auction "${auctionTransaction.id}": attempting bid execution`);
    await bidToDebtAuction(network, auctionTransaction.id, auctionTransaction.nextMaximumLotReceived);
    console.info(`debt keeper: auction "${auctionTransaction.id}" was succesfully executed`);
};

const participateInAuction = async function (network: string, auction: DebtAuctionActive) {
    // check if this auction is currently executed to avoid double execution
    if (currentlyExecutedAuctions.has(auction.id)) {
        return;
    }
    currentlyExecutedAuctions.add(auction.id);

    // execute
    try {
        await checkAndParticipateIfPossible(network, auction);
    } catch (error) {
        console.error(`debt keeper: unexpected error: ${(error instanceof Error && error.message) || 'unknown'}`);
    }

    // clear pool of currently executed auctions
    currentlyExecutedAuctions.delete(auction.id);
};

export const participate = async function (network: string, auctions: DebtAuctionActive[]) {
    for (const auction of auctions) {
        await participateInAuction(network, auction);
    }
};

export default participate;
