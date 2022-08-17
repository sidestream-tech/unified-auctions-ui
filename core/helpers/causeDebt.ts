import getContract, { getContractAddressByName } from '../src/contracts';
import BigNumber from '../src/bignumber';
import { WAD_NUMBER_OF_DIGITS } from '../src/constants/UNITS';
import { EthereumProvider } from 'hardhat/types';
import { ethers } from 'ethers';
import { formatToHex } from './format';

export const causeDebt = async (
    network: string,
    provider: EthereumProvider,
    debtAmountDai: BigNumber,
    mkrOnAuction: BigNumber,
    daiOnAuction: BigNumber
) => {
    await overwriteQueuedDebt(network, provider, debtAmountDai);
    await ensureQueuedDebtEqual(network, debtAmountDai);
    await overwriteProtocolOwnDaiBalance(network, provider);
    await ensureDaiIsZero(network);
    await overwriteLottedMkrAmount(network, provider, mkrOnAuction);
    await ensureLottedMkrHasValue(network, mkrOnAuction);
    await overwriteBidDaiAmount(network, provider, daiOnAuction);
    await ensureBidDaiHasValue(network, daiOnAuction);
    await startDebtAuction(network);
};

const overwriteValueInSlot = async (
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

const getMappingSlotAddress = (mappingStartSlot: string, key: string) => {
    return stripZeros(ethers.utils.keccak256(concat(pad32(key), pad32(mappingStartSlot))));
};

const overwriteQueuedDebt = async (network: string, provider: EthereumProvider, debtAmountDai: BigNumber) => {
    const newValue = formatToHex(debtAmountDai.shiftedBy(WAD_NUMBER_OF_DIGITS), 32);
    await overwriteValueInSlot(network, provider, 'MCD_VOW', '0x5', newValue);
};

const ensureQueuedDebtEqual = async (network: string, expected: BigNumber) => {
    const contract = await getContract(network, 'MCD_VOW');
    const sinAsHex = await contract.Sin();
    const sin = new BigNumber(sinAsHex._hex);
    if (sin.isEqualTo(expected.shiftedBy(WAD_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected Sin value ${sin}, expected ${expected}`);
};

const pad32 = (val: string) => {
    return ethers.utils.hexZeroPad(val, 32);
};

const concat = (prefix: string, postfix: string) => {
    return ethers.utils.concat([prefix, postfix]);
};

const stripZeros = (val: string) => {
    return ethers.utils.hexStripZeros(val);
};

const overwriteProtocolOwnDaiBalance = async (network: string, provider: EthereumProvider) => {
    const daiOwnerAddress = await getContractAddressByName(network, 'MCD_VOW');
    const slotAddress = getMappingSlotAddress('0x5', daiOwnerAddress);
    const newValue = pad32('0x0');
    await overwriteValueInSlot(network, provider, 'MCD_VAT', slotAddress, newValue);
};

const overwriteLottedMkrAmount = async (network: string, provider: EthereumProvider, amount: BigNumber) => {
    const newValue = formatToHex(amount.shiftedBy(WAD_NUMBER_OF_DIGITS), 32);
    await overwriteValueInSlot(network, provider, 'MCD_VOW', '0x8', newValue);
};

const ensureLottedMkrHasValue = async (network: string, expected: BigNumber) => {
    const contract = await getContract(network, 'MCD_VOW');
    const dumpAsHex = await contract.dump();
    const dump = new BigNumber(dumpAsHex._hex);
    if (dump.isEqualTo(expected.shiftedBy(WAD_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected Sin value ${dump.shiftedBy(-WAD_NUMBER_OF_DIGITS)}, expected ${expected}`);
};

const overwriteBidDaiAmount = async (network: string, provider: EthereumProvider, amount: BigNumber) => {
    const newValue = formatToHex(amount.shiftedBy(WAD_NUMBER_OF_DIGITS), 32);
    await overwriteValueInSlot(network, provider, 'MCD_VOW', '0x9', newValue);
};

const ensureBidDaiHasValue = async (network: string, expected: BigNumber) => {
    const contract = await getContract(network, 'MCD_VOW');
    const dumpAsHex = await contract.sump();
    const dump = new BigNumber(dumpAsHex._hex);
    if (dump.isEqualTo(expected.shiftedBy(WAD_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected Sin value ${dump.shiftedBy(-WAD_NUMBER_OF_DIGITS)}, expected ${expected}`);
};

const ensureDaiIsZero = async (network: string) => {
    const contract = await getContract(network, 'MCD_VAT');
    const daiOwnerAddress = await getContractAddressByName(network, 'MCD_VOW');
    const balance = await contract.dai(daiOwnerAddress);
    if (balance._hex !== '0x00') {
        throw new Error(`Expected 0 balance, but the balance is ${balance._hex}`);
    }
};

const startDebtAuction = async (network: string) => {
    const vow = await getContract(network, 'MCD_VOW', true);
    await vow.flop();
};
