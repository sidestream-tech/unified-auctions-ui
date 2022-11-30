import CoinbaseWalletSDK, { CoinbaseWalletProvider } from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';
import { getChainIdByNetworkType, getNetworkConfigByType, getNetworkTypeByChainId } from 'auctions-core/src/network';
import { setSigner } from 'auctions-core/src/signer';
import { formatToHexWithoutPad } from 'auctions-core/helpers/format';
import { SITE_TITLE } from '~/nuxt.config';
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

    getProvider(network?: string): ethers.providers.JsonRpcProvider {
        let rpcUrl: string | undefined;
        try {
            rpcUrl = getNetworkConfigByType(network).url;
        } catch {
            rpcUrl = process.env.RPC_URL;
        }
        if (!rpcUrl) {
            throw new Error(`No RPC_URL env variable was provided`);
        }
        console.warn(`RPC_URL: ${rpcUrl}`);
        if (!Coinbase.provider) {
            const walletSdk = new CoinbaseWalletSDK({ appName: SITE_TITLE });
            Coinbase.provider = walletSdk.makeWeb3Provider(rpcUrl);
        }
        return new ethers.providers.Web3Provider(Coinbase.provider as any);
    }

    async getSigner(): Promise<ethers.providers.JsonRpcSigner> {
        const provider = this.getProvider();
        await provider.send('eth_requestAccounts', []);
        return provider.getSigner();
    }

    public async connect(): Promise<void> {
        const signer = await this.getSigner();
        this.addresses = [await signer.getAddress()];
        this.networkChangedHandler();
        this.setup();
    }

    public async switchNetwork(network: string): Promise<void> {
        const provider = this.getProvider(network);
        const chainId = getChainIdByNetworkType(network);
        await provider.send('wallet_switchEthereumChain', [{ chainId }]);
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
