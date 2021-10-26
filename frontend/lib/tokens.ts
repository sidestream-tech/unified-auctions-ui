import MainnetTokens from '@makerdao/dai-plugin-mcd/contracts/addresses/mainnet.json';
import KovanTokens from '@makerdao/dai-plugin-mcd/contracts/addresses/kovan.json';
import { getCollateralConfigBySymbol } from '~/lib/constants/COLLATERALS';
import { DAI_NUMBER_OF_DIGITS } from '~/lib/constants/UNITS';

export const getTokenAddressByNetworkAndSymbol = function (network: string, symbol: string): string {
    let tokenName = symbol.toUpperCase();
    if (tokenName === 'DAI') {
        tokenName = 'MCD_DAI';
    }
    let address;
    if (network === 'mainnet') {
        address = (MainnetTokens as Record<string, string | undefined>)[tokenName];
    }
    if (network === 'kovan') {
        address = (KovanTokens as Record<string, string | undefined>)[tokenName];
    }
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
