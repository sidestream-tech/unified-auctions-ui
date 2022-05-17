import getSigner from 'auctions-core/src/signer';
import {
    authorizeCollateral,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    getWalletAuthorizationStatus,
} from 'auctions-core/src/authorizations';
import { ETHEREUM_NETWORK, KEEPER_PREAUTHORIZE, WHITELISTED_COLLATERALS } from './variables';
import { parseCollateralWhitelist } from './whitelist';

export async function authorizeKeeperWallet(authorizeCallback?: () => void) {
    const signer = await getSigner(ETHEREUM_NETWORK);
    const walletAddress = await signer.getAddress();
    const isWalletAuth = await getWalletAuthorizationStatus(ETHEREUM_NETWORK, walletAddress);

    if (!isWalletAuth) {
        console.info(`keeper: wallet "${walletAddress}" has not been authorized yet. Attempting authorization now...`);
        const transactionHash = await authorizeWallet(ETHEREUM_NETWORK, walletAddress, false);
        console.info(`keeper: wallet "${walletAddress}" successfully authorized via "${transactionHash}" transaction`);
        if (authorizeCallback) {
            authorizeCallback();
        }
    }
}

export async function checkAndAuthorizeKeeperCollateral(
    walletAddress: string,
    collateralType: string,
    authorizeCallback?: () => void
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
        if (authorizeCallback) {
            authorizeCallback();
        }
    }
}

export async function setupCollateralAuthorizations() {
    if (!KEEPER_PREAUTHORIZE || !WHITELISTED_COLLATERALS) {
        return;
    }

    // check if the wallet is authorized
    await authorizeKeeperWallet();

    const collaterals = parseCollateralWhitelist(WHITELISTED_COLLATERALS);
    console.info(
        `keeper: "KEEPER_PREAUTHORIZE" is true attempting to authorize collaterals: '${collaterals.toString()}'`
    );

    const signer = await getSigner(ETHEREUM_NETWORK);
    const walletAddress = await signer.getAddress();

    for (const collateral of collaterals) {
        await checkAndAuthorizeKeeperCollateral(walletAddress, collateral);
    }
}
