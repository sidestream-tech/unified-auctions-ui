import { getContractAddressByName } from '../src/contracts';
import BigNumber from '../src/bignumber';
import { EthereumProvider } from 'hardhat/types';
import { ethers } from 'ethers';
import { formatToHex } from './format';

const pad32 = (val: string) => {
    return ethers.utils.hexZeroPad(val, 32);
};

const concat = (prefix: string, postfix: string) => {
    return ethers.utils.concat([prefix, postfix]);
};

const stripZeros = (val: string) => {
    return ethers.utils.hexStripZeros(val);
};

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
    mappingStartSlot: string,
    key: string,
    newValue: BigNumber
) => {
    const slotAddress = generateMappingSlotAddress(mappingStartSlot, key);
    await overwriteUintValue(network, provider, contractName, slotAddress, newValue);
};
