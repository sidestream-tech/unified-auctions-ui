import type { CollateralType, Notifier, WalletBalances } from './types';
import { ethers } from 'ethers';
import getProvider from './provider';
import BigNumber from './bignumber';
import getContract, { getJoinNameByCollateralType } from './contracts';
import executeTransaction from './execute';
import {
    DAI_NUMBER_OF_DIGITS,
    ETH_NUMBER_OF_DIGITS,
    RAD_NUMBER_OF_DIGITS,
    WAD_NUMBER_OF_DIGITS,
    MKR_NUMBER_OF_DIGITS,
} from './constants/UNITS';
import COLLATERALS from './constants/COLLATERALS';

export const fetchBalanceETH = async function (network: string, walletAddress: string): Promise<BigNumber> {
    const provider = await getProvider(network);
    const rawAmount = await provider.getBalance(walletAddress);
    return new BigNumber(rawAmount._hex).shiftedBy(-ETH_NUMBER_OF_DIGITS);
};

export const fetchBalanceDAI = async function (network: string, walletAddress: string): Promise<BigNumber> {
    const contract = await getContract(network, 'MCD_DAI');
    const rawAmount = await contract.balanceOf(walletAddress);
    return new BigNumber(rawAmount._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS);
};

export const fetchBalanceMKR = async function (network: string, walletAddress: string): Promise<BigNumber> {
    const contract = await getContract(network, 'MCD_GOV');
    const rawAmount = await contract.balanceOf(walletAddress);
    return new BigNumber(rawAmount._hex).shiftedBy(-MKR_NUMBER_OF_DIGITS);
};

export const fetchVATbalanceDAI = async function (network: string, walletAddress: string): Promise<BigNumber> {
    const contract = await getContract(network, 'MCD_VAT');
    const radAmount = await contract.dai(walletAddress);
    const walletVatDAI = new BigNumber(radAmount._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    // Since withdrawal only accepts WAD numbers, we round balance to avoid confusion, more info:
    // https://github.com/sidestream-tech/unified-auctions-ui/pull/149/#issuecomment-1077844563
    return walletVatDAI.decimalPlaces(WAD_NUMBER_OF_DIGITS, BigNumber.ROUND_DOWN);
};

export const fetchCollateralVatBalance = async function (
    network: string,
    walletAddress: string,
    collateralType: string
): Promise<BigNumber> {
    const contract = await getContract(network, 'MCD_VAT');
    const encodedCollateralType = ethers.utils.formatBytes32String(collateralType);
    const wadAmount = await contract.gem(encodedCollateralType, walletAddress);
    const decimals = COLLATERALS[collateralType].decimals
    return new BigNumber(wadAmount._hex).shiftedBy(-decimals);
};

export const fetchWalletBalances = async function (network: string, walletAddress: string): Promise<WalletBalances> {
    return {
        walletETH: await fetchBalanceETH(network, walletAddress),
        walletDAI: await fetchBalanceDAI(network, walletAddress),
        walletMKR: await fetchBalanceMKR(network, walletAddress),
        walletVatDAI: await fetchVATbalanceDAI(network, walletAddress),
        walletLastUpdatedDate: new Date(),
    };
};

export const depositToVAT = async function (
    network: string,
    walletAddress: string,
    amount: BigNumber,
    notifier?: Notifier
): Promise<void> {
    const wadAmount = amount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0, BigNumber.ROUND_DOWN);
    await executeTransaction(network, 'MCD_JOIN_DAI', 'join', [walletAddress, wadAmount], {
        notifier,
        confirmTransaction: true,
    });
};

export const withdrawFromVAT = async function (
    network: string,
    walletAddress: string,
    collateralType: CollateralType,
    amount: BigNumber,
    notifier?: Notifier
): Promise<void> {
    const decimals = COLLATERALS[collateralType].decimals;
    const wadAmount = amount.shiftedBy(decimals).toFixed(0, BigNumber.ROUND_DOWN);
    await executeTransaction(network, 'MCD_JOIN_DAI', 'exit', [walletAddress, wadAmount], {
        notifier,
        confirmTransaction: true,
    });
};

export const withdrawCollateralFromVat = async function (
    network: string,
    walletAddress: string,
    collateralType: CollateralType,
    amount: BigNumber | undefined,
    notifier?: Notifier
): Promise<void> {
    const withdrawalAmount = amount || (await fetchCollateralVatBalance(network, walletAddress, collateralType));
    const decimals = COLLATERALS[collateralType].decimals;
    const withdrawalAmountWad = withdrawalAmount.shiftedBy(decimals).toFixed(0, BigNumber.ROUND_DOWN);
    const contractName = getJoinNameByCollateralType(collateralType);
    await executeTransaction(network, contractName, 'exit', [walletAddress, withdrawalAmountWad], {
        notifier,
        confirmTransaction: true,
    });
};

export const depositCollateralToVat = async function (
    network: string,
    walletAddress: string,
    collateralType: string,
    amount: BigNumber,
    notifier?: Notifier
): Promise<void> {
    const depositWad = amount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0, BigNumber.ROUND_DOWN);
    const contractName = getJoinNameByCollateralType(collateralType);
    await executeTransaction(network, contractName, 'join', [walletAddress, depositWad], {
        notifier,
        confirmTransaction: true,
    });
};
