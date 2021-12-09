import { getCollateralConfigBySymbol } from './constants/COLLATERALS';
import { DAI_NUMBER_OF_DIGITS } from './constants/UNITS';
import { getTokenContractsByNetwork } from './contracts';

export const getTokenAddressByNetworkAndSymbol = function (network: string, symbol: string): string {
    let tokenName = symbol.toUpperCase();
    if (tokenName === 'DAI') {
        tokenName = 'MCD_DAI';
    }
    const address = getTokenContractsByNetwork(network)[tokenName];
    if (!address) {
        throw new Error(`"${symbol}" token is not found on the "${network}" network`);
    }
    return address;
};

export const getTokenDecimalsBySymbol = function (symbol: string): number {
    const tokenName = symbol.toUpperCase();
    if (tokenName === 'DAI') {
        return DAI_NUMBER_OF_DIGITS;
    }
    const collateral = getCollateralConfigBySymbol(tokenName);
    return collateral && collateral.decimals;
};
