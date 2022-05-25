import getSigner from 'auctions-core/src/signer';
import {
    authorizeCollateral,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    getWalletAuthorizationStatus,
} from 'auctions-core/src/authorizations';
import { ETHEREUM_NETWORK, KEEPER_PREAUTHORIZE } from './variables';
import { getWhitelistedCollaterals } from './whitelist';

export async function checkAndAuthorizeWallet(walletAddress: string): Promise<boolean> {
    const isWalletAuth = await getWalletAuthorizationStatus(ETHEREUM_NETWORK, walletAddress);

    if (isWalletAuth) {
        console.info(`keeper: wallet "${walletAddress}" has already been authorized`);
        return false;
    }

    console.info(`keeper: wallet "${walletAddress}" has not been authorized yet. Attempting authorization now...`);
    const transactionHash = await authorizeWallet(ETHEREUM_NETWORK, walletAddress, false);
    console.info(`keeper: wallet "${walletAddress}" successfully authorized via "${transactionHash}" transaction`);
    return true;
}

export async function checkAndAuthorizeCollateral(walletAddress: string, collateralType: string): Promise<boolean> {
    // get collateral authorization status
    const isCollateralAuth = await getCollateralAuthorizationStatus(ETHEREUM_NETWORK, collateralType, walletAddress);

    // try to authorize the collateral then return
    if (isCollateralAuth) {
        console.info(
            `keeper: collateral "${collateralType}" has already been authorized on wallet "${walletAddress}"`
        );
        return false;
    }

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
    return true;
}

export async function executePreAuthorizationsIfRequested() {
    if (KEEPER_PREAUTHORIZE !== true) {
        return;
    }

    const collaterals = await getWhitelistedCollaterals();
    console.info(
        `keeper: "KEEPER_PREAUTHORIZE" is true. Attempting to authorize wallet and collaterals: "${collaterals.join(
            ', '
        )}"`
    );
    const signer = await getSigner(ETHEREUM_NETWORK);
    const walletAddress = await signer.getAddress();
    await checkAndAuthorizeWallet(walletAddress);
    for (const collateral of collaterals) {
        await checkAndAuthorizeCollateral(walletAddress, collateral);
    }
}
