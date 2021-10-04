import AbstractWallet from '~/lib/wallets/AbstractWallet';
import MetaMask from '~/lib/wallets/MetaMask';
import WalletConnect from '~/lib/wallets/WalletConnect';

const WALLETS = [MetaMask, WalletConnect];

let globalWallet: AbstractWallet | undefined;

const getWallet = function (walletTitle?: string): typeof globalWallet {
    if (!walletTitle) {
        return globalWallet;
    }
    const SelectedWallet = WALLETS.find(v => v.title === walletTitle);
    if (!walletTitle || !SelectedWallet) {
        return undefined;
    }
    if (globalWallet && globalWallet instanceof SelectedWallet) {
        return globalWallet;
    }
    globalWallet = new SelectedWallet();
    return globalWallet;
};

export { WALLETS };
export default getWallet;
