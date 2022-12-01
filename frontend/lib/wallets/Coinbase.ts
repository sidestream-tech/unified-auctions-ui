import CoinbaseWalletSDK, { CoinbaseWalletProvider } from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';
import {
    getChainIdByNetworkType,
    getDecimalChainIdByNetworkType,
    getNetworkConfigByType,
    getNetworkTypeByChainId,
} from 'auctions-core/src/network';
import { setSigner } from 'auctions-core/src/signer';
import { formatToHexWithoutPad } from 'auctions-core/helpers/format';
import CoinbaseLogo from '~/assets/icons/wallets/coinbase.svg';
import AbstractWallet from '~/lib/wallets/AbstractWallet';

export default class Coinbase extends AbstractWallet {
    public static title = 'Coinbase Wallet';
    public static icon = CoinbaseLogo;
    public static downloadUrl = 'https://www.coinbase.com/wallet/downloads';

    private static provider?: CoinbaseWalletProvider;

    private addresses?: string[];

    public get address() {
        if (Array.isArray(this.addresses) && this.addresses[0]) {
            return this.addresses[0].toLowerCase();
        }
    }

    getProvider(network: string): ethers.providers.JsonRpcProvider {
        const rpcUrl = getNetworkConfigByType(network).url;
        if (!Coinbase.provider) {
            const walletSdk = new CoinbaseWalletSDK({ appName: process.env.SITE_TITLE || '' });
            Coinbase.provider = walletSdk.makeWeb3Provider(rpcUrl);
        }
        return new ethers.providers.Web3Provider(Coinbase.provider as any);
    }

    async getSigner(network: string): Promise<ethers.providers.JsonRpcSigner> {
        const provider = this.getProvider(network);
        await provider.send('eth_requestAccounts', []);
        return provider.getSigner();
    }

    public async connect(network: string): Promise<void> {
        const signer = await this.getSigner(network);
        this.addresses = [await signer.getAddress()];
        const chainIdDecimal = getDecimalChainIdByNetworkType(network);
        this.networkChangedHandler(chainIdDecimal);
        this.setup();
    }

    public async switchNetwork(network: string): Promise<void> {
        const provider = this.getProvider(network);
        const chainId = getChainIdByNetworkType(network);
        await provider.send('wallet_switchEthereumChain', [{ chainId }]);
    }

    public async networkChangedHandler(chainIdDecimal: number) {
        const chainId = formatToHexWithoutPad(chainIdDecimal);
        const networkType = getNetworkTypeByChainId(chainId);
        await window.$nuxt.$store.dispatch('network/setWalletChainId', chainId);
        if (networkType) {
            const signer = await this.getSigner(networkType);
            setSigner(networkType, signer as any);
        }
    }

    public setup() {
        if (!Coinbase.provider) {
            return;
        }
        Coinbase.provider.on('chainChanged', this.networkChangedHandler.bind(this));
    }

    public async teardown() {
        if (!Coinbase.provider) {
            return;
        }
        window.$nuxt.$store.dispatch('network/setWalletChainId', undefined);
        await Coinbase.provider.close();
        Coinbase.provider.removeListener('chainChanged', this.networkChangedHandler.bind(this));
        Coinbase.provider = undefined;
    }
}
