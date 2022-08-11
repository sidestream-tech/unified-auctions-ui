import getContract, { getContractAddressByName } from '../../src/contracts';
import BigNumber from '../../src/bignumber';
import { RAD_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import { EthereumProvider } from 'hardhat/types';
import hre from 'hardhat';

export const causeDebt = async (network: string, provider: EthereumProvider) => {
    await overwriteSin(network, provider);
    await ensureSinEqual(network, '9000000000000000000000000000000000000000000000');
    await overwriteDai(network, provider);
    await ensureDaiIsZero(network);
    await kickFlop(network);
};

export const overwriteSin = async (network: string, provider: EthereumProvider) => {
    const contract_address = await getContractAddressByName(network, 'MCD_VOW');
    const slot_address = '0x5';
    const new_value = hre.ethers.utils.hexZeroPad(
        '0x' + new BigNumber(9).shiftedBy(RAD_NUMBER_OF_DIGITS).toString(16),
        32
    );
    const storageToWrite = [contract_address, slot_address, new_value];
    await provider.send('hardhat_setStorageAt', storageToWrite);
};

export const ensureSinEqual = async (network: string, expected: string) => {
    const contract = await getContract(network, 'MCD_VOW');
    const sinAsHex = await contract.Sin();
    const sin = new BigNumber(sinAsHex._hex).toFixed();
    if (sin === expected) {
        return;
    }
    throw new Error(`Unexpected Sin value ${sin}, expected ${expected}`);
};

const pad32 = (val: string) => {
    return hre.ethers.utils.hexZeroPad(val, 32);
};

const concat = (prefix: string, postfix: string) => {
    return hre.ethers.utils.concat([prefix, postfix]);
};

const stripZeros = (val: string) => {
    return hre.ethers.utils.hexStripZeros(val);
};

export const overwriteDai = async (network: string, provider: EthereumProvider) => {
    const contract_address = await getContractAddressByName(network, 'MCD_VAT');
    const daiOwnerAddress = await getContractAddressByName(network, 'MCD_VOW');
    const slot_address = stripZeros(hre.ethers.utils.keccak256(concat(pad32(daiOwnerAddress), pad32('0x5'))));
    const new_value = pad32('0x0');
    const storageToWrite = [contract_address, slot_address, new_value];
    await provider.send('hardhat_setStorageAt', storageToWrite);
};

export const ensureDaiIsZero = async (network: string) => {
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
