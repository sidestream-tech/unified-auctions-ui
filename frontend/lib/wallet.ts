import AbstractWallet from '~/lib/wallets/AbstractWallet';
import MetaMask from '~/lib/wallets/MetaMask';
import WalletConnect from '~/lib/wallets/WalletConnect';
import Coinbase from '~/lib/wallets/Coinbase';

const WALLETS = [MetaMask, WalletConnect, Coinbase];

let globalWallet: AbstractWallet;

const getWallet = function (walletTitle?: string): typeof globalWallet {
    if (!walletTitle) {
        if (!globalWallet) {
            throw new Error('wallet was not yet initialised');
        }
        return globalWallet;
    }
    const SelectedWallet = WALLETS.find(v => v.title === walletTitle);
    if (!walletTitle || !SelectedWallet) {
        throw new Error(`no wallet type "${walletTitle}" found`);
    }
    if (globalWallet && globalWallet instanceof SelectedWallet) {
        return globalWallet;
    }
    globalWallet = new SelectedWallet();
    return globalWallet;
};

export { WALLETS };
export default getWallet;
