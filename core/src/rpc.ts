import { ethers } from 'ethers';
import type { NetworkConfig } from './types';
import {
    getDefaultNetworkConfigs,
    getCustomNetworkConfig,
    getNetworks,
    setNetwork,
    getNetworkTypeByChainId,
} from './network';
import { formatToHexWithoutPad } from '../helpers/format';

const getChainIdFromRpcUrl = async function (rpcUrl: string): Promise<string> {
    const provider = new ethers.providers.StaticJsonRpcProvider({ url: rpcUrl });
    const networkInfo = await provider.getNetwork();
    if (!networkInfo || !networkInfo.chainId) {
        throw new Error(`Can not verify RPC url`);
    }
    return formatToHexWithoutPad(networkInfo.chainId);
};

const parseInfuraProjectIdFromRpcUrl = function (rpcUrl: string): string | undefined {
    const result = /infura\.io\/v3\/(\S+)/gm.exec(rpcUrl);
    return result?.[1] ?? undefined;
};

export const setupRpcUrlAndGetNetworks = async function (
    rpcUrl: string | undefined,
    isDev = false
): Promise<{ networks: NetworkConfig[]; defaultNetwork: string; defaultChainId: string }> {
    if (!rpcUrl) {
        throw new Error(`No RPC_URL env variable was provided`);
    }
    const chainId = await getChainIdFromRpcUrl(rpcUrl);
    const defaultNetwork = getNetworkTypeByChainId(chainId);
    const projectId = parseInfuraProjectIdFromRpcUrl(rpcUrl);
    if (projectId && defaultNetwork) {
        const networkConfigs = getDefaultNetworkConfigs(projectId, isDev);
        networkConfigs.map(setNetwork);
        return { networks: getNetworks(), defaultNetwork, defaultChainId: chainId };
    } else {
        const networkConfig = getCustomNetworkConfig(rpcUrl, chainId);
        setNetwork(networkConfig);
        return { networks: getNetworks(), defaultNetwork: networkConfig.type, defaultChainId: chainId };
    }
};
