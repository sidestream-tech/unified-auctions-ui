import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';
import { getNetworks, getChainIdByNetworkType, getNetworkTypeByChainId } from 'auctions-core/src/network';
import { formatToHexWithoutPad } from 'auctions-core/helpers/format';
import { setSigner } from 'auctions-core/src/signer';
import WalletConnectLogo from '~/assets/icons/wallets/walletconnect.svg';
import AbstractWallet from '~/lib/wallets/AbstractWallet';

export default class WalletConnect extends AbstractWallet {
    public static title = 'WalletConnect';
    public static icon = WalletConnectLogo;

    private static provider?: WalletConnectProvider;

    private addresses?: string[];

    public get address() {
        if (Array.isArray(this.addresses) && this.addresses[0]) {
            return this.addresses[0].toLowerCase();
        }
    }

    async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
        if (!WalletConnect.provider) {
            const networks = getNetworks();
            const rpcMap = networks.reduce(
                (accumulatorObj, network) => ({ ...accumulatorObj, [parseInt(network.chainId, 16)]: network.url }),
                {}
            );
            WalletConnect.provider = new WalletConnectProvider({ rpc: rpcMap });
            await WalletConnect.provider.enable();
        }
        return new ethers.providers.Web3Provider(WalletConnect.provider);
    }

    async getSigner(): Promise<ethers.providers.JsonRpcSigner> {
        const provider = await this.getProvider();
        await provider.send('eth_accounts', []);
        return provider.getSigner();
    }

    public async connect(): Promise<void> {
        const signer = await this.getSigner();
        this.addresses = [await signer.getAddress()];
        await this.networkChangedHandler();
        this.setup();
    }

    public async switchNetwork(network: string): Promise<void> {
        const provider = await this.getProvider();
        const chainId = getChainIdByNetworkType(network);
        await provider.send('wallet_switchEthereumChain', [{ chainId }]);
    }

    public async networkChangedHandler() {
        if (!WalletConnect.provider) {
            return;
        }
        const signer = await this.getSigner();
        const chainId = formatToHexWithoutPad(await signer.getChainId());
        const networkType = getNetworkTypeByChainId(chainId);
        if (networkType) {
            setSigner(networkType, signer as any);
        }
        window.$nuxt.$store.dispatch('network/setWalletChainId', chainId);
    }

    public accountsChangedHandler(addresses: string[]) {
        this.addresses = addresses;
        window.$nuxt.$store.dispatch('wallet/setAddress', this.address);
    }

    public setup() {
        if (!WalletConnect.provider) {
            return;
        }
        WalletConnect.provider.on('accountsChanged', this.accountsChangedHandler.bind(this));
        WalletConnect.provider.on('chainChanged', this.networkChangedHandler.bind(this));
    }

    public async teardown() {
        if (!WalletConnect.provider) {
            return;
        }
        window.$nuxt.$store.dispatch('network/setWalletChainId', undefined);
        await WalletConnect.provider.disconnect();
        WalletConnect.provider.removeListener('accountsChanged', this.accountsChangedHandler.bind(this));
        WalletConnect.provider.removeListener('chainChanged', this.networkChangedHandler.bind(this));
        WalletConnect.provider = undefined;
    }
}
