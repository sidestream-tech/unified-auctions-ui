import { ethers } from 'ethers';
import { message } from 'ant-design-vue';
import MetaMaskLogo from '~/assets/icons/wallets/metamask.svg';
import AbstractWallet from '~/lib/wallets/AbstractWallet';
import { getChainIdByNetworkType } from '~/../core/src/constants/NETWORKS';

export default class MetaMask extends AbstractWallet {
    public static title = 'Metamask';
    public static icon = MetaMaskLogo;
    public static downloadUrl = 'https://metamask.io/';

    private signer?: ethers.providers.JsonRpcSigner;
    private addresses?: string[];

    public static get isInterfaceReady() {
        return !!window.ethereum;
    }

    public static get isConnected() {
        if (!window.ethereum) {
            return false;
        }
        return window.ethereum.isConnected();
    }

    public static get isLoggedIn() {
        if (!window.ethereum) {
            return false;
        }
        return window.ethereum.selectedAddress;
    }

    public get address() {
        if (!this.addresses) {
            return undefined;
        }
        return this.addresses[0].toLowerCase();
    }

    public async connect(): Promise<void> {
        const constructor = this.constructor as typeof MetaMask;
        if (!constructor.isConnected) {
            message.error(`Please install ${constructor.title} first from ${constructor.downloadUrl}`);
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        await provider.send('eth_requestAccounts', []);
        this.signer = provider.getSigner();
        const address = await this.signer.getAddress();
        this.addresses = [address];
        this.networkChangedHandler();
        this.setup();
    }

    public async switchNetwork(network: string): Promise<void> {
        const constructor = this.constructor as typeof MetaMask;
        if (!constructor.isConnected) {
            message.error(`Please install ${constructor.title} first from ${constructor.downloadUrl}`);
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        const chainId = getChainIdByNetworkType(network);
        await provider.send('wallet_switchEthereumChain', [{ chainId }]);
    }

    public networkChangedHandler() {
        window.$nuxt.$store.dispatch('preferences/setChainID', window.ethereum.chainId);
    }

    public accountsChangedHandler(addresses: Array<string>) {
        this.addresses = addresses;
        window.$nuxt.$store.dispatch('wallet/setAddress', this.address);
    }

    public setup() {
        if (!(this.constructor as typeof MetaMask).isInterfaceReady) {
            return;
        }
        window.ethereum.on('accountsChanged', this.accountsChangedHandler);
        window.ethereum.on('chainChanged', this.networkChangedHandler);
    }

    public teardown() {
        if (!(this.constructor as typeof MetaMask).isInterfaceReady) {
            return;
        }
        window.ethereum.removeListener('accountsChanged', this.accountsChangedHandler);
        window.ethereum.removeListener('chainChanged', this.networkChangedHandler);
    }
}
