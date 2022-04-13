import { ethers } from 'ethers';
import { getContractAddressByName } from '../../contracts';

export const UNISWAP_FEE = 3000; // denominated in hundredths of a bip

export const encodeRoute = async function (network: string, collateralSymbols: string[]): Promise<string> {
    const types = [] as string[];
    const values = [] as Array<string | number>;

    for (const collateralSymbol of collateralSymbols) {
        types.push('address');
        values.push(await getContractAddressByName(network, collateralSymbol));

        types.push('uint24');
        values.push(UNISWAP_FEE);
    }

    types.push('address');
    values.push(await getContractAddressByName(network, 'MCD_DAI'));
    return ethers.utils.solidityPack(types, values);
};
