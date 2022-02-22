import { AuctionInitialInfo } from 'auctions-core/src/types';
import getSigner from 'auctions-core/src/signer';
import { enrichAuction } from 'auctions-core/src/auctions';
import {
    authorizeCollateral,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    getWalletAuthorizationStatus,
} from 'auctions-core/src/authorizations';
import { ETHEREUM_NETWORK, KEEPER_MIN_PROFIT_DAI } from './variables';

async function participate(auction: AuctionInitialInfo) {
    console.info(`Checking Auction ${auction.id}`);

    const signer = await getSigner(ETHEREUM_NETWORK);

    // enrich the auction with more numbers
    const auctionTransaction = await enrichAuction(ETHEREUM_NETWORK, auction);

    // check if the profit of the auction is worth executing
    if (auctionTransaction.transactionProfitMinusFees.toNumber() < KEEPER_MIN_PROFIT_DAI) {
        console.info(
            `Auction ${
                auction.id
            }, is NOT profitable. Exiting now. [${auctionTransaction.transactionProfitMinusFees.toNumber()}/${KEEPER_MIN_PROFIT_DAI} DAI]`
        );
        return;
    }
    console.info(`Auction ${auction.id}, is profitable. Continuing now.`);

    // get wallet authorization status
    const walletAddress = await signer.getAddress();
    const isAuth = await getWalletAuthorizationStatus(ETHEREUM_NETWORK, walletAddress);

    // try to authorize the wallet then return
    if (!isAuth) {
        console.info(`Wallet "${walletAddress}" has not been authorized yet. Attempting authorization now`);
        const transactionHash = await authorizeWallet(ETHEREUM_NETWORK, false);
        console.info(`Wallet "${walletAddress}" successfully authorized via "${transactionHash}" transaction`);
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
        await authorizeCollateral(ETHEREUM_NETWORK, auctionTransaction.collateralType, true);
        return;
    }

    // How can I add a check to test if the Auction is already being executed?
    console.info('AUCTION SHOULD BE EXECUTED NOW!!!!');
}

export default participate;
