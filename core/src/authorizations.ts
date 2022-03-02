import type { Notifier } from './types';
import getContract, { getContractAddressByName, getClipperNameByCollateralType } from './contracts';
import executeTransaction from './execute';
import memoizee from 'memoizee';
import getSigner from './signer';

const _authorizeWallet = async function (network: string, revoke: boolean, notifier?: Notifier): Promise<string> {
    const signer = await getSigner(network);
    const joinDaiAddress = await getContractAddressByName(network, 'MCD_JOIN_DAI');
    const contractMethod = revoke ? 'nope' : 'hope';
    const transaction = await executeTransaction(network, 'MCD_VAT', contractMethod, [joinDaiAddress], notifier);
    await getWalletAuthorizationStatus.delete(network, await signer.getAddress());
    return transaction;
};

export const authorizeWallet = memoizee(_authorizeWallet, {
    promise: true,
    length: 2,
});

const _authorizeCollateral = async function (
    network: string,
    collateralType: string,
    revoke: boolean,
    notifier?: Notifier
): Promise<string> {
    const signer = await getSigner(network);
    const contractName = getClipperNameByCollateralType(collateralType);
    const clipperAddress = await getContractAddressByName(network, contractName);
    const contractMethod = revoke ? 'nope' : 'hope';
    const transaction = await executeTransaction(network, 'MCD_VAT', contractMethod, [clipperAddress], notifier);
    await getCollateralAuthorizationStatus.delete(network, collateralType, await signer.getAddress());
    return transaction;
};

export const authorizeCollateral = memoizee(_authorizeCollateral, {
    promise: true,
    length: 3,
});

const _getWalletAuthorizationStatus = async function (network: string, walletAddress: string): Promise<boolean> {
    const joinDaiAddress = await getContractAddressByName(network, 'MCD_JOIN_DAI');
    const contract = await getContract(network, 'MCD_VAT');
    const authorizationStatus = await contract.can(walletAddress, joinDaiAddress);
    return authorizationStatus.toNumber() === 1;
};

export const getWalletAuthorizationStatus = memoizee(_getWalletAuthorizationStatus, {
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

export const getCollateralAuthorizationStatus = memoizee(_getCollateralAuthorizationStatus, {
    promise: true,
    length: 3,
});
