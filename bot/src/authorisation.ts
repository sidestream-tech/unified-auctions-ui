import getSigner from 'auctions-core/src/signer';
import {
    authorizeCollateral,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    getWalletAuthorizationStatus,
} from 'auctions-core/src/authorizations';
import { KEEPER_PREAUTHORIZE } from './variables';
import { getWhitelistedCollaterals } from './whitelist';

export async function checkAndAuthorizeWallet(network: string, walletAddress: string): Promise<boolean> {
    const isWalletAuth = await getWalletAuthorizationStatus(network, walletAddress);

    if (isWalletAuth) {
        console.info(`keeper: wallet "${walletAddress}" has already been authorized`);
        return false;
    }

    console.info(`keeper: wallet "${walletAddress}" has not been authorized yet. Attempting authorization now...`);
    const transactionHash = await authorizeWallet(network, walletAddress, false);
    console.info(`keeper: wallet "${walletAddress}" successfully authorized via "${transactionHash}" transaction`);
    return true;
}

export async function checkAndAuthorizeCollateral(
    network: string,
    walletAddress: string,
    collateralType: string
): Promise<boolean> {
    // get collateral authorization status
    const isCollateralAuth = await getCollateralAuthorizationStatus(network, collateralType, walletAddress);

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
    const collateralTransactionHash = await authorizeCollateral(network, walletAddress, collateralType, false);
    console.info(
        `keeper: collateral "${collateralType}" successfully authorized on wallet "${walletAddress}" via "${collateralTransactionHash}" transaction`
    );
    return true;
}

export async function executePreAuthorizationsIfRequested(network: string) {
    if (KEEPER_PREAUTHORIZE !== true) {
        return;
    }

    const collaterals = await getWhitelistedCollaterals(network);
    console.info(
        `keeper: "KEEPER_PREAUTHORIZE" is true. Attempting to authorize wallet and collaterals: "${collaterals.join(
            ', '
        )}"`
    );
    const signer = await getSigner(network);
    const walletAddress = await signer.getAddress();
    await checkAndAuthorizeWallet(network, walletAddress);
    for (const collateral of collaterals) {
        await checkAndAuthorizeCollateral(network, walletAddress, collateral);
    }
}
