import getSigner, { createSigner, setSigner } from 'auctions-core/src/signer';
import { KEEPER_WALLET_PRIVATE_KEY } from './variables';

export const setupWallet = async function (network: string) {
    try {
        const signer = await getSigner(network);
        return await signer.getAddress();
    } catch (error) {
        if (!KEEPER_WALLET_PRIVATE_KEY) {
            console.warn('wallet: KEEPER_WALLET_PRIVATE_KEY variable is not set');
            return;
        }
        try {
            setSigner(network, createSigner(network, KEEPER_WALLET_PRIVATE_KEY));
            const signer = await getSigner(network);
            const walletAddress = await signer.getAddress();
            console.info(`wallet: setup complete, using wallet "${walletAddress}"`);
            return walletAddress;
        } catch (error) {
            console.warn('wallet: setup error, please check that KEEPER_WALLET_PRIVATE_KEY is valid');
        }
    }
};
