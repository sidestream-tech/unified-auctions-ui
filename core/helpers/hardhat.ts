import { getContractAddressByName } from '../src/contracts';
import BigNumber from '../src/bignumber';
import { EthereumProvider } from 'hardhat/types';
import { ethers } from 'ethers';
import { formatToHex } from './format';
import { pad32, concat, stripZeros } from './hex';
import hre from 'hardhat';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { createWalletFromPrivateKey } from '../src/signer';
import { LOCAL_RPC_URL, NETWORK, REMOTE_RPC_URL } from '../helpers/constants';
import getProvider from '../src/provider';

function checkRpcUrl() {
    if (!REMOTE_RPC_URL) {
        throw Error('Environment varialbe REMOTE_RPC_URL was not provided');
    }
}

export const overwriteValueInSlot = async (
    network: string,
    provider: EthereumProvider,
    contractName: string,
    slotAddress: string,
    newValue: string
) => {
    const contractAddress = await getContractAddressByName(network, contractName);
    const storageToWrite = [contractAddress, slotAddress, newValue];
    await provider.send('hardhat_setStorageAt', storageToWrite);
};

export const generateMappingSlotAddress = (mappingStartSlot: string, key: string) => {
    return stripZeros(ethers.utils.keccak256(concat(pad32(key), pad32(mappingStartSlot))));
};

export const overwriteUintValue = async (
    network: string,
    provider: EthereumProvider,
    contractName: string,
    slotAddress: string,
    value: BigNumber
) => {
    const newValue = formatToHex(value, 32);
    await overwriteValueInSlot(network, provider, contractName, slotAddress, newValue);
};

export const overwriteUintMapping = async (
    network: string,
    provider: EthereumProvider,
    contractName: string,
    mappingSlotAddress: string,
    mappingKey: string,
    newValue: BigNumber
) => {
    const slotAddress = generateMappingSlotAddress(mappingSlotAddress, mappingKey);
    await overwriteUintValue(network, provider, contractName, slotAddress, newValue);
};

export const resetNetwork = async (blockNumber: number, rpcUrl: string | undefined = REMOTE_RPC_URL) => {
    checkRpcUrl();

    await hre.network.provider.request({
        method: 'hardhat_reset',
        params: [
            {
                forking: {
                    jsonRpcUrl: rpcUrl,
                    blockNumber: blockNumber,
                },
            },
        ],
    });
};

export const createWalletForRpc = async (signerPrivateKey: string, network: string = NETWORK) => {
    await setupRpcUrlAndGetNetworks(LOCAL_RPC_URL);
    await createWalletFromPrivateKey(signerPrivateKey, network);
    return hre.network.provider;
};

export const warpTime = async function (network: string, blocks = 20000, secondsBetweenBlocks = 270) {
    const provider = await getProvider(network);
    await provider.send('hardhat_mine', [`0x${blocks.toString(16)}`, `0x${secondsBetweenBlocks.toString(16)}`]);
    return blocks * secondsBetweenBlocks;
};

export const resetBlockchainFork = async function (
    blockNumber: number,
    signerPrivateKey: string,
    network: string = NETWORK,
    rpcUrl: string | undefined = REMOTE_RPC_URL
) {
    checkRpcUrl();
    await resetNetwork(blockNumber, rpcUrl);
    const provider = await createWalletForRpc(signerPrivateKey, network);
    return provider;
};
