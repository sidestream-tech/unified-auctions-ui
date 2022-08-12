import getContract, { getContractAddressByName } from '../src/contracts';
import BigNumber from '../src/bignumber';
import { WAD_NUMBER_OF_DIGITS } from '../src/constants/UNITS';
import { EthereumProvider } from 'hardhat/types';
import { ethers } from 'ethers';

export const causeDebt = async (
    network: string,
    provider: EthereumProvider,
    debtAmountDai: BigNumber,
    mkrOnAuction: BigNumber,
    daiOnAuction: BigNumber
) => {
    await overwriteSin(network, provider, debtAmountDai);
    await ensureSinEqual(network, debtAmountDai);
    await overwriteDai(network, provider);
    await ensureDaiIsZero(network);
    await overwriteLotMkrAmount(network, provider, mkrOnAuction);
    await ensureLotMkrHasValue(network, mkrOnAuction);
    await overwriteBidDaiAmount(network, provider, daiOnAuction);
    await ensureBidDaiHasValue(network, daiOnAuction);
    await kickFlop(network);
};

const overwriteSin = async (network: string, provider: EthereumProvider, debtAmountDai: BigNumber) => {
    const contract_address = await getContractAddressByName(network, 'MCD_VOW');
    const slot_address = '0x5';
    const new_value = ethers.utils.hexZeroPad('0x' + debtAmountDai.shiftedBy(WAD_NUMBER_OF_DIGITS).toString(16), 32);
    const storageToWrite = [contract_address, slot_address, new_value];
    await provider.send('hardhat_setStorageAt', storageToWrite);
};

const ensureSinEqual = async (network: string, expected: BigNumber) => {
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

const overwriteDai = async (network: string, provider: EthereumProvider) => {
    const contract_address = await getContractAddressByName(network, 'MCD_VAT');
    const daiOwnerAddress = await getContractAddressByName(network, 'MCD_VOW');
    const slot_address = stripZeros(ethers.utils.keccak256(concat(pad32(daiOwnerAddress), pad32('0x5'))));
    const new_value = pad32('0x0');
    const storageToWrite = [contract_address, slot_address, new_value];
    await provider.send('hardhat_setStorageAt', storageToWrite);
};

const overwriteLotMkrAmount = async (network: string, provider: EthereumProvider, amount: BigNumber) => {
    const contract_address = await getContractAddressByName(network, 'MCD_VOW');
    const slot_address = '0x8';
    const new_value = ethers.utils.hexZeroPad('0x' + amount.shiftedBy(WAD_NUMBER_OF_DIGITS).toString(16), 32);
    const storageToWrite = [contract_address, slot_address, new_value];
    await provider.send('hardhat_setStorageAt', storageToWrite);
};

const ensureLotMkrHasValue = async (network: string, expected: BigNumber) => {
    const contract = await getContract(network, 'MCD_VOW');
    const dumpAsHex = await contract.dump();
    const dump = new BigNumber(dumpAsHex._hex);
    if (dump.isEqualTo(expected.shiftedBy(WAD_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected Sin value ${dump.shiftedBy(-WAD_NUMBER_OF_DIGITS)}, expected ${expected}`);
};

const overwriteBidDaiAmount = async (network: string, provider: EthereumProvider, amount: BigNumber) => {
    const contract_address = await getContractAddressByName(network, 'MCD_VOW');
    const slot_address = '0x9';
    const new_value = ethers.utils.hexZeroPad('0x' + amount.shiftedBy(WAD_NUMBER_OF_DIGITS).toString(16), 32);
    const storageToWrite = [contract_address, slot_address, new_value];
    await provider.send('hardhat_setStorageAt', storageToWrite);
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

const kickFlop = async (network: string) => {
    const vow = await getContract(network, 'MCD_VOW', true);
    await vow.flop();
};
