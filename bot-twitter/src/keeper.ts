import { AuctionInitialInfo } from 'auctions-core/src/types';
import getSigner, { createSigner, setSigner } from 'auctions-core/src/signer';
import { bidOnTheAuction, enrichAuction } from 'auctions-core/src/auctions';
import {
    authorizeCollateral,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    getWalletAuthorizationStatus,
} from 'auctions-core/src/authorizations';
import { ETHEREUM_NETWORK, KEEPER_MIN_PROFIT_DAI, KEEPER_WALLET_PRIVATE_KEY } from './variables';
import { setupWallet } from '~/src/authorizations';

function areKeeperVariablesSet(): boolean {
    if (!KEEPER_WALLET_PRIVATE_KEY) {
        return false;
    }
    return Number.isNaN(KEEPER_MIN_PROFIT_DAI);
}

export async function setupKeeper() {
    if (!areKeeperVariablesSet()) {
        console.warn('keeper: keeper variables are not set. Please check configuration.');
        return;
    }
    if (KEEPER_WALLET_PRIVATE_KEY) {
        setSigner(ETHEREUM_NETWORK, createSigner(ETHEREUM_NETWORK, KEEPER_WALLET_PRIVATE_KEY));
        await setupWallet(ETHEREUM_NETWORK);
    }
}

async function participate(auction: AuctionInitialInfo) {
    if (!areKeeperVariablesSet()) {
        return;
    }
    const signer = await getSigner(ETHEREUM_NETWORK);

    // enrich the auction with more numbers
    const auctionTransaction = await enrichAuction(ETHEREUM_NETWORK, auction);

    if (auctionTransaction.isFinished || !auctionTransaction.isActive) {
        console.info(`Auction "${auction.id}" is not active or has already finished.`);
        return;
    }

    // check if the profit of the auction is worth executing
    if (
        auctionTransaction.transactionProfitMinusFees &&
        auctionTransaction.transactionProfitMinusFees.toNumber() < KEEPER_MIN_PROFIT_DAI
    ) {
        console.info(
            `Auction "${
                auction.id
            }" clear profit is smaller than min profit (${auctionTransaction.transactionProfitMinusFees.toFixed()} < ${KEEPER_MIN_PROFIT_DAI})`
        );
        return;
    }

    // get wallet authorization status
    const walletAddress = await signer.getAddress();
    const isAuth = await getWalletAuthorizationStatus(ETHEREUM_NETWORK, walletAddress);

    // try to authorize the wallet then return
    if (!isAuth) {
        console.info(`Wallet "${walletAddress}" has not been authorized yet. Attempting authorization now`);
        const transactionHash = await authorizeWallet(ETHEREUM_NETWORK, false);
        console.info(`Wallet "${walletAddress}" successfully authorized via "${transactionHash}" transaction`);
        await participate(auction);
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
            `Collateral "${auctionTransaction.collateralType}" has not been authorized on wallet "${walletAddress}" yet. Attempting authorization now`
        );
        const collateralTransactionHash = await authorizeCollateral(
            ETHEREUM_NETWORK,
            auctionTransaction.collateralType,
            false
        );
        console.info(
            `Collateral "${auctionTransaction.collateralType}" successfully authorized on wallet "${walletAddress}" via "${collateralTransactionHash}" transaction`
        );
        await participate(auction);
        return;
    }

    // Bid on the Auction
    const bidHash = await bidOnTheAuction(ETHEREUM_NETWORK, auctionTransaction, walletAddress);
    console.info(`Auction "${auctionTransaction.id}" was executed via "${bidHash}" transaction`);
}

export default participate;
