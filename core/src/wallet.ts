import type { Notifier, WalletBalances } from './types';
import getProvider from './provider';
import BigNumber from './bignumber';
import getContract from './contracts';
import executeTransaction from './execute';
import { DAI_NUMBER_OF_DIGITS, ETH_NUMBER_OF_DIGITS, RAD, WAD_NUMBER_OF_DIGITS } from './constants/UNITS';

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

export const fetchVATbalanceDAI = async function (network: string, walletAddress: string): Promise<BigNumber> {
    const contract = await getContract(network, 'MCD_VAT');
    const radAmount = await contract.dai(walletAddress);
    return new BigNumber(radAmount._hex).div(RAD);
};

export const fetchWalletBalances = async function (network: string, walletAddress: string): Promise<WalletBalances> {
    return {
        walletETH: await fetchBalanceETH(network, walletAddress),
        walletDAI: await fetchBalanceDAI(network, walletAddress),
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
    const wadAmount = amount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed();
    await executeTransaction(network, 'MCD_JOIN_DAI', 'join', [walletAddress, wadAmount], notifier, true);
};

export const withdrawFromVAT = async function (
    network: string,
    walletAddress: string,
    amount: BigNumber,
    notifier?: Notifier
): Promise<void> {
    const wadAmount = amount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed();
    await executeTransaction(network, 'MCD_JOIN_DAI', 'exit', [walletAddress, wadAmount], notifier, true);
};
