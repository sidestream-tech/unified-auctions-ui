import getContract, { getContractAddressByName } from '../src/contracts';
import BigNumber from '../src/bignumber';
import { WAD_NUMBER_OF_DIGITS } from '../src/constants/UNITS';
import { EthereumProvider } from 'hardhat/types';
import { overwriteUintMapping, overwriteUintValue } from './hardhat';

export const causeDebt = async (
    network: string,
    provider: EthereumProvider,
    debtAmountDai: BigNumber = new BigNumber(10),
    mkrOnAuction: BigNumber = new BigNumber(1000),
    daiOnAuction: BigNumber = new BigNumber(1000)
) => {
    await overwriteQueuedDebt(network, provider, debtAmountDai);
    await ensureQueuedDebtEqual(network, debtAmountDai);
    await overwriteProtocolOwnDaiBalance(network, provider);
    await ensureDaiIsZero(network);
    await overwriteReceivedAmountMKR(network, provider, mkrOnAuction);
    await ensureReceivedAmountMKR(network, mkrOnAuction);
    await overwriteBidDaiAmount(network, provider, daiOnAuction);
    await ensureBidDaiHasValue(network, daiOnAuction);
    await startDebtAuction(network);
};

const overwriteQueuedDebt = async (network: string, provider: EthereumProvider, debtAmountDai: BigNumber) => {
    await overwriteUintValue(network, provider, 'MCD_VOW', '0x5', debtAmountDai.shiftedBy(WAD_NUMBER_OF_DIGITS));
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

const overwriteProtocolOwnDaiBalance = async (network: string, provider: EthereumProvider) => {
    const daiOwnerAddress = await getContractAddressByName(network, 'MCD_VOW');
    await overwriteUintMapping(network, provider, 'MCD_VAT', '0x5', daiOwnerAddress, new BigNumber(0));
};

const overwriteReceivedAmountMKR = async (network: string, provider: EthereumProvider, amount: BigNumber) => {
    await overwriteUintValue(network, provider, 'MCD_VOW', '0x8', amount.shiftedBy(WAD_NUMBER_OF_DIGITS));
};

const ensureReceivedAmountMKR = async (network: string, expected: BigNumber) => {
    const contract = await getContract(network, 'MCD_VOW');
    const dumpAsHex = await contract.dump();
    const dump = new BigNumber(dumpAsHex._hex);
    if (dump.isEqualTo(expected.shiftedBy(WAD_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected Sin value ${dump.shiftedBy(-WAD_NUMBER_OF_DIGITS)}, expected ${expected}`);
};

const overwriteBidDaiAmount = async (network: string, provider: EthereumProvider, amount: BigNumber) => {
    await overwriteUintValue(network, provider, 'MCD_VOW', '0x9', amount.shiftedBy(WAD_NUMBER_OF_DIGITS));
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
