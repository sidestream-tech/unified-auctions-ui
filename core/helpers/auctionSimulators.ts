import getContract, { getContractAddressByName } from '../src/contracts';
import { TEST_NETWORK } from '../helpers/constants';
import BigNumber from '../src/bignumber';
import { DAI_NUMBER_OF_DIGITS, MKR_NUMBER_OF_DIGITS, RAD_NUMBER_OF_DIGITS } from '../src/constants/UNITS';
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

export const causeSurplus = async (
) => {
    // Sin
    await overwriteQueuedDebt(new BigNumber(1000));
    await ensureQueuedDebtEqual(new BigNumber(1000));

    // Ash
    await overwriteOnAuctionDebt(new BigNumber(1000));
    await ensureOnAuctionDebt(new BigNumber(1000))

    //sin
    await overwriteDebtQueueEntry(new BigNumber(2000));
    await ensureDebtQueueEntry(new BigNumber(2000))

    // vat.dai
    await overwriteProtocolOwnDaiBalance(new BigNumber(100000).shiftedBy(RAD_NUMBER_OF_DIGITS));
    await ensureDaiEquals(new BigNumber(100000))

    // bump
    await overwriteFlapFixedSlotSize(new BigNumber(10000))
    await ensureFlapFixedSlotSize(new BigNumber(10000))

    // hump
    await overwriteSurplusBuffer(new BigNumber(10000))
    await ensureSurplusBuffer(new BigNumber(10000))

    await startSurplusAuction();
}

const overwriteQueuedDebt = async (debtAmountDai: BigNumber) => {
    await overwriteUintValue('MCD_VOW', '0x5', debtAmountDai.shiftedBy(DAI_NUMBER_OF_DIGITS));
};

const overwriteOnAuctionDebt = async (debtAmountDai: BigNumber) => {
    await overwriteUintValue('MCD_VOW', '0x6', debtAmountDai.shiftedBy(DAI_NUMBER_OF_DIGITS));
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
const ensureOnAuctionDebt = async (expected: BigNumber) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VOW');
    const ashAsHex = await contract.Ash();
    const ash = new BigNumber(ashAsHex._hex);
    if (ash.isEqualTo(expected.shiftedBy(DAI_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected Ash value ${ash}, expected ${expected}`);
}

const overwriteDebtQueueEntry = async (value: BigNumber) => {
    const daiOwnerAddress = await getContractAddressByName(TEST_NETWORK, 'MCD_VOW');
    await overwriteUintMapping('MCD_VAT', '0x6', daiOwnerAddress, value.shiftedBy(DAI_NUMBER_OF_DIGITS));
}

const overwriteReceivedAmountMKR = async (amount: BigNumber) => {
    await overwriteUintValue('MCD_VOW', '0x8', amount.shiftedBy(MKR_NUMBER_OF_DIGITS));
};

const overwriteFlapFixedSlotSize = async (amount: BigNumber) => {
    await overwriteUintValue('MCD_VOW', '0xa', amount.shiftedBy(RAD_NUMBER_OF_DIGITS));
}
const ensureFlapFixedSlotSize = async (expected: BigNumber) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VOW');
    const bumpAsHex = await contract.bump();
    const bump = new BigNumber(bumpAsHex._hex);
    if (bump.isEqualTo(expected.shiftedBy(RAD_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected dump value ${bump.shiftedBy(-RAD_NUMBER_OF_DIGITS)}, expected ${expected}`);
}
const overwriteSurplusBuffer = async (amount: BigNumber) => {
    await overwriteUintValue('MCD_VOW', '0xb', amount.shiftedBy(RAD_NUMBER_OF_DIGITS));
}
const ensureSurplusBuffer = async (expected: BigNumber) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VOW');
    const humpAsHex = await contract.hump();
    const hump = new BigNumber(humpAsHex._hex);
    if (hump.isEqualTo(expected.shiftedBy(RAD_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected hump value ${hump.shiftedBy(-RAD_NUMBER_OF_DIGITS)}, expected ${expected}`);
}

const ensureReceivedAmountMKR = async (expected: BigNumber) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VOW');
    const dumpAsHex = await contract.dump();
    const dump = new BigNumber(dumpAsHex._hex);
    if (dump.isEqualTo(expected.shiftedBy(DAI_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected dump value ${dump.shiftedBy(-DAI_NUMBER_OF_DIGITS)}, expected ${expected}`);
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
    throw new Error(`Unexpected dump value ${dump.shiftedBy(-DAI_NUMBER_OF_DIGITS)}, expected ${expected}`);
};

const ensureDaiIsZero = async () => {
    const vatContract = await getContract(TEST_NETWORK, 'MCD_VAT');
    const daiOwnerAddress = await getContractAddressByName(TEST_NETWORK, 'MCD_VOW');
    const balance = await vatContract.dai(daiOwnerAddress);
    if (balance._hex !== '0x00') {
        throw new Error(`Expected 0 balance, but the balance is ${balance._hex}`);
    }
};

const ensureDaiEquals = async (expectedDai: BigNumber) => {
    const vatContract = await getContract(TEST_NETWORK, 'MCD_VAT');
    const daiOwnerAddress = await getContractAddressByName(TEST_NETWORK, 'MCD_VOW');
    const balanceHex = await vatContract.dai(daiOwnerAddress);
    const balance = new BigNumber(balanceHex._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS)
    if (!balance.eq(expectedDai)) {
        throw new Error(`Unexpected amount of dai: found ${balance.toFixed()}, expected: ${expectedDai.toFixed()}`)
    }
};

const startDebtAuction = async () => {
    const vow = await getContract(TEST_NETWORK, 'MCD_VOW', true);
    await vow.flop();
};

const startSurplusAuction = async () => {
    const vow = await getContract(TEST_NETWORK, 'MCD_VOW', true);
    await vow.flap();
};

const ensureDebtQueueEntry = async (expectedDai: BigNumber) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VAT');
    const owner = await getContract(TEST_NETWORK, 'MCD_VOW');
    const sinAsHex = await contract.sin(owner.address);
    const sin = new BigNumber(sinAsHex._hex);
    if (sin.isEqualTo(expectedDai.shiftedBy(DAI_NUMBER_OF_DIGITS))) {
        return;
    }
    throw new Error(`Unexpected sin value ${sin.shiftedBy(-DAI_NUMBER_OF_DIGITS)}, expected ${expectedDai}`);
}
