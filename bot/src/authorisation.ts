import getSigner from 'auctions-core/dist/src/signer';
import {
    authorizeCollateral,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    getWalletAuthorizationStatus,
} from 'auctions-core/src/authorizations';
import { ETHEREUM_NETWORK } from '~/src/variables';

export async function authorizeKeeperWallet(authorizeCallback: () => void) {
    const signer = await getSigner(ETHEREUM_NETWORK);
    const walletAddress = await signer.getAddress();
    const isWalletAuth = await getWalletAuthorizationStatus(ETHEREUM_NETWORK, walletAddress);

    if (!isWalletAuth) {
        console.info(`keeper: wallet "${walletAddress}" has not been authorized yet. Attempting authorization now...`);
        const transactionHash = await authorizeWallet(ETHEREUM_NETWORK, walletAddress, false);
        console.info(`keeper: wallet "${walletAddress}" successfully authorized via "${transactionHash}" transaction`);
        authorizeCallback();
    }
}

export async function checkAndAuthorizeKeeperCollateral(
    walletAddress: string,
    collateralType: string,
    authorizeCallback: () => void
) {
    // get collateral authorization status
    const isCollateralAuth = await getCollateralAuthorizationStatus(ETHEREUM_NETWORK, collateralType, walletAddress);

    // try to authorize the collateral then return
    if (!isCollateralAuth) {
        console.info(
            `keeper: collateral "${collateralType}" has not been authorized on wallet "${walletAddress}" yet. Attempting authorization now...`
        );
        const collateralTransactionHash = await authorizeCollateral(
            ETHEREUM_NETWORK,
            walletAddress,
            collateralType,
            false
        );
        console.info(
            `keeper: collateral "${collateralType}" successfully authorized on wallet "${walletAddress}" via "${collateralTransactionHash}" transaction`
        );
        authorizeCallback();
    }
}
