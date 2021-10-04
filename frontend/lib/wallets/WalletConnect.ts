import WalletConnectLogo from '~/assets/icons/wallets/walletconnect.svg';
import AbstractWallet from '~/lib/wallets/AbstractWallet';

export default class WalletConnect extends AbstractWallet {
    public static title = 'WalletConnect';
    public static icon = WalletConnectLogo;
    public static downloadUrl = 'https://metamask.io/';

    get isInterfaceReady() {
        return true;
    }

    get isConnected() {
        return true;
    }

    get address() {
        return '';
    }

    connect(): Promise<void> {
        throw new Error(`${WalletConnect.title} provider is not yet implemented`);
    }

    switchNetwork(): Promise<void> {
        throw new Error(`${WalletConnect.title} network switching is not yet implemented`);
    }

    setup() {}

    teardown() {}
}
