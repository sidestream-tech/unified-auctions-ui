import { getWalletAuthorizationStatus } from 'auctions-core/src/authorizations';

export async function checkWalletAuthorization(): Promise<void> {
    if (!process.env.WALLET_ADDRESS || !process.env.WALLET_PRIVATE_KEY) {
        throw new Error('No wallet was assigned to the bot. Server side auction execution will not be available.');
    }

    const isAuth = await getWalletAuthorizationStatus(process.env.WALLET_ADDRESS);
    if (isAuth) {
        return;
    }

    console.info(isAuth);
}
