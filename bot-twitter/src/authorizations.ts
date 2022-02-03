import getSigner from 'auctions-core/src/signer';
import { authorizeWallet, getWalletAuthorizationStatus } from 'auctions-core/src/authorizations';

export async function setupWallet(network: string) {
    const signer = await getSigner(network);
    const walletAddress = await signer.getAddress();
    const isAuth = await getWalletAuthorizationStatus(network, walletAddress);
    if (isAuth) {
        console.info(`Wallet "${walletAddress}" has already been authorized`);
        return;
    }
    console.info(`Wallet "${walletAddress}" has not been authorized yet. Attempting authorization now`);
    await authorizeWallet(network, false);
    console.info(`Wallet "${walletAddress}" successfully authorized`);
}
