import { AuctionInitialInfo } from 'auctions-core/src/types';
import getSigner, { createSigner, setSigner } from 'auctions-core/src/signer';
import { bidWithCallee, enrichAuction } from 'auctions-core/src/auctions';
import {
    authorizeCollateral,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    getWalletAuthorizationStatus,
} from 'auctions-core/src/authorizations';
import { ETHEREUM_NETWORK, KEEPER_MINIMUM_NET_PROFIT_DAI, KEEPER_WALLET_PRIVATE_KEY } from './variables';

let isSetupCompleted = false;
const currentlyExecutedAuctions = new Set();

export const setupKeeper = async function () {
    if (!KEEPER_WALLET_PRIVATE_KEY) {
        console.warn('keeper: KEEPER_WALLET_PRIVATE_KEY variable is not set, keeper will not run');
        return;
    }
    if (Number.isNaN(KEEPER_MINIMUM_NET_PROFIT_DAI)) {
        console.warn('keeper: KEEPER_MINIMUM_NET_PROFIT_DAI is not set or not a number, keeper will not run');
        return;
    }
    try {
        setSigner(ETHEREUM_NETWORK, createSigner(ETHEREUM_NETWORK, KEEPER_WALLET_PRIVATE_KEY));
        const signer = await getSigner(ETHEREUM_NETWORK);
        const address = await signer.getAddress();
        isSetupCompleted = true;
        console.info(
            `keeper: setup complete: using wallet "${address}", looking for minimum clear profit of "${KEEPER_MINIMUM_NET_PROFIT_DAI}" DAI`
        );
    } catch (error) {
        console.warn('keeper: setup error, keeper will not run, please check that KEEPER_WALLET_PRIVATE_KEY is valid');
    }
};

const checkAndParticipateIfPossible = async function (auction: AuctionInitialInfo) {
    // check if setupKeeper hasn't run
    if (!isSetupCompleted) {
        return;
    }

    const signer = await getSigner(ETHEREUM_NETWORK);

    // enrich the auction with more numbers
    const auctionTransaction = await enrichAuction(ETHEREUM_NETWORK, auction);

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

    // get wallet authorization status
    const walletAddress = await signer.getAddress();
    const isWalletAuth = await getWalletAuthorizationStatus(ETHEREUM_NETWORK, walletAddress);

    // try to authorize the wallet then return
    if (!isWalletAuth) {
        console.info(`keeper: wallet "${walletAddress}" has not been authorized yet. Attempting authorization now...`);
        const transactionHash = await authorizeWallet(ETHEREUM_NETWORK, walletAddress, false);
        console.info(`keeper: wallet "${walletAddress}" successfully authorized via "${transactionHash}" transaction`);
        await checkAndParticipateIfPossible(auction);
        return;
    }

    // get collateral authorization status
    const isCollateralAuth = await getCollateralAuthorizationStatus(
        ETHEREUM_NETWORK,
        auctionTransaction.collateralType,
        walletAddress
    );

    // try to authorize the collateral then return
    if (!isCollateralAuth) {
        console.info(
            `keeper: collateral "${auctionTransaction.collateralType}" has not been authorized on wallet "${walletAddress}" yet. Attempting authorization now...`
        );
        const collateralTransactionHash = await authorizeCollateral(
            ETHEREUM_NETWORK,
            walletAddress,
            auctionTransaction.collateralType,
            false
        );
        console.info(
            `keeper: collateral "${auctionTransaction.collateralType}" successfully authorized on wallet "${walletAddress}" via "${collateralTransactionHash}" transaction`
        );
        await checkAndParticipateIfPossible(auction);
        return;
    }

    // bid on the Auction
    console.info(`keeper: auction "${auctionTransaction.id}": attempting swap execution`);
    const bidHash = await bidWithCallee(ETHEREUM_NETWORK, auctionTransaction, walletAddress);
    console.info(`keeper: auction "${auctionTransaction.id}" was succesfully executed via "${bidHash}" transaction`);
};

const participateInAuction = async function (auction: AuctionInitialInfo) {
    // check if this auction is currently executed to avoid double execution
    if (currentlyExecutedAuctions.has(auction.id)) {
        return;
    }
    currentlyExecutedAuctions.add(auction.id);

    // execute
    try {
        await checkAndParticipateIfPossible(auction);
    } catch (error) {
        console.error(`keeper: unexpected error: ${(error instanceof Error && error.message) || 'unknown'}`);
    }

    // clear pool of currently executed auctions
    currentlyExecutedAuctions.delete(auction.id);
};

export const participate = async function (auctions: AuctionInitialInfo[]) {
    for (let i = 0; i < auctions.length; i += 1) {
        await participateInAuction(auctions[i]);
    }
};

export default participate;
