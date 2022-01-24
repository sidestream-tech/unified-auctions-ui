import type { Notifier } from './types';
import getMaker from './maker';
import trackTransaction from './tracker';
import getContract, { getContractAddressByName } from './contracts';

export const authorizeWallet = async function (
    network: string,
    revoke: boolean,
    notifier?: Notifier
): Promise<string> {
    const joinDaiAddress = await getContractAddressByName(network, 'MCD_JOIN_DAI');
    const contractMethod = revoke ? 'nope' : 'hope';
    const contract = await getContract(network, 'MCD_VAT');
    return trackTransaction(contract[contractMethod](joinDaiAddress), notifier);
};

export const authorizeCollateral = async function (
    collateralType: string,
    revoke: boolean,
    notifier?: Notifier
): Promise<string> {
    const maker = await getMaker();
    const clipperAddress = maker.service('liquidation')._clipperContractByIlk(collateralType).address;
    const vatContract = maker.service('smartContract').getContract('MCD_VAT');
    const transaction = revoke ? vatContract.nope(clipperAddress) : vatContract.hope(clipperAddress);
    return trackTransaction(transaction, notifier);
};

export const getWalletAuthorizationStatus = async function (network: string, walletAddress: string): Promise<boolean> {
    const joinDaiAddress = await getContractAddressByName(network, 'MCD_JOIN_DAI');
    const contract = await getContract(network, 'MCD_VAT');
    const authorizationStatus = await contract.can(walletAddress, joinDaiAddress);
    return authorizationStatus.toNumber() === 1;
};

export const getCollateralAuthorizationStatus = async function (
    collateralType: string,
    walletAddress: string
): Promise<boolean> {
    const maker = await getMaker();
    const clipperAddress = maker.service('liquidation')._clipperContractByIlk(collateralType).address;
    const authorizationStatus = await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .can(walletAddress, clipperAddress);
    return authorizationStatus.toNumber() === 1;
};
