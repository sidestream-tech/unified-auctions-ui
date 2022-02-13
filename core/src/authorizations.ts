import type { Notifier } from './types';
import getContract, { getContractAddressByName, getClipperNameByCollateralType } from './contracts';
import executeTransaction from './execute';
import memoizee from 'memoizee';

const AUTHORIZE_WALLET_CACHE_MS = 30 * 1000;

const _authorizeWallet = async function (network: string, revoke: boolean, notifier?: Notifier): Promise<string> {
    const joinDaiAddress = await getContractAddressByName(network, 'MCD_JOIN_DAI');
    const contractMethod = revoke ? 'nope' : 'hope';
    return executeTransaction(network, 'MCD_VAT', contractMethod, [joinDaiAddress], notifier);
};

export const authorizeWallet = memoizee(_authorizeWallet, {
    maxAge: AUTHORIZE_WALLET_CACHE_MS,
    promise: true,
    length: 3,
});

const _authorizeCollateral = async function (
    network: string,
    collateralType: string,
    revoke: boolean,
    notifier?: Notifier
): Promise<string> {
    const contractName = getClipperNameByCollateralType(collateralType);
    const clipperAddress = await getContractAddressByName(network, contractName);
    const contractMethod = revoke ? 'nope' : 'hope';
    return executeTransaction(network, 'MCD_VAT', contractMethod, [clipperAddress], notifier);
};

export const authorizeCollateral = memoizee(_authorizeCollateral, {
    maxAge: AUTHORIZE_WALLET_CACHE_MS,
    promise: true,
    length: 4,
});

export const getWalletAuthorizationStatus = async function (network: string, walletAddress: string): Promise<boolean> {
    const joinDaiAddress = await getContractAddressByName(network, 'MCD_JOIN_DAI');
    const contract = await getContract(network, 'MCD_VAT');
    const authorizationStatus = await contract.can(walletAddress, joinDaiAddress);
    return authorizationStatus.toNumber() === 1;
};

export const getCollateralAuthorizationStatus = async function (
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
