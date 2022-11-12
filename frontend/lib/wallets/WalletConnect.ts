import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';
import { formatToHexWithoutPad } from 'auctions-core/helpers/format';
import { getChainIdByNetworkType, getNetworkTypeByChainId } from 'auctions-core/src/network';
import { setSigner } from 'auctions-core/src/signer';
import { getDecimalChainIdFromRpcUrl, parseInfuraProjectIdFromRpcUrl } from 'auctions-core/src/rpc';
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
        const rpcUrl = process.env.RPC_URL;
        if (!rpcUrl) {
            throw new Error(`No RPC_URL env variable was provided`);
        }
        const chainId = await getDecimalChainIdFromRpcUrl(rpcUrl);
        const chainIdHex = formatToHexWithoutPad(chainId);
        const networkType = getNetworkTypeByChainId(chainIdHex);
        const projectId = parseInfuraProjectIdFromRpcUrl(rpcUrl);
        if (projectId) {
            WalletConnect.provider = new WalletConnectProvider({
                infuraId: projectId,
                chainId,
            });
        } else {
            WalletConnect.provider = new WalletConnectProvider({
                rpc: {
                    [chainId]: rpcUrl,
                },
                chainId,
            });
        }
        await WalletConnect.provider.enable();
        await WalletConnect.provider.updateState({ rpcUrl, chainId, networkId: networkType });
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
        const chainIdHex = getChainIdByNetworkType(network);
        await provider.send('wallet_switchEthereumChain', [{ chainIdHex }]);
    }

    public async networkChangedHandler() {
        if (!WalletConnect.provider) {
            return;
        }
        const chainIdHex = formatToHexWithoutPad(WalletConnect.provider.chainId);
        const networkType = getNetworkTypeByChainId(chainIdHex);
        const signer = await this.getSigner();
        if (networkType) {
            setSigner(networkType, signer as any);
        }
        window.$nuxt.$store.dispatch('network/setWalletChainId', chainIdHex);
    }

    public accountsChangedHandler(addresses: Array<string>) {
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
