import { getCollateralConfigBySymbol } from './constants/COLLATERALS';
import { DAI_NUMBER_OF_DIGITS, MKR_NUMBER_OF_DIGITS } from './constants/UNITS';
import { fetchContractAddressByNetwork } from './addresses';

export const getTokenAddressByNetworkAndSymbol = async function (network: string, symbol: string): Promise<string> {
    let tokenName = symbol.toUpperCase();
    if (tokenName === 'DAI') {
        tokenName = 'MCD_DAI';
    }
    if (tokenName === 'MKR') {
        tokenName = 'MCD_GOV';
    }
    const address = await fetchContractAddressByNetwork(network, tokenName);
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
    if (tokenName === 'USDS') {
        return DAI_NUMBER_OF_DIGITS;
    }
    if (tokenName === 'MKR') {
        return MKR_NUMBER_OF_DIGITS;
    }
    if (tokenName === 'SKY') {
        return MKR_NUMBER_OF_DIGITS;
    }
    const collateral = getCollateralConfigBySymbol(tokenName);
    return collateral && collateral.decimals;
};
