import { ethers } from 'ethers';
import { message } from 'ant-design-vue';
import { getChainIdByNetworkType, getNetworkTypeByChainId } from 'auctions-core/src/network';
import { setSigner } from 'auctions-core/src/signer';
import { formatToHexWithoutPad } from 'auctions-core/helpers/format';
import MetaMaskLogo from '~/assets/icons/wallets/metamask.svg';
import AbstractWallet from '~/lib/wallets/AbstractWallet';

export default class MetaMask extends AbstractWallet {
    public static title = 'Metamask';
    public static icon = MetaMaskLogo;
    public static downloadUrl = 'https://metamask.io/';

    private addresses?: string[];

    public static get isInterfaceReady() {
        return !!window.ethereum;
    }

    public static get isConnected() {
        if (!MetaMask.metamaskProvider) {
            return false;
        }
        return MetaMask.metamaskProvider.isConnected();
    }

    public static get isLoggedIn() {
        return MetaMask.metamaskProvider?.selectedAddress;
    }

    public get address() {
        if (Array.isArray(this.addresses) && this.addresses[0]) {
            return this.addresses[0].toLowerCase();
        }
    }

    static get metamaskProvider(): any {
        if (window?.ethereum?.providers) {
            // Coinbase overwites metamask's object into `providers` list
            return window?.ethereum?.providers.find((provider: any) => provider.isMetaMask);
        }
        if (window?.ethereum?.isConnected && window?.ethereum?.isMetaMask) {
            // wallet has been connected before
            return window?.ethereum;
        }
        return undefined;
    }

    static get provider(): ethers.providers.Web3Provider {
        if (MetaMask.metamaskProvider) {
            return new ethers.providers.Web3Provider(MetaMask.metamaskProvider);
        }
        throw new Error('failed to get provider');
    }

    async getSigner(): Promise<ethers.providers.JsonRpcSigner> {
        await MetaMask.provider.send('eth_requestAccounts', []);
        return MetaMask.provider.getSigner();
    }

    public async connect(): Promise<void> {
        const constructor = this.constructor as typeof MetaMask;
        if (!constructor.isConnected) {
            message.error(`Please install ${constructor.title} first from ${constructor.downloadUrl}`);
            return;
        }
        const signer = await this.getSigner();
        this.addresses = [await signer.getAddress()];
        this.networkChangedHandler();
        this.setup();
    }

    public async switchNetwork(network: string): Promise<void> {
        const constructor = this.constructor as typeof MetaMask;
        if (!constructor.isConnected) {
            message.error(`Please install ${constructor.title} first from ${constructor.downloadUrl}`);
            return;
        }
        const chainId = getChainIdByNetworkType(network);
        await MetaMask.provider.send('wallet_switchEthereumChain', [{ chainId }]);
    }

    public async networkChangedHandler() {
        const signer = await this.getSigner();
        const chainId = formatToHexWithoutPad(await signer.getChainId());
        const networkType = getNetworkTypeByChainId(chainId);
        if (networkType) {
            setSigner(networkType, signer as any);
        }
        window.$nuxt.$store.dispatch('network/setWalletChainId', chainId);
    }

    public accountsChangedHandler(addresses: Array<string>) {
        this.addresses = addresses;
        window.$nuxt.$store.dispatch('wallet/setAddress', this.address);
    }

    public setup() {
        if (!(this.constructor as typeof MetaMask).isInterfaceReady) {
            return;
        }
        MetaMask.metamaskProvider.on('accountsChanged', this.accountsChangedHandler.bind(this));
        MetaMask.metamaskProvider.on('chainChanged', this.networkChangedHandler.bind(this));
    }

    public teardown() {
        if (!(this.constructor as typeof MetaMask).isInterfaceReady) {
            return;
        }
        window.$nuxt.$store.dispatch('network/setWalletChainId', undefined);
        MetaMask.metamaskProvider.removeListener('accountsChanged', this.accountsChangedHandler.bind(this));
        MetaMask.metamaskProvider.removeListener('chainChanged', this.networkChangedHandler.bind(this));
    }
}
