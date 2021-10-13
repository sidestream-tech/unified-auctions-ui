import getMaker from './maker';
import getWallet from './wallet';
import trackTransaction from './tracker';

export const authorizeWallet = async function (revoke = false): Promise<void> {
    const maker = await getMaker();
    const joinDaiAddress = maker.service('smartContract').getContract('MCD_JOIN_DAI').address;
    const vatContract = maker.service('smartContract').getContract('MCD_VAT');
    const transaction = revoke ? vatContract.nope(joinDaiAddress) : vatContract.hope(joinDaiAddress);
    return trackTransaction(transaction, maker);
};

export const authorizeCollateral = async function (collateralType: string, revoke = false): Promise<void> {
    const maker = await getMaker();
    const clipperAddress = maker.service('liquidation')._clipperContractByIlk(collateralType).address;
    const vatContract = maker.service('smartContract').getContract('MCD_VAT');
    const transaction = revoke ? vatContract.nope(clipperAddress) : vatContract.hope(clipperAddress);
    return trackTransaction(transaction, maker);
};

export const getWalletAuthorizationStatus = async function (): Promise<boolean> {
    const maker = await getMaker();
    const joinDaiAddress = maker.service('smartContract').getContract('MCD_JOIN_DAI').address;
    const authorizationStatus = await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .can(getWallet().address, joinDaiAddress);
    return authorizationStatus.toNumber() === 1;
};

export const getCollateralAuthorizationStatus = async function (collateralType: string): Promise<boolean> {
    const maker = await getMaker();
    const clipperAddress = maker.service('liquidation')._clipperContractByIlk(collateralType).address;
    const authorizationStatus = await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .can(getWallet().address, clipperAddress);
    return authorizationStatus.toNumber() === 1;
};
