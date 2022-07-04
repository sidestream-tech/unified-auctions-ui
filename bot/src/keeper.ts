import { AuctionInitialInfo } from 'auctions-core/src/types';
import getSigner, { createSigner, setSigner } from 'auctions-core/src/signer';
import { bidWithCallee, enrichAuction } from 'auctions-core/src/auctions';
import { KEEPER_MINIMUM_NET_PROFIT_DAI, KEEPER_WALLET_PRIVATE_KEY } from './variables';
import { checkAndAuthorizeCollateral, checkAndAuthorizeWallet } from './authorisation';

let isSetupCompleted = false;
const currentlyExecutedAuctions = new Set();

export const setupKeeper = async function (network: string) {
    if (!KEEPER_WALLET_PRIVATE_KEY) {
        console.warn('keeper: KEEPER_WALLET_PRIVATE_KEY variable is not set, keeper will not run');
        return;
    }
    if (Number.isNaN(KEEPER_MINIMUM_NET_PROFIT_DAI)) {
        console.warn('keeper: KEEPER_MINIMUM_NET_PROFIT_DAI is not set or not a number, keeper will not run');
        return;
    }
    try {
        setSigner(network, createSigner(network, KEEPER_WALLET_PRIVATE_KEY));
        const signer = await getSigner(network);
        const address = await signer.getAddress();
        isSetupCompleted = true;
        console.info(
            `keeper: setup complete: using wallet "${address}", looking for minimum clear profit of "${KEEPER_MINIMUM_NET_PROFIT_DAI}" DAI`
        );
    } catch (error) {
        console.warn('keeper: setup error, keeper will not run, please check that KEEPER_WALLET_PRIVATE_KEY is valid');
    }
};

const checkAndParticipateIfPossible = async function (network: string, auction: AuctionInitialInfo) {
    // check if setupKeeper hasn't run
    if (!isSetupCompleted) {
        return;
    }

    const signer = await getSigner(network);

    // enrich the auction with more numbers
    const auctionTransaction = await enrichAuction(network, auction);

    // check if auction became inactive or finished
    if (auctionTransaction.isFinished) {
        console.info(`keeper: auction "${auction.id}" has already finished`);
        return;
    }
    if (!auctionTransaction.isActive) {
        console.info(`keeper: auction "${auction.id}" is inactive`);
        return;
    }

    // check auction's profit
    if (!auctionTransaction.transactionGrossProfit || auctionTransaction.transactionGrossProfit.isLessThan(0)) {
        if (auctionTransaction.transactionGrossProfit) {
            const profit = `${auctionTransaction.transactionGrossProfit.toFixed(0)} DAI`;
            console.info(`keeper: auction "${auction.id}" is not yet profitable (current profit: ${profit})`);
        } else {
            console.info(`keeper: auction "${auction.id}" is not tradable`);
        }
        return;
    }

    // check auction's clear profit – profit without transaction fees
    if (
        auctionTransaction.transactionNetProfit &&
        auctionTransaction.transactionNetProfit.toNumber() < KEEPER_MINIMUM_NET_PROFIT_DAI
    ) {
        console.info(
            `keeper: auction "${
                auction.id
            }" clear profit is smaller than min profit (${auctionTransaction.transactionNetProfit.toFixed(
                0
            )} < ${KEEPER_MINIMUM_NET_PROFIT_DAI})`
        );
        return;
    } else {
        console.info(
            `keeper: auction "${auction.id}" clear profit is ${auctionTransaction.transactionNetProfit.toFixed(
                0
            )} DAI after transaction fees, moving on to the execution`
        );
    }

    const walletAddress = await signer.getAddress();

    // try to authorize the wallet then return
    const wasWalletNewlyAuthorized = await checkAndAuthorizeWallet(network, walletAddress);
    if (wasWalletNewlyAuthorized) {
        // restart auction evaluation in case authorization was executed
        await checkAndParticipateIfPossible(network, auction);
        return;
    }

    // check the collateral authorization status and authorize if needed
    const wasCollateralNewlyAuthorized = await checkAndAuthorizeCollateral(
        network,
        walletAddress,
        auctionTransaction.collateralType
    );
    if (wasCollateralNewlyAuthorized) {
        // restart auction evaluation in case authorization was executed
        await checkAndParticipateIfPossible(network, auction);
        return;
    }

    // bid on the Auction
    console.info(`keeper: auction "${auctionTransaction.id}": attempting swap execution`);
    const bidHash = await bidWithCallee(network, auctionTransaction, walletAddress);
    console.info(`keeper: auction "${auctionTransaction.id}" was succesfully executed via "${bidHash}" transaction`);
};

const participateInAuction = async function (network: string, auction: AuctionInitialInfo) {
    // check if this auction is currently executed to avoid double execution
    if (currentlyExecutedAuctions.has(auction.id)) {
        return;
    }
    currentlyExecutedAuctions.add(auction.id);

    // execute
    try {
        await checkAndParticipateIfPossible(network, auction);
    } catch (error) {
        console.error(`keeper: unexpected error: ${(error instanceof Error && error.message) || 'unknown'}`);
    }

    // clear pool of currently executed auctions
    currentlyExecutedAuctions.delete(auction.id);
};

export const participate = async function (network: string, auctions: AuctionInitialInfo[]) {
    for (const auction of auctions) {
        await participateInAuction(network, auction);
    }
};

export default participate;
