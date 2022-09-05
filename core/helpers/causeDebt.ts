import getContract, { getContractAddressByName } from '../src/contracts';
import { TEST_NETWORK } from '../helpers/constants';
import BigNumber from '../src/bignumber';
import { DAI_NUMBER_OF_DIGITS, MKR_NUMBER_OF_DIGITS } from '../src/constants/UNITS';
import { overwriteUintMapping, overwriteUintValue } from './hardhat';

export const causeDebt = async (
    debtAmountDai: BigNumber = new BigNumber(10),
    mkrOnAuction: BigNumber = new BigNumber(1000),
    daiOnAuction: BigNumber = new BigNumber(1000)
) => {
    await overwriteQueuedDebt(debtAmountDai);
    await ensureQueuedDebtEqual(debtAmountDai);
    await overwriteProtocolOwnDaiBalance(new BigNumber(0));
    await ensureDaiIsZero();
    await overwriteReceivedAmountMKR(mkrOnAuction);
    await ensureReceivedAmountMKR(mkrOnAuction);
    await overwriteBidDaiAmount(daiOnAuction);
    await ensureBidDaiHasValue(daiOnAuction);
    await startDebtAuction();
};

const overwriteQueuedDebt = async (debtAmountDai: BigNumber) => {
    await overwriteUintValue('MCD_VOW', '0x5', debtAmountDai.shiftedBy(DAI_NUMBER_OF_DIGITS));
};

const ensureQueuedDebtEqual = async (expected: BigNumber) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VOW');
    const sinAsHex = await contract.Sin();
    const sin = new BigNumber(sinAsHex._hex);
    if (sin.isEqualTo(expected.shiftedBy(DAI_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected Sin value ${sin}, expected ${expected}`);
};

const overwriteProtocolOwnDaiBalance = async (amount: BigNumber) => {
    const daiOwnerAddress = await getContractAddressByName(TEST_NETWORK, 'MCD_VOW');
    await overwriteUintMapping('MCD_VAT', '0x5', daiOwnerAddress, amount);
};

const overwriteReceivedAmountMKR = async (amount: BigNumber) => {
    await overwriteUintValue('MCD_VOW', '0x8', amount.shiftedBy(MKR_NUMBER_OF_DIGITS));
};

const ensureReceivedAmountMKR = async (expected: BigNumber) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VOW');
    const dumpAsHex = await contract.dump();
    const dump = new BigNumber(dumpAsHex._hex);
    if (dump.isEqualTo(expected.shiftedBy(MKR_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected Sin value ${dump.shiftedBy(-MKR_NUMBER_OF_DIGITS)}, expected ${expected}`);
};

const overwriteBidDaiAmount = async (amount: BigNumber) => {
    await overwriteUintValue('MCD_VOW', '0x9', amount.shiftedBy(DAI_NUMBER_OF_DIGITS));
};

const ensureBidDaiHasValue = async (expected: BigNumber) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VOW');
    const dumpAsHex = await contract.sump();
    const dump = new BigNumber(dumpAsHex._hex);
    if (dump.isEqualTo(expected.shiftedBy(DAI_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected Sin value ${dump.shiftedBy(-DAI_NUMBER_OF_DIGITS)}, expected ${expected}`);
};

const ensureDaiIsZero = async () => {
    const vatContract = await getContract(TEST_NETWORK, 'MCD_VAT');
    const daiOwnerAddress = await getContractAddressByName(TEST_NETWORK, 'MCD_VOW');
    const balance = await vatContract.dai(daiOwnerAddress);
    if (balance._hex !== '0x00') {
        throw new Error(`Expected 0 balance, but the balance is ${balance._hex}`);
    }
};

const startDebtAuction = async () => {
    const vow = await getContract(TEST_NETWORK, 'MCD_VOW', true);
    await vow.flop();
};
