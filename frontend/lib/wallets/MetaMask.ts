import { ethers } from 'ethers';
import { getChainIdByNetworkType, getNetworkTypeByChainId } from 'auctions-core/src/constants/NETWORKS';
import { setSigner } from 'auctions-core/src/signer';
import { message } from '~/helpers/messageWrapper';
import MetaMaskLogo from '~/assets/icons/wallets/metamask.svg';
import AbstractWallet from '~/lib/wallets/AbstractWallet';

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
        if (Array.isArray(this.addresses) && this.addresses[0]) {
            return this.addresses[0].toLowerCase();
        }
    }

    getProvider(): ethers.providers.JsonRpcProvider {
        return new ethers.providers.Web3Provider(window.ethereum, 'any');
    }

    async getSigner(): Promise<ethers.providers.JsonRpcSigner> {
        const provider = this.getProvider();
        await provider.send('eth_requestAccounts', []);
        return provider.getSigner();
    }

    public async connect(): Promise<void> {
        const constructor = this.constructor as typeof MetaMask;
        if (!constructor.isConnected) {
            message.error(`Please install ${constructor.title} first from ${constructor.downloadUrl}`);
            return;
        }
        const signer = await this.getSigner();
        this.addresses = [await signer.getAddress()];
        await this.networkChangedHandler();
        this.setup();
    }

    public async switchNetwork(network: string): Promise<void> {
        const constructor = this.constructor as typeof MetaMask;
        if (!constructor.isConnected) {
            message.error(`Please install ${constructor.title} first from ${constructor.downloadUrl}`);
            return;
        }
        const provider = this.getProvider();
        const chainId = getChainIdByNetworkType(network);
        await provider.send('wallet_switchEthereumChain', [{ chainId }]);
    }

    public async networkChangedHandler() {
        const networkType = getNetworkTypeByChainId(window.ethereum.chainId);
        const signer = await this.getSigner();
        if (networkType) {
            await setSigner(networkType, signer as any);
        }
        await window.$nuxt.$store.dispatch('network/setWalletChainId', window.ethereum.chainId);
    }

    public accountsChangedHandler(addresses: Array<string>) {
        this.addresses = addresses;
        window.$nuxt.$store.dispatch('wallet/setAddress', this.address).catch(() => {});
    }

    public setup() {
        if (!(this.constructor as typeof MetaMask).isInterfaceReady) {
            return;
        }
        window.ethereum.on('accountsChanged', this.accountsChangedHandler.bind(this));
        window.ethereum.on('chainChanged', this.networkChangedHandler.bind(this));
    }

    public teardown() {
        if (!(this.constructor as typeof MetaMask).isInterfaceReady) {
            return;
        }
        window.$nuxt.$store.dispatch('network/setWalletChainId', undefined).catch(() => {});
        window.ethereum.removeListener('accountsChanged', this.accountsChangedHandler.bind(this));
        window.ethereum.removeListener('chainChanged', this.networkChangedHandler.bind(this));
    }
}
