import { AuctionInitialInfo } from 'auctions-core/src/types';
import getSigner from 'auctions-core/src/signer';
import { enrichAuction } from 'auctions-core/src/auctions';
import {
    authorizeCollateral,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    getWalletAuthorizationStatus,
} from 'auctions-core/src/authorizations';

const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK || 'kovan';
const MIN_PROFIT_DAI = process.env.MIN_PROFIT_DAI || 100;

async function participate(auction: AuctionInitialInfo) {
    console.info(`Checking Auction ${auction.id}`);

    const signer = await getSigner(ETHEREUM_NETWORK);

    // enrich the auction with more numbers
    const auctionTransaction = await enrichAuction(ETHEREUM_NETWORK, auction);

    // check if the profit of the auction is worth executing
    if (auctionTransaction.transactionProfitMinusFees.toNumber() < MIN_PROFIT_DAI) {
        return;
    }

    // get wallet authorization status
    const walletAddress = await signer.getAddress();
    const isAuth = await getWalletAuthorizationStatus(ETHEREUM_NETWORK, walletAddress);

    // try to authorize the wallet then return
    if (!isAuth) {
        await authorizeWallet(ETHEREUM_NETWORK, true);
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
