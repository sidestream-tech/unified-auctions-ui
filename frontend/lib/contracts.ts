import mainnetLiquidationsContracts from 'dai-monorepo/packages/dai-plugin-liquidations/contracts/addresses/mainnet.json';
import kovanLiquidationsContracts from 'dai-monorepo/packages/dai-plugin-liquidations/contracts/addresses/kovan.json';
import mainnetTokensContracts from '@makerdao/dai-plugin-mcd/contracts/addresses/mainnet.json';
import kovanTokensContracts from '@makerdao/dai-plugin-mcd/contracts/addresses/kovan.json';

export const getLiquidationsContractsByNetwork = function (network: string): Record<string, string | undefined> {
    if (network === 'mainnet') {
        return mainnetLiquidationsContracts;
    }
    if (network === 'kovan') {
        return kovanLiquidationsContracts;
    }
    throw new Error(`No contracts were found for the network "${network}"`);
};

export const getTokenContractsByNetwork = function (network: string): Record<string, string | undefined> {
    if (network === 'mainnet') {
        return mainnetTokensContracts;
    }
    if (network === 'kovan') {
        return kovanTokensContracts;
    }
    throw new Error(`No contracts were found for the network "${network}"`);
};
