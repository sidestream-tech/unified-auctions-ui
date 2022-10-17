import hre from 'hardhat';
import { ethers } from 'ethers';
import getContract, { getContractAddressByName, getErc20Contract } from '../src/contracts';
import BigNumber from '../src/bignumber';
import { EthereumProvider } from 'hardhat/types';
import { formatToHex, formatToHexWithoutPad } from './format';
import { pad32, concat, stripZeros } from './hex';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { createWalletFromPrivateKey } from '../src/signer';
import {
    HARDHAT_PRIVATE_KEY,
    LOCAL_RPC_URL,
    TEST_NETWORK,
    REMOTE_RPC_URL,
    HARDHAT_PUBLIC_KEY,
} from '../helpers/constants';
import getProvider from '../src/provider';
import { DAI_NUMBER_OF_DIGITS, MKR_NUMBER_OF_DIGITS } from '../src/constants/UNITS';

export const generateMappingSlotAddress = (
    mappingStartSlot: string,
    key: string,
    languageFormat: 'vyper' | 'solidity' = 'solidity'
) => {
    if (languageFormat === 'solidity') {
        return stripZeros(ethers.utils.keccak256(concat(pad32(key), pad32(mappingStartSlot))));
    }
    return stripZeros(ethers.utils.keccak256(concat(pad32(mappingStartSlot), pad32(key))));
};

export const overwriteUintValueInAddress = async (
    address: string,
    slotAddress: string,
    newValue: BigNumber,
    provider: EthereumProvider = hre.network.provider
) => {
    const hexValue = formatToHex(newValue, 32);
    const storageToWrite = [address, slotAddress, hexValue];
    await provider.send('hardhat_setStorageAt', storageToWrite);
};

export const overwriteUintValue = async (
    contractName: string,
    slotAddress: string,
    newValue: BigNumber,
    provider: EthereumProvider = hre.network.provider
) => {
    const contractAddress = await getContractAddressByName(TEST_NETWORK, contractName);
    await overwriteUintValueInAddress(contractAddress, slotAddress, newValue, provider);
};

export const overwriteUintMapping = async (
    contractName: string,
    mappingSlotAddress: string,
    mappingKey: string,
    newValue: BigNumber,
    provider: EthereumProvider = hre.network.provider
) => {
    const slotAddress = generateMappingSlotAddress(mappingSlotAddress, mappingKey);
    await overwriteUintValue(contractName, slotAddress, newValue, provider);
};

export const overwriteUintMappingInAddress = async (
    contractAddress: string,
    mappingSlotAddress: string,
    mappingKey: string,
    newValue: BigNumber,
    provider: EthereumProvider = hre.network.provider,
    languageFormat: 'vyper' | 'solidity' = 'solidity'
) => {
    const slotAddress = generateMappingSlotAddress(mappingSlotAddress, mappingKey, languageFormat);
    await overwriteUintValueInAddress(contractAddress, slotAddress, newValue, provider);
};

export const overwriteUintTable = async (
    contractName: string,
    mappingSlotAddress: string,
    tableRowKey: string,
    tableColumnKey: string,
    newValue: BigNumber,
    provider: EthereumProvider = hre.network.provider
) => {
    const rowAddress = generateMappingSlotAddress(mappingSlotAddress, tableRowKey);
    await overwriteUintMapping(contractName, rowAddress, tableColumnKey, newValue, provider);
};

export const resetNetwork = async (
    blockNumber: number | undefined = undefined,
    rpcUrl: string | undefined = REMOTE_RPC_URL,
    provider: EthereumProvider = hre.network.provider
) => {
    if (!rpcUrl && !REMOTE_RPC_URL) {
        throw Error('Environment varialbe REMOTE_RPC_URL was not provided');
    }
    if (blockNumber) {
        console.info(`Forking at the block "${blockNumber}"`);
    } else {
        console.info('Forking at the latest block');
    }
    await provider.request({
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

export const createWalletForRpc = async (walletPrivateKey: string = HARDHAT_PRIVATE_KEY) => {
    await setupRpcUrlAndGetNetworks(LOCAL_RPC_URL);
    console.info(`New RPC endpoint has started on ${LOCAL_RPC_URL}`);
    const walletAddress = await createWalletFromPrivateKey(walletPrivateKey, TEST_NETWORK);
    console.info(`Using wallet with:\n\t - public key: ${walletAddress}\n\t - private key: ${walletPrivateKey}`);
    return hre.network.provider;
};

export const warpTime = async function (blocks = 20000, secondsBetweenBlocks = 270) {
    const provider = await getProvider(TEST_NETWORK);
    await provider.send('hardhat_mine', [formatToHexWithoutPad(blocks), formatToHexWithoutPad(secondsBetweenBlocks)]);
    return blocks * secondsBetweenBlocks;
};

export const resetNetworkAndSetupWallet = async function (
    blockNumber?: number,
    walletPrivateKey: string = HARDHAT_PRIVATE_KEY
) {
    await resetNetwork(blockNumber);
    const provider = await createWalletForRpc(walletPrivateKey);
    return provider;
};

export const addDaiToBalance = async (
    daiAmount: BigNumber = new BigNumber(100000),
    walletAddress: string = HARDHAT_PUBLIC_KEY
) => {
    const daiContract = await getContract(TEST_NETWORK, 'MCD_DAI', false);
    await overwriteUintMapping('MCD_DAI', '0x2', walletAddress, daiAmount.shiftedBy(DAI_NUMBER_OF_DIGITS));
    const daiBalanceHex = await daiContract.balanceOf(walletAddress);
    const daiBalance = new BigNumber(daiBalanceHex._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS);
    console.info(`New DAI balance: ${daiBalance}`);
};

export const addMkrToBalance = async (
    mkrAmount: BigNumber = new BigNumber(100000),
    walletAddress: string = HARDHAT_PUBLIC_KEY
) => {
    const mkrContract = await getContract(TEST_NETWORK, 'MCD_GOV', false);
    await overwriteUintMapping('MCD_GOV', '0x1', walletAddress, mkrAmount.shiftedBy(MKR_NUMBER_OF_DIGITS));
    const mkrBalanceHex = await mkrContract.balanceOf(walletAddress);
    const mkrBalance = new BigNumber(mkrBalanceHex._hex).shiftedBy(-MKR_NUMBER_OF_DIGITS);
    console.info(`New MKR balance: ${mkrBalance}`);
};

export const setCollateralInWallet = async (
    tokenAddress: string,
    slot: string,
    collateralAmount: BigNumber,
    decimals: number,
    provider?: EthereumProvider,
    languageFormat: 'solidity' | 'vyper' = 'solidity'
) => {
    const value = collateralAmount.shiftedBy(decimals);
    await overwriteUintMappingInAddress(tokenAddress, slot, HARDHAT_PUBLIC_KEY, value, provider, languageFormat);
};

const runSlotDiscoveryLoop = async (
    tokenAddress: string,
    contract: ethers.Contract,
    overwriteValue: BigNumber,
    initialValue: BigNumber,
    languageFormat: 'solidity' | 'vyper',
    loops = 100
) => {
    for (const i of Array.from(Array(loops).keys())) {
        const slot = ethers.utils.hexValue(i);
        await overwriteUintMappingInAddress(
            tokenAddress,
            slot,
            HARDHAT_PUBLIC_KEY,
            overwriteValue,
            undefined,
            languageFormat
        );

        const newBalanceHex = await contract.balanceOf(HARDHAT_PUBLIC_KEY);
        const newBalance = new BigNumber(newBalanceHex._hex);
        if (newBalance.eq(overwriteValue)) {
            // double check to make sure the value in the slot is not accidentally the same as the hardcoded one above
            await overwriteUintMappingInAddress(
                tokenAddress,
                slot,
                HARDHAT_PUBLIC_KEY,
                initialValue,
                undefined,
                languageFormat
            );
            const finalBalanceHex = await contract.balanceOf(HARDHAT_PUBLIC_KEY);
            const finalBalance = new BigNumber(finalBalanceHex._hex);
            if (finalBalance.eq(initialValue)) {
                return slot;
            }
        }
    }
    return null;
};

export const findERC20BalanceSlot = async (tokenAddress: string): Promise<[string, 'vyper' | 'solidity']> => {
    const contract = await getErc20Contract(TEST_NETWORK, tokenAddress);
    const balanceHex = await contract.balanceOf(HARDHAT_PUBLIC_KEY);
    const balance = new BigNumber(balanceHex._hex);
    const overwriteValue = balance.eq(0) ? new BigNumber(10) : new BigNumber(0);
    const discoverySolidity = await runSlotDiscoveryLoop(tokenAddress, contract, overwriteValue, balance, 'solidity');
    if (discoverySolidity) {
        return [discoverySolidity, 'solidity'];
    }
    const discoveryVyper = await runSlotDiscoveryLoop(tokenAddress, contract, overwriteValue, balance, 'vyper');
    if (discoveryVyper) {
        return [discoveryVyper, 'vyper'];
    }

    throw new Error(`Failed to find the slot of the balance for the token in address ${tokenAddress}`);
};
