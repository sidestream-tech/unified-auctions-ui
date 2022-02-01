import getSigner from 'auctions-core/src/signer';
import { authorizeWallet, getWalletAuthorizationStatus } from 'auctions-core/src/authorizations';

export async function setupWallet(network: string) {
    const signer = getSigner(network);
    const walletAddress = await signer.getAddress();
    const isAuth = await getWalletAuthorizationStatus(network, walletAddress);

    if (!isAuth) {
        console.info('Wallet has not been authorized yet. Attempting authorization now.');
        await authorizeWallet(network, false);
    }
}
