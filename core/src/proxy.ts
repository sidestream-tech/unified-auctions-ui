import { giveAllowanceToAddress } from './authorizations';
import { getCollateralConfigByType } from './constants/COLLATERALS';
import getContract from './contracts';
import extractEventFromTransaction from './helpers/extractEventFromTransaction';
import getSigner from './signer';
import { CollateralType } from './types';
import BigNumber from './bignumber';

export const createProxy = async (network: string, proxyOwnerAddress: string) => {
    const proxyFactoryContract = await getContract(network, 'PROXY_FACTORY', true);
    const transaction = await proxyFactoryContract['build(address)'](proxyOwnerAddress);
    const events = await extractEventFromTransaction(
        transaction,
        'Created(address,address,address,address)',
        proxyFactoryContract.interface
    );
    const proxyAddress = events[0].args.proxy;
    return proxyAddress;
};

export const createProxyAndGiveAllowance = async (
    network: string,
    collateralType: CollateralType,
    allowanceAmount: BigNumber
) => {
    const collateralSymbol = getCollateralConfigByType(collateralType).symbol;
    const proxyAddress = await createProxy(network, await (await getSigner(network)).getAddress());
    await giveAllowanceToAddress(network, collateralSymbol, proxyAddress, allowanceAmount);
    return proxyAddress;
};
