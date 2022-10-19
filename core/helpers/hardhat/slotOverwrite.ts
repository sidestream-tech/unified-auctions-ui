import hre from 'hardhat';
import { ethers } from 'ethers';
import { getContractAddressByName } from '../../src/contracts';
import BigNumber from '../../src/bignumber';
import { EthereumProvider } from 'hardhat/types';
import { formatToHex } from '../format';
import { pad32, concat, stripZeros } from '../hex';
import { TEST_NETWORK, HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
import { CollateralType } from '../../src/types';
import { getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import { findERC20BalanceSlot } from './balance';

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
const isOverwrittenBalanceEqual = async (contract: ethers.Contract, oldBalance: BigNumber) => {
    const overwrittenBalanceHex = await contract.balanceOf(HARDHAT_PUBLIC_KEY);
    const overwrittenBalance = new BigNumber(overwrittenBalanceHex._hex);
    return overwrittenBalance.eq(oldBalance);
};
export const runSlotDiscoveryLoop = async (
    tokenAddress: string,
    contract: ethers.Contract,
    overwriteValue: BigNumber,
    initialValue: BigNumber,
    languageFormat: 'solidity' | 'vyper',
    loops = 100
) => {
    for (const i of Array.from(Array(loops).keys())) {
        const slot = ethers.utils.hexValue(i);
        const slotValueBeforeEdit = new BigNumber(await hre.ethers.provider.getStorageAt(tokenAddress, slot));
        await overwriteUintMappingInAddress(
            tokenAddress,
            slot,
            HARDHAT_PUBLIC_KEY,
            overwriteValue,
            undefined,
            languageFormat
        );

        let isSlotFound = false;
        if (await isOverwrittenBalanceEqual(contract, overwriteValue)) {
            // double check to make sure the value in the slot is not accidentally the same as the hardcoded one above
            await overwriteUintMappingInAddress(
                tokenAddress,
                slot,
                HARDHAT_PUBLIC_KEY,
                initialValue,
                undefined,
                languageFormat
            );
            if (await isOverwrittenBalanceEqual(contract, initialValue)) {
                isSlotFound = true;
            }
        }
        // cleanup
        await overwriteUintMappingInAddress(
            tokenAddress,
            slot,
            HARDHAT_PUBLIC_KEY,
            slotValueBeforeEdit,
            undefined,
            languageFormat
        );
        if (isSlotFound) {
            return slot;
        }
    }
    return null;
};

export const determineBalanceSlot = async (
    collateralType: CollateralType
): Promise<[string, 'vyper' | 'solidity'] | [null, null]> => {
    console.info('Determining balance slot...');
    const collateralConfig = getCollateralConfigByType(collateralType);
    const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    try {
        const [slot, languageFormat] = await findERC20BalanceSlot(tokenContractAddress);
        console.info(
            `Balance slot is ${slot}, language format is ${languageFormat}, contract address is ${tokenContractAddress}`
        );
        return [slot, languageFormat];
    } catch (e) {
        if (
            e instanceof Error &&
            e.message.startsWith('Failed to find the slot of the balance for the token in address ')
        ) {
            return [null, null];
        }
        throw e;
    }
};
