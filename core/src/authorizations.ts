import type { Notifier } from './types';
import getContract, { getContractAddressByName, getClipperNameByCollateralType } from './contracts';
import executeTransaction from './execute';
import BigNumber from './bignumber';
import { DAI_NUMBER_OF_DIGITS, MAX, MKR_NUMBER_OF_DIGITS } from './constants/UNITS';
import cache from './helpers/cache';

const _authorizeWallet = async function (
    network: string,
    walletAddress: string,
    revoke: boolean,
    notifier?: Notifier
): Promise<string> {
    walletAddress; // so the memoizee cache is invalidated if another address is used
    const joinDaiAddress = await getContractAddressByName(network, 'MCD_JOIN_DAI');
    const contractMethod = revoke ? 'nope' : 'hope';
    const transaction = await executeTransaction(network, 'MCD_VAT', contractMethod, [joinDaiAddress], { notifier });
    await getWalletAuthorizationStatus.clear();
    return transaction;
};

export const authorizeWallet = cache(_authorizeWallet, {
    promise: true,
    length: 3,
});

const _authorizeCollateral = async function (
    network: string,
    walletAddress: string,
    collateralType: string,
    revoke: boolean,
    notifier?: Notifier
): Promise<string> {
    walletAddress; // so the memoizee cache is invalidated if another address is used
    const contractName = getClipperNameByCollateralType(collateralType);
    const clipperAddress = await getContractAddressByName(network, contractName);
    const contractMethod = revoke ? 'nope' : 'hope';
    const transaction = await executeTransaction(network, 'MCD_VAT', contractMethod, [clipperAddress], { notifier });
    await getCollateralAuthorizationStatus.clear();
    return transaction;
};

export const authorizeCollateral = cache(_authorizeCollateral, {
    promise: true,
    length: 4,
});

const _getWalletAuthorizationStatus = async function (network: string, walletAddress: string): Promise<boolean> {
    const joinDaiAddress = await getContractAddressByName(network, 'MCD_JOIN_DAI');
    const contract = await getContract(network, 'MCD_VAT');
    const authorizationStatus = await contract.can(walletAddress, joinDaiAddress);
    return authorizationStatus.toNumber() === 1;
};

export const getWalletAuthorizationStatus = cache(_getWalletAuthorizationStatus, {
    promise: true,
    length: 2,
});

const _getCollateralAuthorizationStatus = async function (
    network: string,
    collateralType: string,
    walletAddress: string
): Promise<boolean> {
    const contractName = getClipperNameByCollateralType(collateralType);
    const clipperAddress = await getContractAddressByName(network, contractName);
    const contract = await getContract(network, 'MCD_VAT');
    const authorizationStatus = await contract.can(walletAddress, clipperAddress);
    return authorizationStatus.toNumber() === 1;
};

export const getCollateralAuthorizationStatus = cache(_getCollateralAuthorizationStatus, {
    promise: true,
    length: 3,
});

export const setAllowanceAmountDAI = async function (
    network: string,
    walletAddress: string,
    amount?: BigNumber | string,
    notifier?: Notifier
): Promise<string> {
    walletAddress; // so the memoizee cache is invalidated if another address is used
    const joinDaiAddress = await getContractAddressByName(network, 'MCD_JOIN_DAI');
    const amountRaw = amount ? new BigNumber(amount).shiftedBy(DAI_NUMBER_OF_DIGITS).toFixed(0) : MAX.toFixed(0);
    return await executeTransaction(network, 'MCD_DAI', 'approve', [joinDaiAddress, amountRaw], { notifier });
};

export const fetchAllowanceAmountDAI = async function (network: string, walletAddress: string): Promise<BigNumber> {
    const joinDaiAddress = await getContractAddressByName(network, 'MCD_JOIN_DAI');
    const DAIcontract = await getContract(network, 'MCD_DAI');
    const allowanceRaw = await DAIcontract.allowance(walletAddress, joinDaiAddress);
    return new BigNumber(allowanceRaw._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS);
};

const _authorizeSurplus = async function (
    network: string,
    walletAddress: string,
    revoke: boolean,
    notifier?: Notifier
): Promise<string> {
    walletAddress; // so the memoizee cache is invalidated if another address is used
    const flapperAddress = await getContractAddressByName(network, 'MCD_FLAP');
    const contractMethod = revoke ? 'nope' : 'hope';
    const transaction = await executeTransaction(network, 'MCD_VAT', contractMethod, [flapperAddress], { notifier });
    await getWalletAuthorizationStatus.clear();
    return transaction;
};

const _getSurplusAuthorizationStatus = async function (network: string, walletAddress: string): Promise<boolean> {
    const flapperAddress = await getContractAddressByName(network, 'MCD_FLAP');
    const contract = await getContract(network, 'MCD_VAT');
    const authorizationStatus = await contract.can(walletAddress, flapperAddress);
    return authorizationStatus.toNumber() === 1;
};

export const getSurplusAuthorizationStatus = cache(_getSurplusAuthorizationStatus, {
    promise: true,
    length: 2,
});

export const authorizeSurplus = cache(_authorizeSurplus, {
    promise: true,
    length: 3,
});

export const setAllowanceAmountMKR = async function (
    network: string,
    walletAddress: string,
    amount?: BigNumber,
    notifier?: Notifier
): Promise<string> {
    walletAddress; // so the memoizee cache is invalidated if another address is used
    const flapAddress = await getContractAddressByName(network, 'MCD_FLAP');
    const amountRaw = amount ? amount.shiftedBy(MKR_NUMBER_OF_DIGITS).toFixed(0) : MAX.toFixed(0);
    return await executeTransaction(network, 'MCD_GOV', 'approve(address,uint256)', [flapAddress, amountRaw], {
        notifier,
    });
};

export const fetchAllowanceAmountMKR = async function (network: string, walletAddress: string): Promise<BigNumber> {
    const flapAddress = await getContractAddressByName(network, 'MCD_FLAP');
    const MKRContract = await getContract(network, 'MCD_GOV');
    const allowanceRaw = await MKRContract.allowance(walletAddress, flapAddress);
    return new BigNumber(allowanceRaw._hex).shiftedBy(-MKR_NUMBER_OF_DIGITS);
};
